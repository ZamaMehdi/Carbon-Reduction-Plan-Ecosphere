import React, { useEffect, useRef, useState ,
  forwardRef,
  useImperativeHandle,} from 'react';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const ScopePieChart = forwardRef(({ scope1, scope2, scope3, isStatic = false }, ref) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const sentinelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Check if we have valid emission data
  const hasValidData = (Number(scope1) || 0) + (Number(scope2) || 0) + (Number(scope3) || 0) > 0;
  const isFloating = !isStatic && isSticky && !isDismissed && !isSmallScreen && hasValidData;
  const placeholderRef = useRef(null);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  // const [isLarge, setIsLarge] = useState(false);


  // const [isLarge, setIsLarge] = useState(false);

    // ✅ Expose toBase64Image method
    useImperativeHandle(ref, () => ({
      toBase64Image: () => chartRef.current?.toBase64Image?.(),
    }));

  useEffect(() => {
    // Only initialize chart if canvas is available and we have valid data
    if (!canvasRef.current || !hasValidData) return;
    
    const ctx = canvasRef.current;
    const initialData = [Number(scope1) || 0, Number(scope2) || 0, Number(scope3) || 0];
    const total = initialData.reduce((a, b) => a + b, 0);
    const datalabels = initialData.map(v =>
      `${v.toFixed(2)} (${total ? ((v / total) * 100).toFixed(2) : '0.00'}%)`
    );

        try {
      chartRef.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Scope 1', 'Scope 2', 'Scope 3'],
          datasets: [{
            data: initialData,
            backgroundColor: ['#20B2AA', '#4682B4', '#FFD700']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          },
          plugins: {
            legend: {
              display: false,
              position: 'right',
              align: 'end',
              labels: {
              usePointStyle: true,     // Makes the box small and rounded (optional)
              pointStyle: 'rect',      // Square box like your image 
              boxWidth: 16,
              boxHeight: 16,
              padding: 10,
              font: {
              size: 14,
              weight: '400'
              }
              } },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percent = total ? ((value / total) * 100).toFixed(2) : '0.00';
                  return `${context.label}: ${value.toFixed(2)} (${percent}%)`;
                }
              }
            },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold', size: 12 },
              anchor: 'center',
              align: 'center',
              offset: 0,
              textAlign: 'center',
              clamp: true,
              clip: false,
              formatter: (value, context) => {
                const label = datalabels[context.dataIndex];
                return value < 0.01 ? '' : label;  // 👈 hide very small slices
              },
               display: false // (context) => {
              //   const value = context.dataset.data[context.dataIndex];
              //   const total = context.dataset.data.reduce((a, b) => a + b, 0);
              //   return value / total > 0.03; // ⛔️ hide if less than 3%
              // }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    } catch (error) {
      console.error('Failed to create chart:', error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [hasValidData, scope1, scope2, scope3]);

  useEffect(() => {
    if (!chartRef.current) return;
    const newData = [Number(scope1) || 0, Number(scope2) || 0, Number(scope3) || 0];
    const total = newData.reduce((a, b) => a + b, 0);
    const datalabels = newData.map(v =>
      `${v.toFixed(2)} (${total ? ((v / total) * 100).toFixed(2) : '0.00'}%)`
    );
    chartRef.current.data.datasets[0].data = newData;
    chartRef.current.options.layout.padding = 40;
    chartRef.current.options.plugins.datalabels.font.size = 12;
    chartRef.current.options.plugins.datalabels.formatter = (value, context) =>
      value < 0.01 ? '' : datalabels[context.dataIndex];
    chartRef.current.resize();
    chartRef.current.update();
  }, [scope1, scope2, scope3]);

  useEffect(() => {
    if (isSmallScreen) return; //  do not observe on small screens

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDismissed(false); //  reset dismissal when user scrolls back
          setIsSticky(false);
        } else {
          if (!isDismissed) {
            setIsSticky(true);
            // 💡 Set height placeholder to avoid layout shift
            if (placeholderRef.current) {
              setPlaceholderHeight(placeholderRef.current.offsetHeight);
            }
          }
        }
      }, { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isDismissed, isSmallScreen, placeholderHeight]); //  added dependency

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.resize();
    }
  }, [dimensions]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // under ~10 inches width
    };
  
    checkScreenSize(); // initial check
    window.addEventListener('resize', checkScreenSize);
  
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  

  const containerStyle = {
    width: isFloating ? 300 : '50%',
    height: isFloating ? 300 : 400
  };
  


  return (
    <>
    <div ref={sentinelRef} style={{ height: 1 }} />
    {/* Placeholder div to reserve space when floating */}
  <div style={{ height: isFloating ? placeholderHeight : 0 }} />

      <div
      ref={placeholderRef}
  className={`transition-all duration-300 shadow-lg bg-white rounded-lg ${
    isFloating ? 'fixed top-4 right-4 z-50' : 'relative mx-auto'
  }`}  
  style={{
    ...containerStyle,
    position: isStatic ? 'relative' : undefined
  }}>
      
      {/* Show message when no data */}
      {!hasValidData && (
        <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
          <div>
            <p className="text-sm">No emission data available</p>
            <p className="text-xs mt-1">Enter emission inputs to see chart</p>
          </div>
        </div>
      )}
  
    {/* <button
      onClick={() => setIsLarge(!isLarge)}
      className="absolute top-1 right-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
    >
      {isLarge ? 'Shrink' : 'Enlarge'}
    </button> */}
  

  {/* ✅ Add this wrapper */}
  <div className="relative w-full h-full justify-center items-center">
          {/* X button appears only when floating */}
          {isFloating && (
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-1 left-1 px-2 py-0.5 text-xs bg-white border border-gray-400 rounded hover:bg-red-100 z-10"
            >
              ✕
            </button>
          )}
    
    {/* Only show canvas and legend when there's valid data */}
    {hasValidData && (
      <>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' , transition: 'all 0.3s ease-in-out'}} />

        {/* ✅ Legend positioned inside chart card bottom-right */}
        <div className="absolute bottom-2 right-2 flex flex-col items-start text-sm space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-3 bg-[#20B2AA] rounded-sm" />
            <span>Scope 1</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-3 bg-[#4682B4] rounded-sm" />
            <span>Scope 2</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-3 bg-[#FFD700] rounded-sm" />
            <span>Scope 3</span>
          </div>
        </div>
      </>
    )}
  </div>
</div>

</>
  );
});

export default ScopePieChart;