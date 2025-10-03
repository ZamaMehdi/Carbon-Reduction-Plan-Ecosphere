import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ReductionPlan = ({ netZeroYear, annualReductionPercentage, onChange, isLocked }) => {
  return (
    <div className="section-card">
      <h2 className="section-title-gradient" style={{ backgroundColor: '#000000' }}>7. Net Zero Commitment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-hide">
        <div>
          <label className="form-label-styled">Net Zero Commitment Year (Max 2050):</label>
          <input
            type="number"
            name="netZeroYear"
            value={netZeroYear || ''}
            onChange={onChange ? onChange : undefined}
            className="form-input-styled focus:ring-amber-400"
            placeholder="e.g., 2040"
            disabled={isLocked}
          />
        </div>
        <div>
          <label className="form-label-styled">Annual Linear Reduction (%):</label>
          <input
            type="number"
            name="annualReductionPercentage"
            value={annualReductionPercentage || ''}
            onChange={onChange ? onChange : undefined}
            className="form-input-styled focus:ring-amber-400"
            placeholder="e.g., 5"
            disabled={isLocked}
          />
        </div>
      </div>
      <div className="print-only grid grid-cols-2 gap-x-8">
        <p><strong>Net Zero Year:</strong> {netZeroYear || 'N/A'}</p>
        <p><strong>Annual Reduction %:</strong> {annualReductionPercentage || 'N/A'}</p>
      </div>
    </div>
  );
};

export const ReductionPlanResults = ({ netZeroYear, annualReductionPercentage, totalEmissions, endYear }) => {
  const [reductionPlan, setReductionPlan] = useState([]);
  const [narratives, setNarratives] = useState({ nearTermNarrative: '', longTermNarrative: '' });
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Calculate Reduction Plan
    if (!totalEmissions || !netZeroYear || annualReductionPercentage === '' || isNaN(annualReductionPercentage)) {
      setReductionPlan([]);
      setNarratives({ nearTermNarrative: '', longTermNarrative: '' });
      return;
    }
    const currentReportingYear = parseInt(endYear);
    const targetYear = parseInt(netZeroYear);
    const reductionRate = parseFloat(annualReductionPercentage) / 100;
    if (targetYear <= currentReportingYear || targetYear > 2050 || reductionRate < 0 || reductionRate > 1) {
      setReductionPlan([]);
      setNarratives({ nearTermNarrative: '', longTermNarrative: '' });
      return;
    }
    let currentEmissions = totalEmissions;
    const plan = [];
    for (let year = currentReportingYear + 1; year <= targetYear; year++) {
      currentEmissions *= (1 - reductionRate);
      if (currentEmissions < 0) currentEmissions = 0;
      plan.push({
        year: year,
        projectedEmissions: parseFloat(currentEmissions.toFixed(2)),
      });
    }
    setReductionPlan(plan);

    // Narratives
    if (plan.length === 0 || totalEmissions === 0) {
      setNarratives({ nearTermNarrative: '', longTermNarrative: '' });
      return;
    }
    const initialProjected = plan[0].projectedEmissions;
    const finalProjected = plan[plan.length - 1].projectedEmissions;
    const initialReductionPercent = ((totalEmissions - initialProjected) / totalEmissions) * 100;
    const totalReductionPercent = ((totalEmissions - finalProjected) / totalEmissions) * 100;
    let nearTermNarrative = '';
    let longTermNarrative = '';
    const nearTermYearIndex = plan.findIndex(item => item.year === currentReportingYear + 5);
    if (nearTermYearIndex !== -1) {
      const nearTermEmissions = plan[nearTermYearIndex].projectedEmissions;
      const nearTermReduction = ((totalEmissions - nearTermEmissions) / totalEmissions) * 100;
      nearTermNarrative = `By <b>${currentReportingYear + 5}</b>, your projected emissions are <b>${nearTermEmissions.toFixed(2)} tCO2e</b>, representing a <b>${nearTermReduction.toFixed(1)}% reduction</b> from your current baseline. This demonstrates your initial progress towards decarbonisation.`;
    } else {
      nearTermNarrative = `In the first year of reduction (<b>${plan[0].year}</b>), your projected emissions are <b>${initialProjected.toFixed(2)} tCO2e</b>, a <b>${initialReductionPercent.toFixed(1)}% reduction</b> from your baseline. This demonstrates your initial progress towards decarbonisation.`;
    }
    longTermNarrative = `By your Net Zero commitment year of <b>${targetYear}</b>, emissions are projected to reach <b>${finalProjected.toFixed(2)} tCO2e</b>, achieving an overall <b>${totalReductionPercent.toFixed(1)}% reduction</b> from your baseline. This ambitious plan outlines your pathway to significantly reduce your carbon footprint.`;
    setNarratives({ nearTermNarrative, longTermNarrative });
  }, [netZeroYear, annualReductionPercentage, totalEmissions, endYear]);

  useEffect(() => {
    // Draw Bar Chart
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    if (reductionPlan.length === 0) return;
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: reductionPlan.map(entry => entry.year),
        datasets: [{
          label: 'Projected Emissions (tCO2e)',
          data: reductionPlan.map(entry => entry.projectedEmissions),
          backgroundColor: '#3B82F6',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y.toFixed(2)} tCO2e`
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Year' } },
          y: { beginAtZero: true, title: { display: true, text: 'Emissions (tCO2e)' } }
        }
      }
    });
  }, [reductionPlan]);

  if (!netZeroYear || !annualReductionPercentage || reductionPlan.length === 0) return null;

  return (
    <div className="section-card">
      <h2 className="section-title-gradient" style={{backgroundImage: 'linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)'}}>
        Net Zero Reduction Plan: Projected Emissions
      </h2>
      <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto mb-8">
        <div className="narrative-card flex-1 border-orange-400 bg-white/80">
          <div className="mb-3 text-md text-gray-800" dangerouslySetInnerHTML={{__html: narratives.nearTermNarrative}} />
          <div className="text-md text-gray-800" dangerouslySetInnerHTML={{__html: narratives.longTermNarrative}} />
        </div>
      </div>
      <div className="chart-container-card w-full max-w-3xl mx-auto border-orange-100 mb-8">
        <div style={{height: 350}}>
          <canvas id="reductionBarChart" ref={canvasRef} />
        </div>
      </div>
      <div className="mt-6 max-w-2xl mx-auto overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-gray-900 text-base">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-orange-100 to-orange-50">
              <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider border-b border-orange-200">Year</th>
              <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider border-b border-orange-200">Projected Emissions (tCO2e)</th>
            </tr>
          </thead>
          <tbody id="reductionPlanTableBody">
            {reductionPlan.map(entry => (
              <tr key={entry.year} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                <td className="px-6 py-3 text-sm font-medium">{entry.year}</td>
                <td className="px-6 py-3 text-sm">{entry.projectedEmissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReductionPlan;