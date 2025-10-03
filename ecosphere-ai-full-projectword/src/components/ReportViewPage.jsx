
// ReportViewPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import ReportDisplay from '../components/ReportDisplay';

const ReportViewPage = ({ isAdminView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const pieChartRef = useRef(null);
  const yearComparisonChartRef = useRef(null);
  const reductionPlanChartRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const endpoint = isAdminView
          ? `/admin/get-report/${id}`
          : `/reports/user/reports/${id}`;
        const res = await api.get(endpoint);
        setReport(res.data);
      } catch (err) {
        console.error('Error fetching report', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, isAdminView]);

  const { reportId } = useParams(); // or just `id`, based on your route setup

  const handleExportCompleteDocx = async () => {
    setIsExporting(true);
    try {
      // Get all chart images
      const scopeChartImage = pieChartRef.current?.getScopeChartImage?.();
      const yearComparisonChartImage = pieChartRef.current?.getYearComparisonChartImage?.();
      const reductionPlanChartImage = pieChartRef.current?.getReductionPlanChartImage?.();

      console.log('📸 Exporting charts:', {
        scopeChart: scopeChartImage ? 'Available' : 'Not available',
        yearComparison: yearComparisonChartImage ? 'Available' : 'Not available',
        reductionPlan: reductionPlanChartImage ? 'Available' : 'Not available'
      });

      const res = await api.post("/reports/export-complete-docx", {
        reportData: report,
        scopeChartImage,
        yearComparisonChartImage,
        reductionPlanChartImage
      }, {
        responseType: "blob"
      });

      // Download the Word file
      const blob = new Blob([res.data], { 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Complete_Carbon_Report_${report.organisationName || 'Report'}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error generating complete docx:", err);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // const handleDownloadPDF = async () => {
  //   try {
  //     const response = await api.get(`/admin/download-report/${reportId}`, {
  //       responseType: 'blob',
  //       withCredentials: true,
  //     });
  
  //     const blob = new Blob([response.data], { type: 'application/pdf' });
  //     const link = document.createElement('a');
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `report-${reportId}.pdf`;
  //     link.click();
  //   } catch (err) {
  //     console.error('❌ Failed to download PDF:', err);
  //   }
  // };
  

  if (loading) return <p>Loading...</p>;
  if (!report) return <p>Report not found.</p>;

  return (
    <div 
      className="min-h-screen py-8 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundImage: "url('/bangkok-city.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="p-6">
      <button
        onClick={() => navigate(isAdminView ? '/admin' : '/my-reports')}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Back to {isAdminView ? 'Admin Dashboard' : 'My Reports'}
      </button>

      <h1 className="text-2xl font-bold mb-4">
        {isAdminView ? 'Viewing Report (Admin)' : 'Submitted Report'}
      </h1>

      <div className="flex justify-center py-8">
        <div className="w-[794px] min-h-[1123px] p-8">
          <ReportDisplay data={report} ref={pieChartRef}/>
          
          {/* Export Button - Admin Only */}
          {isAdminView && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleExportCompleteDocx}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting Complete Report...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Word Doc
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Download complete carbon reduction report with all charts and data in A4 format (Admin Only)
              </p>
            </div>
          )}
          {/* {isAdminView && (
          <button
            onClick={async () => {
              try {
                const response = await api.get(`/admin/download-report/${report._id}`, {
                  responseType: 'blob',
                });

                const url = window.URL.createObjectURL(
                  new Blob([response.data], { type: 'application/pdf' })
                );
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `report-${report._id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              } catch (error) {
                console.error('❌ Failed to download PDF:', error);
              }
            }}
            className="mt-4 mr-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Print Report (PDF)
          </button>
        )} */}

          {/* <button
  onClick={async () => {
    const base64 = pieChartRef.current?.getScopeChartImage?.();
    if (!base64) return alert("Chart not ready!");

    console.log("📸 Base64 Image:", base64.slice(0, 50)); // Preview first 50 chars

    try {
      const res = await api.post("/reports/generate-docx", {
        reportData: report,
        scopeChartImage: base64
      }, {
        responseType: "blob" // if you're downloading it
      });

      // Download the Word file
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Report_${report.organisationName}.docx`;
      link.click();
    } catch (err) {
      console.error("❌ Error generating docx:", err);
    }
  }}
  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
>
  Export Word Document
</button> */}

        </div>
      </div>
      </div>
    </div>
  );
};

export default ReportViewPage;
