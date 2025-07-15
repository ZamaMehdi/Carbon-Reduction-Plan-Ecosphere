import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Chart } from 'chart.js/auto';

const CHART_COLOURS = ['#1E90FF', '#3CB371', '#FF8C00'];

const YearComparisonChart = forwardRef(({ years, scope1Data, scope2Data, scope3Data, isStatic = false }, ref) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const sentinelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isLarge, setIsLarge] = useState(false); // new state
  const [isDismissed, setIsDismissed] = useState(false);

  const placeholderRef = useRef(null);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Check if we have valid emission data
  const hasValidData = years && years.length > 0 && 
    scope1Data && scope2Data && scope3Data &&
    (scope1Data.some(val => Number(val) > 0) || 
     scope2Data.some(val => Number(val) > 0) || 
     scope3Data.some(val => Number(val) > 0));
  const isFloating = !isStatic && isSticky && !isDismissed && !isSmallScreen && hasValidData;

  // Expose chart image method
  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
  }));

  useEffect(() => {
    // Only initialize chart if canvas is available and we have valid data
    if (!canvasRef.current || !hasValidData) return;
    
    if (chartRef.current) chartRef.current.destroy();

    try {
      chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Scope 1 (tCO2e)',
            data: scope1Data,
            backgroundColor: CHART_COLOURS[0],
            borderColor: CHART_COLOURS[0],
            borderWidth: 1
          },
          {
            label: 'Scope 2 (tCO2e)',
            data: scope2Data,
            backgroundColor: CHART_COLOURS[1],
            borderColor: CHART_COLOURS[1],
            borderWidth: 1
          },
          {
            label: 'Scope 3 (tCO2e)',
            data: scope3Data,
            backgroundColor: CHART_COLOURS[2],
            borderColor: CHART_COLOURS[2],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' tCO2e';
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Emissions (tCO2e)'
            },
            stacked: false
          }
        }
      }
    });
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  }, [years, scope1Data, scope2Data, scope3Data, hasValidData]);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSticky(false);
          setIsDismissed(false); // Reset dismiss if chart scrolls back into view
        } else {
          if (!isDismissed) {setIsSticky(true);
            // 💡 Set height placeholder to avoid layout shift
        if (placeholderRef.current) {
          setPlaceholderHeight(placeholderRef.current.offsetHeight);
          }
        }
      }
    },{ threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isDismissed, placeholderHeight]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // approx. 10 inches
    };
  
    checkScreenSize(); // initial
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  

  const containerStyle = {
    width: isFloating ? (isLarge ? 600 : 500) : '100%',
    height: isFloating ? (isLarge ? 360 : 300) : 300
  };
  

  return (
    <>
      <div ref={sentinelRef} style={{ height: 1 }} />
         {/* Placeholder div to reserve space when floating */}
          <div style={{ height: isFloating ? (placeholderHeight || 300) : 0}} />
            <div
              ref={placeholderRef}
                className={`transition-all duration-300 shadow-lg bg-white rounded-lg p-2 ${
                isFloating ? 'fixed bottom-4 right-4 z-50' : 'relative mx-auto'
              }`}        
              style={{
                ...containerStyle,
                position: isStatic ? 'relative' : undefined
              }}
            >
              
              {/* Show message when no data */}
              {!hasValidData && (
                <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
                  <div>
                    <p className="text-sm">No historical data available</p>
                    <p className="text-xs mt-1">Enter previous reporting periods to see comparison</p>
                  </div>
                </div>
              )}
        
                   {isFloating && (
                    <>
                   <button
                onClick={() => setIsDismissed(true)}
                className="absolute top-1 right-1 px-2 py-0.5 text-xs bg-white border border-gray-400 rounded hover:bg-red-100 z-10"
                       >
                ✕
                </button>
                      <button
                    onClick={() => setIsLarge(!isLarge)}
                     className="absolute bottom-1 left-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                       >
                          {isLarge ? 'Shrink' : 'Enlarge'}
                         </button>
                            </>
                         )}

                   {/* Only show canvas when there's valid data */}
                   {hasValidData && (
                     <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                   )}
      </div>
      
      
    </>
  );
});

export default YearComparisonChart;
