export function getReportingPeriod(endMonth, endYear) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    if (!endMonth || !endYear) return '';
  
    const endDate = new Date(endYear, endMonth, 0); // last day of month
    const endDay = endDate.getDate();
    const endMonthName = months[endMonth - 1];
  
    const startDate = new Date(endYear, endMonth - 12, 1);
    const startMonthName = months[startDate.getMonth()];
    const startYear = startDate.getFullYear();
  
    return `Calculating emissions for the 12-month period from **1 ${startMonthName} ${startYear}** to **${endDay} ${endMonthName} ${endYear}**. This period serves as your baseline for Net Zero calculations.`;
  }
  