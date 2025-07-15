// 📁 src/pages/PrintableReport.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import ReportDisplay from '../components/ReportDisplay';
import publicApi from '../api/publicApi'

const PrintableReport = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const pieChartRef = useRef();

//   useEffect(() => {
//     api.get(`/public-report/${reportId}`)
//       .then(res => setReport(res.data))
//       .catch(err => {
//         console.error('❌ Failed to fetch public report:', err);
//       });
//   }, [reportId]);

  useEffect(() => {
    publicApi.get(`/public-report/${reportId}`)
      .then(res => setReport(res.data))
      .catch(err => {
        console.error('❌ Failed to fetch public report:', err);
      });
  }, [reportId]);

  useEffect(() => {
    if (report) {
      console.log("✅ PrintableReport loaded report:", report.organisationName);
    }
  }, [report]);
  
  
  if (!report) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white">
      <div className="w-[794px] min-h-[1123px] mx-auto printable-report-loaded">
        <ReportDisplay data={report} ref={pieChartRef} />
      </div>
    </div>
  );
};
export default PrintableReport;
