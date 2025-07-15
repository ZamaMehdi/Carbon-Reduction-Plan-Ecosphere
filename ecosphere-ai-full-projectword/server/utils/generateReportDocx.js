const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  ImageRun,
  Media,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle
} = require('docx');

const { getReportingPeriod, generateYearOnYearNarrative } = require('../shared/narratives');

function paragraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...options })],
    spacing: { after: 200 },
  });
}

function heading(text, level = HeadingLevel.HEADING_2) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { after: 200 },
  });
}

function bufferFromBase64(base64) {
  const match = base64.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 image format');
  return Buffer.from(match[1], 'base64');
}

async function generateReportDocx(data, scopePieChart) {
    if (scopePieChart) {
        data.scopePieChart = scopePieChart;
      }      
  const doc = new Document({
    creator: 'Ecosphere AI',
    title: `Carbon Reduction Report - ${data.organisationName}`,
    description: 'Carbon Reduction and Emissions Report',
    sections: [
      {
        children: [
          heading('Carbon Reduction Report'),

          heading('🗓️ Publication Date'),
          paragraph(`Date: ${data.publicationDate || 'N/A'}`),

          heading('🏢 Organisation Summary'),
          paragraph(
            `The organisation, ${data.organisationName}, with Company Number ${data.companyNumber}, currently operates from its head office at ${data.currentAddress}, and its registered office is at ${data.registeredAddress}.`
          ),
          paragraph(
            `It also operates ${data.branches.length} branch${data.branches.length > 1 ? 'es' : ''}:`
          ),
          ...data.branches.map((b, i) =>
            paragraph(
              `Branch ${i + 1} (${b.name}) located at ${b.address}, with ${b.financial || 0}% financial control and ${b.operational || 0}% operational control.`
            )
          ),

          heading('📘 Reporting Period Summary'),
          paragraph(getReportingPeriod(Number(data.endMonth), Number(data.endYear))),

          heading('📆 Previous Reporting Periods'),
          ...((data.previousPeriods || []).map((p) =>
            paragraph(`Year: ${p.year} – Scope 1: ${p.scope1} | Scope 2: ${p.scope2} | Scope 3: ${p.scope3}`)
          )),

          heading('📋 Current Emission Inputs'),
          paragraph('Scope 1 – Fleet:'),
          paragraph(`  - Average Car: ${data.fleetAveCarKm || 0} km`),
          paragraph(`  - Delivery Vans: ${data.fleetDeliveryVansKm || 0} km`),

          paragraph('Scope 2 – Electricity:'),
          paragraph(`  - Electricity Usage: ${data.electricityKWH || 0} kWh`),

          paragraph('Scope 3 – Business Travel:'),
          paragraph(`  - Car: ${data.businessTravelCarKm || 0} km`),
          paragraph(`  - Bus: ${data.businessTravelBusKm || 0} km`),
          paragraph(`  - Train: ${data.businessTravelTrainKm || 0} km`),
          paragraph(`  - Taxi: ${data.businessTravelTaxiKm || 0} km`),

          paragraph('Scope 3 – Office Commute:'),
          paragraph(`  - Car: ${data.officeCommuteCarKm || 0} km`),
          paragraph(`  - Bus: ${data.officeCommuteBusKm || 0} km`),
          paragraph(`  - Train: ${data.officeCommuteTrainKm || 0} km`),
          paragraph(`  - Taxi: ${data.officeCommuteTaxiKm || 0} km`),

          paragraph('Scope 3 – Others:'),
          paragraph(`  - Home Working: ${data.homeWorkingHours || 0} hours`),
          paragraph(`  - Hotel Nights: ${data.hotelNights || 0} nights`),

          heading('📊 Current Emissions Summary'),
          paragraph(`Scope 1: ${data.scope1} tCO2e`),
          paragraph(`Scope 2: ${data.scope2} tCO2e`),
          paragraph(`Scope 3: ${data.scope3} tCO2e`),
          paragraph(`Total Emissions: ${data.totalEmissions} tCO2e`),

          heading('📈 Year-on-Year Comparison'),
          paragraph(generateYearOnYearNarrative([
            ...(data.previousPeriods || []).map(p => ({
              year: p.year,
              scope1: Number(p.scope1) || 0,
              scope2: Number(p.scope2) || 0,
              scope3: Number(p.scope3) || 0,
              total: (Number(p.scope1) || 0) + (Number(p.scope2) || 0) + (Number(p.scope3) || 0),
            })),
            {
              year: parseInt(data.endYear),
              scope1: Number(data.scope1),
              scope2: Number(data.scope2),
              scope3: Number(data.scope3),
              total: Number(data.totalEmissions),
            }
          ])),

          heading('📉 Emissions Reduction Plan'),
          paragraph(`Net Zero Target Year: ${data.netZeroYear}`),
          paragraph(`Projected 2030 Emissions: ${data.projected2030Emissions} tCO2e`),
          paragraph(`Reduction by 2030: ${data.reduction2030}%`),
          paragraph(`Projected Net Zero Emissions: ${data.projectedNetZeroEmissions} tCO2e`),
          paragraph(`Reduction by Net Zero: ${data.reductionNetZero}%`),

          ...(data.scopePieChart ? [
            heading('📊 Scope Emissions Pie Chart'),
            new Paragraph({
              children: [
                new ImageRun({
                  data: bufferFromBase64(data.scopePieChart),
                  transformation: { width: 400, height: 300 },
                }),
              ],
            }),
          ] : []),

          // Year-over-Year Comparison Chart
          ...(data.yearComparisonChart ? [
              heading('📈 Year-on-Year Comparison Chart'),
               new Paragraph({
              children: [
              new ImageRun({
             data: bufferFromBase64(data.yearComparisonChart),
             transformation: { width: 500, height: 300 },
               }),
             ],
             }),
          ] : []),

          ...(data.reductionPlanChart ? [
            heading('📉 Reduction Plan Chart'),
            new Paragraph({
              children: [
                new ImageRun({
                  data: bufferFromBase64(data.reductionPlanChart),
                  transformation: { width: 500, height: 300 },
                }),
              ],
            }),
          ] : []),

          new Paragraph({ children: [new PageBreak()] }),
        ],
              
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(os.tmpdir(), `Carbon_Report_${Date.now()}.docx`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function generateCompleteReportDocx(data, chartImages = {}) {
  const doc = new Document({
    creator: 'Ecosphere AI',
    title: `Complete Carbon Reduction Report - ${data.organisationName}`,
    description: 'Comprehensive Carbon Reduction and Emissions Report',
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in twips (21cm)
              height: 16838, // A4 height in twips (29.7cm)
            },
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Title Page
          new Paragraph({
            text: 'Carbon Reduction Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400, before: 400 },
          }),

          new Paragraph({
            text: `${data.organisationName || 'Organization'}`,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: `Reporting Period: ${data.endYear}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // Table of Contents Placeholder
          heading('Table of Contents'),
          paragraph('1. Publication Date'),
          paragraph('2. Organisation Details'),
          paragraph('3. Reporting Period Summary'),
          paragraph('4. Previous Reporting Periods'),
          paragraph('5. Current Emission Inputs'),
          paragraph('6. Current Emissions Summary'),
          paragraph('7. Emissions Breakdown Charts'),
          paragraph('8. Year-on-Year Comparison'),
          paragraph('9. Emissions Reduction Plan'),
          paragraph('10. Declaration'),

          new Paragraph({ children: [new PageBreak()] }),

          // Publication Date
          heading('🗓️ Publication Date'),
          paragraph(`Date: ${data.publicationDate || new Date().toLocaleDateString()}`),

          // Organisation Details
          heading('🏢 Organisation Details'),
          paragraph(`Name: ${data.organisationName || 'N/A'}`),
          paragraph(`Company Number: ${data.companyNumber || 'N/A'}`),
          paragraph(`Current Address: ${data.currentAddress || 'N/A'}`),
          paragraph(`Registered Address: ${data.registeredAddress || 'N/A'}`),

          // Branches
          ...(data.branches && data.branches.length > 0 ? [
            heading('Branches', HeadingLevel.HEADING_3),
            ...data.branches.map((branch, i) => [
              paragraph(`Branch ${i + 1}: ${branch.name || 'N/A'}`),
              paragraph(`Address: ${branch.address || 'N/A'}`),
              paragraph(`Financial Control: ${branch.financial || 0}%`),
              paragraph(`Operational Control: ${branch.operational || 0}%`),
            ]).flat(),
          ] : []),

          // Reporting Period Summary
          heading('📘 Reporting Period Summary'),
          paragraph(getReportingPeriod(Number(data.endMonth), Number(data.endYear))),

          // Previous Reporting Periods
          heading('📆 Previous Reporting Periods'),
          ...(data.previousPeriods && data.previousPeriods.length > 0 ? [
            paragraph(`Is this your first Carbon Reduction Plan: ${data.isFirstPlan ? 'Yes' : 'No'}`),
            ...data.previousPeriods.map((period, index) => [
              paragraph(`Year: ${period.year} (ending ${period.endMonthNameRaw || 'N/A'} ${period.year})`),
              paragraph(`Scope 1: ${Number(period.scope1 || 0).toFixed(2)} tCO₂e`),
              paragraph(`Scope 2: ${Number(period.scope2 || 0).toFixed(2)} tCO₂e`),
              paragraph(`Scope 3: ${Number(period.scope3 || 0).toFixed(2)} tCO₂e`),
            ]).flat(),
          ] : [
            paragraph('No previous reporting periods available.')
          ]),

          // Current Emission Inputs Table
          heading('📋 Current Emission Inputs'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Category', bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Source', bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] }),
                ],
              }),
              // Scope 1
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Scope 1' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Fleet - Average Car' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.fleetAveCarKm || 0} km` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Fleet - Delivery Vans' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.fleetDeliveryVansKm || 0} km` })] }),
                ],
              }),
              // Scope 2
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Scope 2' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Electricity Usage' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.electricityKWH || 'N/A'} kWh` })] }),
                ],
              }),
              // Scope 3 - Business Travel
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Scope 3\nBusiness Travel' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Average Car' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.businessTravelCarKm || 0} km` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Bus' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.businessTravelBusKm || 0} km` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Train' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.businessTravelTrainKm || 0} km` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Taxi' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.businessTravelTaxiKm || 0} km` })] }),
                ],
              }),
              // Scope 3 - Office Commute
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Scope 3\nOffice Commute' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Average Car' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.officeCommuteCarKm || 0} km` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Bus' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.officeCommuteBusKm || 0} km` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Train' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.officeCommuteTrainKm || 0} km` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Taxi' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.officeCommuteTaxiKm || 0} km` })] }),
                ],
              }),
              // Scope 3 - Others
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Scope 3\nOthers' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Home Working' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.homeWorkingHours || 0} hours` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Hotel Stays' })] }),
                  new TableCell({ children: [new Paragraph({ text: `${data.hotelNights || 0} nights` })] }),
                ],
              }),
            ],
          }),

          // Current Emissions Summary
          heading('📊 Current Emissions Summary'),
          paragraph(`Reporting Year: ${data.endYear}`),
          paragraph(`Scope 1: ${Number(data.scope1 || 0).toFixed(2)} tCO₂e`),
          paragraph(`Scope 2: ${Number(data.scope2 || 0).toFixed(2)} tCO₂e`),
          paragraph(`Scope 3: ${Number(data.scope3 || 0).toFixed(2)} tCO₂e`),
          paragraph(`Total Emissions: ${Number(data.totalEmissions || 0).toFixed(2)} tCO₂e`),

          // Charts Section
          heading('📊 Emissions Breakdown Charts'),

          // Scope Pie Chart
          ...(chartImages.scopeChartImage ? [
            heading('Scope Emissions Breakdown', HeadingLevel.HEADING_3),
            new Paragraph({
              children: [
                new ImageRun({
                  data: bufferFromBase64(chartImages.scopeChartImage),
                  transformation: { width: 400, height: 300 },
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ] : []),

          // Year Comparison Chart
          ...(chartImages.yearComparisonChartImage ? [
            heading('Year-over-Year Comparison', HeadingLevel.HEADING_3),
            new Paragraph({
              children: [
                new ImageRun({
                  data: bufferFromBase64(chartImages.yearComparisonChartImage),
                  transformation: { width: 500, height: 300 },
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ] : []),

          // Year-on-Year Narrative
          ...(data.previousPeriods && data.previousPeriods.length > 0 ? [
            heading('📈 Year-on-Year Analysis'),
            paragraph(generateYearOnYearNarrative([
              ...data.previousPeriods.map(p => ({
                year: p.year,
                scope1: Number(p.scope1) || 0,
                scope2: Number(p.scope2) || 0,
                scope3: Number(p.scope3) || 0,
                total: (Number(p.scope1) || 0) + (Number(p.scope2) || 0) + (Number(p.scope3) || 0),
              })),
              {
                year: parseInt(data.endYear),
                scope1: Number(data.scope1) || 0,
                scope2: Number(data.scope2) || 0,
                scope3: Number(data.scope3) || 0,
                total: Number(data.totalEmissions) || 0,
              }
            ])),
          ] : []),

          // Emissions Reduction Plan
          ...(data.totalEmissions && data.netZeroYear && data.annualReductionPercentage ? [
            heading('📉 Emissions Reduction Plan'),
            paragraph(`Net Zero Target Year: ${data.netZeroYear}`),
            paragraph(`Annual Reduction Percentage: ${data.annualReductionPercentage}%`),
            paragraph(`Current Emissions: ${Number(data.totalEmissions).toFixed(2)} tCO₂e`),
            
            // Reduction Plan Chart
            ...(chartImages.reductionPlanChartImage ? [
              heading('Projected Emissions Reduction', HeadingLevel.HEADING_3),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: bufferFromBase64(chartImages.reductionPlanChartImage),
                    transformation: { width: 500, height: 300 },
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ] : []),

            // Reduction Plan Table
            heading('Reduction Plan Table', HeadingLevel.HEADING_3),
            (() => {
              const currentEmissions = Number(data.totalEmissions);
              const netZeroYear = Number(data.netZeroYear);
              const annualReduction = Number(data.annualReductionPercentage) / 100;
              const yearNow = new Date().getFullYear();
              
              if (isNaN(currentEmissions) || isNaN(netZeroYear) || isNaN(annualReduction) || 
                  currentEmissions <= 0 || netZeroYear <= yearNow || annualReduction <= 0) {
                return paragraph('Reduction plan data not available.');
              }

              const years = [];
              const emissions = [];
              let currentEmission = currentEmissions;

              for (let y = yearNow; y <= netZeroYear; y++) {
                years.push(y);
                emissions.push(parseFloat(currentEmission.toFixed(2)));
                currentEmission *= (1 - annualReduction);
              }

              const tableRows = [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'Year', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Projected Emissions (tCO₂e)', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Reduction (%)', bold: true })] }),
                  ],
                }),
              ];

              years.forEach((year, i) => {
                const reductionPercent = i === 0 ? 0 : ((currentEmissions - emissions[i]) / currentEmissions) * 100;
                tableRows.push(
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: year.toString() })] }),
                      new TableCell({ children: [new Paragraph({ text: emissions[i].toFixed(2) })] }),
                      new TableCell({ children: [new Paragraph({ text: i === 0 ? '0.0%' : `${reductionPercent.toFixed(1)}%` })] }),
                    ],
                  })
                );
              });

              return new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              });
            })(),
          ] : []),

          // Declaration
          new Paragraph({ children: [new PageBreak()] }),
          heading('Declaration and Sign Off'),
          paragraph('This Carbon Reduction Plan has been completed in accordance with PPN 006 and associated guidance and reporting standard for Carbon Reduction Plans. Emissions have been reported and recorded in accordance with the published reporting standard for Carbon Reduction Plans and the GHG Reporting Protocol corporate standard and uses the appropriate government emission conversion factors for greenhouse gas company reporting. Scope 1 and Scope 2 emissions have been reported in accordance with SECR requirements (where required), and the required subset of Scope 3 emissions have been reported in accordion with the published reporting standard for Carbon Reduction Plans and the Corporate Value Chain (Scope 3) Standard. This Carbon Reduction Plan has been reviewed and signed off by the board of directors (or equivalent management body).'),
          
          paragraph('Signed on behalf of the supplier:'),
          paragraph('Name: _________________________________'),
          paragraph('Date: _________________________________'),

          // Submission Info
          paragraph(`Report submitted on: ${data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A'}`),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = { generateReportDocx, generateCompleteReportDocx };