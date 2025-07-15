// 📁 src/components/UserReportHistory.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const UserReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/my-history'); // ✅ Hits your new backend route
        setReports(res.data);
      } catch (err) {
        console.error('❌ Failed to load report history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!reports.length) return <p className="p-4">No submitted reports found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ✅ Back to Home Button */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">📜 My Submitted Reports</h1>
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div
            key={report._id}
            className="p-4 border rounded-lg shadow bg-white hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold">Report #{index + 1}</h2>
            <p><strong>Submitted on:</strong> {new Date(report.createdAt).toLocaleString()}</p>
            <p><strong>Organisation:</strong> {report.organisationName || 'N/A'}</p>
            <p><strong>Total Emissions:</strong> {report.totalEmissions || 0} tCO₂e</p>
            <Link
              to={`/my-reports/${report._id}`}
              state={{ report }}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              View Full Report →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReportHistory;
