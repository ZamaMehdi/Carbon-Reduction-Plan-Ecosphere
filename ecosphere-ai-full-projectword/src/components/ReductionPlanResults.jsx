import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// ✅ Register necessary Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ReductionPlanResults = forwardRef(({
  currentEmissions,
  netZeroYear,
  annualReductionPercentage,
}, ref) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [narratives, setNarratives] = useState({ nearTerm: '', longTerm: '' });
  const [chartYears, setChartYears] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Expose chart image method
  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
  }));

  const safeFixed = (num, decimals = 2) =>
    typeof num === 'number' ? num.toFixed(decimals) : '0.00';

  useEffect(() => {
    // ✅ Validate props
    const total = parseFloat(currentEmissions);
    const targetYear = parseInt(netZeroYear);
    const percent = parseFloat(annualReductionPercentage);
    const yearNow = new Date().getFullYear();

    if (
      isNaN(total) ||
      isNaN(targetYear) ||
      isNaN(percent) ||
      total <= 0 ||
      targetYear <= yearNow ||
      percent <= 0
    ) {
      return;
    }

    // ✅ Prepare data
    const years = [];
    const data = [];
    let emissions = total;

    for (let y = yearNow; y <= targetYear; y++) {
      years.push(y);
      data.push(parseFloat(emissions.toFixed(2)));
      emissions *= 1 - percent / 100;
    }

    const nearTermYear = yearNow + 5;
    const nearTermIndex = years.indexOf(nearTermYear);

    const firstYearReduction =
      data[1] != null ? ((total - data[1]) / total) * 100 : 0;

    let nearTermText = '';
    if (nearTermIndex !== -1 && data[nearTermIndex] !== undefined) {
      const nearEmissions = data[nearTermIndex];
      const nearReduction = ((total - nearEmissions) / total) * 100;
      nearTermText = `By <strong>${nearTermYear}</strong>, your projected emissions are <strong>${safeFixed(
        nearEmissions
      )} tCO₂e</strong>, representing a <strong>${safeFixed(
        nearReduction,
        1
      )}%</strong> reduction from your current baseline. This demonstrates your initial progress towards decarbonisation.`;
    } else {
      nearTermText = `In the first year of reduction (<strong>${
        years[1] ?? 'N/A'
      }</strong>), your projected emissions are <strong>${safeFixed(
        data[1]
      )} tCO₂e</strong>, a <strong>${safeFixed(
        firstYearReduction,
        1
      )}%</strong> reduction.`;
    }

    const finalEmissions = data[data.length - 1];
    const totalReduction = ((total - finalEmissions) / total) * 100;

    const longTermText = `By your Net Zero commitment year of <strong>${targetYear}</strong>, emissions are projected to reach <strong>${safeFixed(
      finalEmissions
    )} tCO₂e</strong>, achieving an overall <strong>${safeFixed(
      totalReduction,
      1
    )}%</strong> reduction from your baseline. This ambitious plan outlines your pathway to significantly reduce your carbon footprint.`;

    setNarratives({ nearTerm: nearTermText, longTerm: longTermText });

    setChartYears(years);
    setChartData(data);


    // ✅ Destroy previous chart if exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // ✅ Ensure canvas is mounted
    if (!canvasRef.current) return;

    // ✅ Create new chart
    chartRef.current = new ChartJS(canvasRef.current, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Projected Emissions (tCO₂e)',
            data,
            backgroundColor: '#4ade80',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${safeFixed(ctx.raw)} tCO₂e`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Emissions (tCO₂e)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Year',
            },
          },
        },
      },
    });
  }, [currentEmissions, netZeroYear, annualReductionPercentage]);

  return (
    <div className="my-10">
      <h3 className="text-xl font-semibold text-green-700 mb-2">
        Projected Emissions Reduction (tCO₂e):
      </h3>
      {narratives.nearTerm && (
        <p
          className="mb-2 text-gray-800"
          dangerouslySetInnerHTML={{ __html: narratives.nearTerm }}
        />
      )}
      {narratives.longTerm && (
        <p
          className="mb-4 text-gray-800"
          dangerouslySetInnerHTML={{ __html: narratives.longTerm }}
        />
      )}
      <div className="relative w-full h-[400px]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {chartYears.length > 0 && (
  <div className="mt-8 overflow-x-auto">
    <h4 className="text-lg font-semibold mb-2">Reduction Plan Table</h4>
    <table className="min-w-full border border-gray-300 text-sm text-left text-gray-800">
      <thead className="bg-green-100">
        <tr>
          <th className="px-4 py-2 border-b">Year</th>
          <th className="px-4 py-2 border-b">Projected Emissions (tCO₂e)</th>
          <th className="px-4 py-2 border-b">Reduction (%)</th>
        </tr>
      </thead>
      <tbody>
        {chartYears.map((year, i) => {
          const reductionPercent =
            ((currentEmissions - chartData[i]) / currentEmissions) * 100;
          return (
            <tr key={year}>
              <td className="px-4 py-2 border-b">{year}</td>
              <td className="px-4 py-2 border-b">{safeFixed(chartData[i])}</td>
              <td className="px-4 py-2 border-b">
                {i === 0 ? '0.0%' : `${safeFixed(reductionPercent, 1)}%`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

    </div>
  );
});

export default ReductionPlanResults;
