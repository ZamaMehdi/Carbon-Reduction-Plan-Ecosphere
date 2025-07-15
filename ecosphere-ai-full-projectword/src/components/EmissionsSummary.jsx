import React from 'react';
import ScopePieChart from './Charts/ScopePieChart';
import YearComparisonChart from './Charts/YearComparisonChart';
import Markdown from 'react-markdown';

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
    narrative += `**0.0% reduction**`;
  }
  narrative += `.\n\n---\n\n`;

  // Scope breakdowns as bullet points
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

const EmissionsSummary = ({ data }) => {
  const { scope1, scope2, scope3, totalEmissions, endYear, previousPeriods = [] } = data;

  // Combine previous periods and current year for the bar chart
  let allYearsData = [];
  if (previousPeriods && previousPeriods.length > 0) {
    allYearsData = [
      ...previousPeriods.map(p => ({
        year: p.year,
        scope1: Number(p.scope1) || 0,
        scope2: Number(p.scope2) || 0,
        scope3: Number(p.scope3) || 0,
        total: (Number(p.scope1) || 0) + (Number(p.scope2) || 0) + (Number(p.scope3) || 0)
      }))
    ];
  }
  if (totalEmissions > 0 && endYear) {
    allYearsData.push({
      year: parseInt(endYear),
      scope1: Number(scope1) || 0,
      scope2: Number(scope2) || 0,
      scope3: Number(scope3) || 0,
      total: Number(totalEmissions) || 0
    });
  }
  allYearsData.sort((a, b) => a.year - b.year);

  const labels = allYearsData.map(d => d.year);
  const scope1Data = allYearsData.map(d => d.scope1);
  const scope2Data = allYearsData.map(d => d.scope2);
  const scope3Data = allYearsData.map(d => d.scope3);

  const narrative = generateYearOnYearNarrative(allYearsData);

  return (
    <div className="section-card text-center">
      <h2 className="section-title-gradient" style={{backgroundImage: 'linear-gradient(90deg, #2dd4bf 0%, #3b82f6 100%)'}}>6. Current 12-Month Emissions</h2>
      <p className="text-4xl font-bold text-teal-600 mb-2">{totalEmissions.toFixed(2)}<span className="text-sm text-gray-600 ml-1 ">tCO₂e</span></p>
      <p className="text-s text-gray-600 mb-6">(Tonnes of Carbon Dioxide Equivalent)</p>
      
      <div className="print-hide mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emissions by Scope (tCO2e)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="summary-stat-card bg-teal-50">
            <p className="text-sm font-semibold text-gray-800">Scope 1:</p>
            <p className="text-2xl text-teal-600 font-bold">{scope1.toFixed(2)}</p>
          </div>
          <div className="summary-stat-card bg-teal-50">
            <p className="text-sm font-semibold text-gray-800">Scope 2:</p>
            <p className="text-2xl text-teal-600 font-bold">{scope2.toFixed(2)}</p>
          </div>
          <div className="summary-stat-card bg-teal-50">
            <p className="text-sm font-semibold text-gray-800">Scope 3:</p>
            <p className="text-2xl text-teal-600 font-bold">{scope3.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="print-hide mb-8 chart-container-card border-teal-100">
        <ScopePieChart scope1={scope1} scope2={scope2} scope3={scope3} />
      </div>

      <div className="print-hide mb-8 chart-container-card border-teal-100">
        <YearComparisonChart 
          years={labels}
          scope1Data={scope1Data}
          scope2Data={scope2Data}
          scope3Data={scope3Data}
        />
      </div>

      <div className="print-hide mt-8">
        <div className="narrative-card bg-teal-50 border-teal-400">
          <h3 className="font-bold text-lg mb-2 text-teal-700">Year-on-Year Summary:</h3>
          <Markdown>{narrative}</Markdown>
        </div>
      </div>
    </div>
  );
};

export default EmissionsSummary;