import React, {useMemo, useRef, forwardRef, useImperativeHandle} from 'react';
import Markdown from 'react-markdown';
import ScopePieChart from '../components/Charts/ScopePieChart';
import YearComparisonChart from '../components/Charts/YearComparisonChart';
import ReductionPlanResults from '../components/ReductionPlanResults'; // Adjust the path if needed
import { getReportingPeriod } from '../utils/getReportingPeriod';


function generateYearOnYearNarrative(allYearsData) {
  if (!allYearsData || allYearsData.length < 2) {
    return 'Enter historical data to see year-on-year comparison insights.';
  }

  const sortedData = [...allYearsData].sort((a, b) => a.year - b.year);
  const baselineYearData = sortedData[0];
  const latestYearData = sortedData[sortedData.length - 1];

  let narrative = `The year-on-year comparison provides insight into your organisation's emissions trends. Your **Baseline Year** is **${baselineYearData.year}**, with total emissions of **${parseFloat(baselineYearData.total).toFixed(2)} tCO2e** (Scope 1: ${parseFloat(baselineYearData.scope1).toFixed(2)}, Scope 2: ${parseFloat(baselineYearData.scope2).toFixed(2)}, Scope 3: ${parseFloat(baselineYearData.scope3).toFixed(2)}).\n\n`;

  const totalChange = latestYearData.total - baselineYearData.total;
  const totalChangePercentage = baselineYearData.total !== 0 ? (totalChange / baselineYearData.total) * 100 : 0;

  narrative += `Compared to the baseline, your total emissions in **${latestYearData.year}** are **${parseFloat(latestYearData.total).toFixed(2)} tCO2e**, a `;
  if (totalChangePercentage > 0) {
    narrative += `**${totalChangePercentage.toFixed(1)}% increase**`;
  } else if (totalChangePercentage < 0) {
    narrative += `**${Math.abs(totalChangePercentage).toFixed(1)}% reduction**`;
  } else {
    narrative += `**0.0% change**`;
  }
  narrative += `.\n\n\n\n`;

  narrative += `**Breakdown by Scope:**\n`;
  ['scope1', 'scope2', 'scope3'].forEach(scope => {
    const scopeLabel = scope === 'scope1' ? 'Scope 1' : scope === 'scope2' ? 'Scope 2' : 'Scope 3';
    const base = parseFloat(baselineYearData[scope]) || 0;
    const latest = parseFloat(latestYearData[scope]) || 0;
    const diff = latest - base;
    const pct = base !== 0 ? (diff / base) * 100 : 0;

    if (diff === 0) {
      narrative += `\n- **${scopeLabel}**: Remained constant at **${base.toFixed(2)} tCO2e**`;
    } else if (diff > 0) {
      narrative += `\n- **${scopeLabel}**: Increased by **${diff.toFixed(2)} tCO2e** (**+${pct.toFixed(1)}%**) from ${base.toFixed(2)} to ${latest.toFixed(2)}.`;
    } else {
      narrative += `\n- **${scopeLabel}**: Reduced by **${Math.abs(diff).toFixed(2)} tCO2e** (**${pct.toFixed(1)}%**) from ${base.toFixed(2)} to ${latest.toFixed(2)}.`;
    }
  });

  return narrative;
}




const ReportDisplay = forwardRef(({ data }, ref) => {
  if (!data) return <p>No data to display.</p>;

  const derivedBaselineYear = useMemo(() => {
    if (data.isFirstPlan) {
      return data.endYear || 'N/A';
    } else if (data.previousPeriods?.length > 0) {
      const years = data.previousPeriods.map(p => parseInt(p.year)).filter(y => !isNaN(y));
      return years.length ? Math.min(...years) : (data.endYear || 'N/A');
    } else {
      return data.endYear || 'N/A';
    }
  }, [data.isFirstPlan, data.endYear, data.previousPeriods]);

  const formatTCO2 = (val) => `${Number(val || 0).toFixed(2)} tCO₂e`;
  console.log('🔍 Submitted Report Data:', data);

   const pieChartRef = useRef();
   const yearComparisonChartRef = useRef();
   const reductionPlanChartRef = useRef();
   
  useImperativeHandle(ref, () => ({
    getScopeChartImage: () => pieChartRef.current?.toBase64Image?.(),
    getYearComparisonChartImage: () => yearComparisonChartRef.current?.toBase64Image?.(),
    getReductionPlanChartImage: () => reductionPlanChartRef.current?.toBase64Image?.()
  }));

  return (

    <div className="bg-white shadow p-6 rounded-lg space-y-6 border">

      <div>
      <h2 className="text-[22px] font-semibold mb-2">🗓️ Publication Date</h2>
      <p>Date: <span className="text-[18px] font-semibold">{data.publicationDate || 'N/A'}</span></p>
      </div>

      {/* 🔹 Organisation Info */} 
     <div className="text-[17px] bg-gray-50 p-2 rounded border mb-4">
        <h2 className="text-[22px] font-semibold mb-2">🏢 Organisation Details</h2>
  
        <div className="flex flex-wrap gap-20 items-center">
        <p>Name: <strong>{data.organisationName || 'N/A'}</strong></p>
        <p>Company Number: <span className="text-[17px] font-semibold">{data.companyNumber || 'N/A'}</span></p>
        </div>

         <p>Current Address: <span className="text-[17px] font-semibold">{data.currentAddress || 'N/A'}</span></p>
         <p>Registered Address: <span className="text-[17px] font-semibold"> {data.registeredAddress || 'N/A'}</span></p>

         {/* <p className="mb-4 text-gray-800 leading-relaxed">
         The organisation, <strong>{data.organisationName || 'N/A'}</strong>, with Company Number <strong>{data.companyNumber || 'N/A'}</strong>, 
         currently operates from its head office at <strong>{data.currentAddress || 'N/A'}</strong>, and its registered office is at <strong>{data.registeredAddress || 'N/A'}</strong>.
         </p> */}

         {/* 🔸 Branches in Table-Like Format */}
          {data.branches && Array.isArray(data.branches) && data.branches.length > 0 && (
          <div className="mt-2">
           <h3 className="text-lg font-semibold mb-2">Branches</h3>
        {data.branches.map((branch, i) => (
        <div key={i} className="bg-gray-50 p-2 rounded border mb-4">
          <p className="font-semibold text-purple-700 mb-2">Branch {i + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p><strong>Branch Name:</strong></p>
              <p>{branch.name || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Address:</strong></p>
              <p>{branch.address || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Financial Control (%):</strong></p>
              <p>{branch.financial || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Operational Control (%):</strong></p>
              <p>{branch.operational || 'N/A'}</p>
            </div>
          </div>
        </div>
       ))}
        {/* 🏢 Organisation Summary Narrative */}
  <p className=" text-gray-800 leading-relaxed mb-2 text-[17px]">
    The organisation, <strong>{data.organisationName || 'N/A'}</strong>, with Company Number <strong>{data.companyNumber || 'N/A'}</strong>, 
    currently operates from its head office at <strong>{data.currentAddress || 'N/A'}</strong>, and its registered office is at <strong>{data.registeredAddress || 'N/A'}</strong>.
  </p>

  {/* 🏬 Branch Summary Narrative */}
  {data.branches && Array.isArray(data.branches) && data.branches.length > 0 && (
    <div className="space-y-0 text-[17px]">
      <p className="text-gray-800 leading-relaxed">
        It also operates <strong>{data.branches.length}</strong> branch{data.branches.length > 1 ? 'es' : ''}:
      </p>
      {data.branches.map((branch, i) => (
        <p key={i} className="text-gray-700">
          <strong>Branch {i + 1}</strong> ({branch.name || 'N/A'}) located at <strong>{branch.address || 'N/A'}</strong>,
          with <strong>{branch.financial || 0}%</strong> financial control and <strong>{branch.operational || 0}%</strong> operational control.
        </p>
      ))}
    </div>
  )}
      </div>
  )}
  
 </div>
 
 {data.endMonth && data.endYear && (
  <div className="mt-8">
    <h2 className="text-[22px] font-semibold mb-2 text-black-700">📘 Reporting Period Summary</h2>
    <div className="text-[17px] bg-indigo-50 border border-indigo-200 p-4 rounded">
      <Markdown>
        {getReportingPeriod(Number(data.endMonth), Number(data.endYear))}
      </Markdown>
    </div>
  </div>
 )}
    
  {/* 🔁 Previous Reporting Periods */}
 {data.isFirstPlan !== undefined && (
  <div>
     <p><span className=" text-[18px]">
      Is this your first Carbon Reduction Plan?:<strong>{' '}
      {data.isFirstPlan ? 'Yes' : 'No'}</strong></span>
     </p>
     <h2 className="text-[22px] font-semibold mt-4 mb-2">📆 Previous Reporting Periods</h2>
    

     {!data.isFirstPlan && data.previousPeriods?.length > 0 && (
      <div className="space-y-4 mt-4">
        {data.previousPeriods.map((period, index) => {
          const endMonthName = period.endMonthNameRaw || 'N/A';
          console.log('🔍 previousPeriods:', data.previousPeriods);

         return (
            <div key={index} className="p-4 bg-gray-50 border rounded">
              <h3 className="font-semibold text-purple-700">
                Year: {period.year} (ending {endMonthName} {period.year})
              </h3>
              <p><strong>Scope 1:</strong> {formatTCO2(period.scope1)}</p>
              <p><strong>Scope 2:</strong> {formatTCO2(period.scope2)}</p>
              <p><strong>Scope 3:</strong> {formatTCO2(period.scope3)}</p>
            </div>
          );
        })}
        <p className="text-[18x] text-gray-600">
  The earliest year entered is your <strong>Baseline Year: <span className="text-black">{derivedBaselineYear}</span></strong>
 </p>

      </div>
    )}
  </div>
 )}

 <div>
  <h2 className="text-[22px] font-semibold mb-4">📋 Current Emission Inputs</h2>
  <table className="w-full table-auto border border-gray-300 text-[17px]">
    <thead className="bg-gray-100">
      <tr>
        <th className="border px-4 py-2 text-left">Category</th>
        <th className="border px-4 py-2 text-left">Source</th>
        <th className="border px-4 py-2 text-left">Value</th>
      </tr>
    </thead>
    <tbody>
      

      {/* Scope 1 - Fleet */}
      <tr>
        <td className="border px-4 py-2" rowSpan={2}>Scope 1</td>
        <td className="border px-4 py-2">Fleet - Average Car</td>
        <td className="border px-4 py-2">{data.fleetAveCarKm || 0} km</td>
      </tr>
      <tr>
        <td className="border px-4 py-2">Fleet - Delivery Vans</td>
        <td className="border px-4 py-2">{data.fleetDeliveryVansKm || 0} km</td>
      </tr>

       {/* Scope 2 */}
       <tr>
        <td className="border px-4 py-2" rowSpan={1}>Scope 2</td>
        <td className="border px-4 py-2">Electricity Usage</td>
        <td className="border px-4 py-2">{data.electricityKWH || 'N/A'} kWh</td>
      </tr>

      {/* Scope 3 - Business Travel */}
      <tr>
        <td className="border px-4 py-2" rowSpan={4}>Scope 3<br />Business Travel</td>
        <td className="border px-4 py-2">Average Car</td>
        <td className="border px-4 py-2">{data.businessTravelCarKm || 0} km</td>
      </tr>
      <tr>
        <td className="border px-4 py-2">Bus</td>
        <td className="border px-4 py-2">{data.businessTravelBusKm || 0} km</td>
      </tr>
      <tr>
        <td className="border px-4 py-2">Train</td>
        <td className="border px-4 py-2">{data.businessTravelTrainKm || 0} km</td>
      </tr>
      <tr>
        <td className="border px-4 py-2">Taxi</td>
        <td className="border px-4 py-2">{data.businessTravelTaxiKm || 0} km</td>
      </tr>

      {/* Scope 3 - Office Commute */}
      <tr>
        <td className="border px-4 py-2" rowSpan={4}>Scope 3<br />Office Commute</td>
        <td className="border px-4 py-2">Average Car</td>
        <td className="border px-4 py-2">{data.officeCommuteCarKm || 0} km</td>
      </tr>
      <tr>
        <td className="border px-4 py-2">Bus</td>
        <td className="border px-4 py-2">{data.officeCommuteBusKm || 0} km</td>
      </tr>
      <tr>
        <td className="border px-4 py-2">Train</td>
        <td className="border px-4 py-2">{data.officeCommuteTrainKm || 0} km</td>
      </tr>
      <tr>
        <td className="border px-4 py-2">Taxi</td>
        <td className="border px-4 py-2">{data.officeCommuteTaxiKm || 0} km</td>
      </tr>

      {/* Other Inputs */}
      <tr>
        <td className="border px-4 py-2" rowSpan={2}>Scope 3<br />Others</td>
        <td className="border px-4 py-2">Home Working</td>
        <td className="border px-4 py-2">{data.homeWorkingHours || 0} hours</td>
      </tr>
      <tr>
        {/* <td className="border px-4 py-2">Scope 3</td> */}
        <td className="border px-4 py-2">Hotel Stays</td>
        <td className="border px-4 py-2">{data.hotelNights || 0} nights</td>
      </tr>
    </tbody>
  </table>
 </div>


      {/* 🔹 Emission Summary */}
      <div className='text-[17px]'>
        <h2 className="text-[22px] font-semibold mb-2 ">📊 Current Emissions Summary</h2>
        <p><strong>Reporting Year:</strong> {data.endYear}</p>
        <p><strong>Scope 1:</strong> {formatTCO2(data.scope1)}</p>
        <p><strong>Scope 2:</strong> {formatTCO2(data.scope2)}</p>
        <p><strong>Scope 3:</strong> {formatTCO2(data.scope3)}</p>
        <p><strong>Total Emissions:</strong> {formatTCO2(data.totalEmissions)}</p>
      </div>


 {data.financial && typeof data.financial === 'object' && (
  <div>
    <strong>Financial:</strong>
    <ul className="list-disc list-inside">
      {Object.entries(data.financial).map(([key, val]) => (
        <li key={key}>{key}: {val}</li>
      ))}
    </ul>
  </div>
 )}


     {/* 🔵 Scope Pie Chart */}
 {data.scope1 !== undefined && data.scope2 !== undefined && data.scope3 !== undefined && (
  <div className="mt-10">
    <h2 className="text-xl font-bold mb-2">🧩 Current Emissions Breakdown (Scope 1/2/3)</h2>
    <ScopePieChart
      ref={pieChartRef}
      scope1={data.scope1}
      scope2={data.scope2}
      scope3={data.scope3}
      isStatic={true}
    />
    
  </div>
  
 )}

 {data.previousPeriods && data.previousPeriods.length > 0 && (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-2 text-teal-700">📈 Year-on-Year Summary</h2>
    <div className="narrative-card bg-teal-50 border border-teal-300 p-4 rounded">
      <Markdown>{generateYearOnYearNarrative([
        ...data.previousPeriods.map(p => ({
          year: p.year,
          scope1: Number(p.scope1) || 0,
          scope2: Number(p.scope2) || 0,
          scope3: Number(p.scope3) || 0,
          total: (Number(p.scope1) || 0) + (Number(p.scope2) || 0) + (Number(p.scope3) || 0)
        })),
        {
          year: parseInt(data.endYear),
          scope1: Number(data.scope1) || 0,
          scope2: Number(data.scope2) || 0,
          scope3: Number(data.scope3) || 0,
          total: Number(data.totalEmissions) || 0
        }
      ])}</Markdown>
    </div>
   </div>
   )}

 {/* 🟠 Year Comparison Chart */}
 {data.previousPeriods && data.previousPeriods.length > 0 && (
  <div className="mt-10">
    <h2 className="text-xl font-bold mb-2">📊 Year-over-Year Comparison</h2>
    <YearComparisonChart
      ref={yearComparisonChartRef}
      years={[
        ...data.previousPeriods.map((p) => p.year),
        data.endYear
      ]}
      scope1Data={[
        ...data.previousPeriods.map((p) => p.scope1),
        data.scope1
      ]}
      scope2Data={[
        ...data.previousPeriods.map((p) => p.scope2),
        data.scope2
      ]}
      scope3Data={[
        ...data.previousPeriods.map((p) => p.scope3),
        data.scope3
      ]}
      isStatic={true}
    />
  </div>
 )}
 {/* 🔹 Emission Projections with Chart */}
 {data.totalEmissions && data.netZeroYear && data.annualReductionPercentage && (
  <div className="mt-10">
    <h2 className="text-xl font-bold mb-2 text-green-700">📉 Emissions Reduction Plan</h2>
    <ReductionPlanResults
      ref={reductionPlanChartRef}
      currentEmissions={parseFloat(data.totalEmissions)}
      netZeroYear={parseInt(data.netZeroYear)}
      annualReductionPercentage={parseFloat(data.annualReductionPercentage)}
    />
  </div>
 )}


   <p><strong>Submitted on:</strong> {data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A'}</p>

    </div>
    
  );
  
});

export default ReportDisplay;
