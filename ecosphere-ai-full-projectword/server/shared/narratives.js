// 📁 server/shared/narratives.js
function getReportingPeriod(endMonth, endYear) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const endMonthName = months[endMonth - 1] || 'N/A';
    const endDate = new Date(endYear, endMonth, 0);
    const endDay = endDate.getDate();
    const startMonthName = months[endMonth % 12];
    const startYear = endMonth === 12 ? endYear : endYear - 1;
  
    return `Calculating emissions for the 12-month period from 1 ${startMonthName} ${startYear} to ${endDay} ${endMonthName} ${endYear}. This period serves as your baseline for Net Zero calculations.`;
  }
  
  function generateYearOnYearNarrative(allYearsData) {
    if (!allYearsData || allYearsData.length < 2) {
      return 'Enter historical data to see year-on-year comparison insights.';
    }
  
    const sortedData = [...allYearsData].sort((a, b) => a.year - b.year);
    const baselineYearData = sortedData[0];
    const latestYearData = sortedData[sortedData.length - 1];
  
    let narrative = `The year-on-year comparison provides insight into your organisation's emissions trends. Your Baseline Year is ${baselineYearData.year}, with total emissions of ${parseFloat(baselineYearData.total).toFixed(2)} tCO2e (Scope 1: ${parseFloat(baselineYearData.scope1).toFixed(2)}, Scope 2: ${parseFloat(baselineYearData.scope2).toFixed(2)}, Scope 3: ${parseFloat(baselineYearData.scope3).toFixed(2)}).\n\n`;
  
    const totalChange = latestYearData.total - baselineYearData.total;
    const totalChangePercentage = baselineYearData.total !== 0 ? (totalChange / baselineYearData.total) * 100 : 0;
  
    narrative += `Compared to the baseline, your total emissions in ${latestYearData.year} are ${parseFloat(latestYearData.total).toFixed(2)} tCO2e, a `;
    if (totalChangePercentage > 0) {
      narrative += `${totalChangePercentage.toFixed(1)}% increase`;
    } else if (totalChangePercentage < 0) {
      narrative += `${Math.abs(totalChangePercentage).toFixed(1)}% reduction`;
    } else {
      narrative += `0.0% change`;
    }
    narrative += `.\n\n---\n\n`;
  
    narrative += `Breakdown by Scope:\n`;
    ['scope1', 'scope2', 'scope3'].forEach(scope => {
      const scopeLabel = scope === 'scope1' ? 'Scope 1' : scope === 'scope2' ? 'Scope 2' : 'Scope 3';
      const base = parseFloat(baselineYearData[scope]) || 0;
      const latest = parseFloat(latestYearData[scope]) || 0;
      const diff = latest - base;
      const pct = base !== 0 ? (diff / base) * 100 : 0;
  
      if (diff === 0) {
        narrative += `\n- ${scopeLabel}: Remained constant at ${base.toFixed(2)} tCO2e`;
      } else if (diff > 0) {
        narrative += `\n- ${scopeLabel}: Increased by ${diff.toFixed(2)} tCO2e (+${pct.toFixed(1)}%) from ${base.toFixed(2)} to ${latest.toFixed(2)}.`;
      } else {
        narrative += `\n- ${scopeLabel}: Reduced by ${Math.abs(diff).toFixed(2)} tCO2e (${pct.toFixed(1)}%) from ${base.toFixed(2)} to ${latest.toFixed(2)}.`;
      }
    });
  
    return narrative;
  }
  
  module.exports = {
    getReportingPeriod,
    generateYearOnYearNarrative,
  };
  