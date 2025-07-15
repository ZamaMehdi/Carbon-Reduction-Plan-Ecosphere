
import React, { useMemo , useEffect } from 'react';

const PreviousReportingPeriod = ({ data, handleChange, previousPeriods, handlePreviousPeriodChange, isLocked }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleRadioChange = (e) => {
    const isFirstPlan = e.target.value === 'yes';

    // Reset fields if "yes" is selected
    if (isFirstPlan) {
      handleChange({ target: { name: 'isFirstPlan', value: true } });
      handleChange({ target: { name: 'numPreviousPeriods', value: 0 } });
      handleChange({ target: { name: 'previousPeriods', value: [] } });
    } else {
      handleChange({ target: { name: 'isFirstPlan', value: false } });
    }  };

    // ✅ Calculate baseline year
   const baselineYear = useMemo(() => {
    if (data.isFirstPlan) {
      return data.endYear || 'N/A';
    } else if (previousPeriods.length > 0) {
      const years = previousPeriods.map((p) => parseInt(p.year)).filter(y => !isNaN(y));
      return years.length ? Math.min(...years) : (data.endYear || 'N/A');
    } else {
      return data.endYear || 'N/A';
    }
   }, [data.isFirstPlan, data.endYear, previousPeriods]);

   useEffect(() => {
    if (baselineYear && baselineYear !== 'N/A') {
      handleChange({ target: { name: 'baselineYear', value: baselineYear } });
      console.log("✅ baselineYear pushed to formData:", baselineYear);
    } else {
      console.log("⛔ baselineYear was invalid:", baselineYear);
    }
    console.log("📌 Calculated baselineYear:", baselineYear);
   }, [baselineYear]);
  
  

   return (
    <div className="section-card">
      {/* <h2 className="section-title-gradient" style={{ backgroundImage: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)' }}>
        Previous Reporting Periods
      </h2> */}

      <div className="flex items-center space-x-4 mb-6">
        <label className="form-label-styled mb-0">Is this your First Carbon Reduction Plan?</label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="isFirstPlan"
              value="yes"
              checked={data.isFirstPlan}
              onChange={handleRadioChange}
              className="form-radio h-5 w-5 text-indigo-600"
              disabled={isLocked}
            />
            <span className="ml-2 text-gray-700">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="isFirstPlan"
              value="no"
              checked={!data.isFirstPlan}
              onChange={handleRadioChange}
              className="form-radio h-5 w-5 text-indigo-600"
              disabled={isLocked}
            />
            <span className="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>

      {!data.isFirstPlan && (
        <div>
            <h2 className="section-title-gradient" style={{ backgroundColor: '#6366f1' }}>
         4. Previous Reporting Periods
         </h2>
          <label className="form-label-styled">Number of previous 12-month periods to include:</label>
          <select
            name="numPreviousPeriods"
            value={data.numPreviousPeriods}
            onChange={handleChange}
            className="form-select-styled focus:ring-pink-400"
            disabled={isLocked}
          >
            <option value={0}>0 (Current year only)</option>
            <option value={1}>1 year</option>
            <option value={2}>2 years</option>
            <option value={3}>3 years</option>
          </select>

          <div className="space-y-6 mt-6">
            {previousPeriods.map((period) => {
              const endMonthName = months[data.endMonth - 1];
              return (
                <div key={period.year} className="narrative-card bg-pink-50 border-pink-400">
                  <h3 className="font-bold text-purple-700 mb-3 text-lg">
                    Data for {period.year} (ending {endMonthName} {period.year})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label-styled">Scope 1 Emissions (tCO2e):</label>
                      <input
                        type="number"
                        className="form-input-styled focus:ring-pink-400"
                        placeholder="e.g., 50.00"
                        value={period.scope1}
                        onChange={e => handlePreviousPeriodChange(period.year, 'scope1', e.target.value)}
                        disabled={isLocked}
                      />
                    </div>
                    <div>
                      <label className="form-label-styled">Scope 2 Emissions (tCO2e):</label>
                      <input
                        type="number"
                        className="form-input-styled focus:ring-pink-400"
                        placeholder="e.g., 20.00"
                        value={period.scope2}
                        onChange={e => handlePreviousPeriodChange(period.year, 'scope2', e.target.value)}
                        disabled={isLocked}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label-styled">Scope 3 Emissions (tCO2e):</label>
                      <input
                        type="number"
                        className="form-input-styled focus:ring-pink-400"
                        placeholder="e.g., 100.00"
                        value={period.scope3}
                        onChange={e => handlePreviousPeriodChange(period.year, 'scope3', e.target.value)}
                        disabled={isLocked}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
              <p className="mt-4 text-sm text-gray-600">
               The earliest data entered will serve as your <strong>Baseline Year</strong>:{" "}
               <span className="font-semibold text-gray-800">{baselineYear}</span>
             </p>
        </div>
      )}
    </div>
  );
};

export default PreviousReportingPeriod;
