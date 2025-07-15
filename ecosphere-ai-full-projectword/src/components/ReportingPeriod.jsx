import React, { useEffect } from 'react';
import Markdown from 'react-markdown';

const ReportingPeriod = ({ data, handleChange, isLocked }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  


  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i).reverse();
  const filteredYears = years.filter((y) => y <= currentYear).sort((a, b) => b - a);
  const filteredMonths = data.endYear === currentYear
    ? months.map((_, i) => i + 1).filter((m) => m <= currentMonth)
    : months.map((_, i) => i + 1);

  // Ensure endMonth stays valid if endYear is current year
  useEffect(() => {
    if (data.endYear === currentYear && data.endMonth > currentMonth) {
      handleChange({ target: { name: 'endMonth', value: currentMonth } });
    }
  }, [data.endYear, data.endMonth, currentMonth, currentYear, handleChange]);
  
      
  const getReportingPeriod = () => {
    const endMonth = parseInt(data.endMonth, 10);
    const endYear = parseInt(data.endYear, 10);
    if (!endMonth || !endYear) return '';

    const endDate = new Date(endYear, endMonth, 0); // Last day of the selected month
    const endDay = endDate.getDate();
    const endMonthName = months[endMonth - 1];

    const startDate = new Date(endYear, endMonth - 12, 1);
    const startMonthName = months[startDate.getMonth()];
    const startYear = startDate.getFullYear();

    return `Calculating emissions for the 12-month period from **1 ${startMonthName} ${startYear}** to **${endDay} ${endMonthName} ${endYear}**. This period serves as your baseline for Net Zero calculations.`;
  };

  return (
    <div className="section-card">
      <h2
        className="section-title-gradient"
        style={{ backgroundColor: '#6366f1' }}
      >
        3. Select Reporting Period (Last 12 Months)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label-styled">End Month:</label>
          <select
            name="endMonth"
            className="form-select-styled focus:ring-pink-400"
            value={data.endMonth}
            onChange={handleChange}
            disabled={isLocked}
          >
            {filteredMonths.map((m) => (
              <option key={m} value={m}>{months[m - 1]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label-styled">End Year:</label>
          <select
            name="endYear"
            className="form-select-styled focus:ring-pink-400"
            value={data.endYear}
            onChange={handleChange}
            disabled={isLocked}
          >
            {filteredYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>


      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <Markdown>{getReportingPeriod()}</Markdown>
      </div>
    </div>
  );
};

export default ReportingPeriod;
