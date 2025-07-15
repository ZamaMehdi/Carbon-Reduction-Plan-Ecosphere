import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [reportSearch, setReportSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState({});


  useEffect(() => {
    fetchReports();
    fetchUsers();
    fetchSubmittedReports(showDeleted);
  }, [showDeleted]);

  const fetchReports = async () => {
    try {
      const res = await api.get(`/admin/reports?includeDeleted=${showDeleted}`);
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      const sortedUsers = [...res.data].sort((a, b) => (a.email || '').localeCompare(b.email || ''));
      setUsers(sortedUsers);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const fetchSubmittedReports = async (includeDeleted = false) => {
    try {
      const res = await api.get(`/admin/submitted-reports?includeDeleted=${includeDeleted}`, {
        withCredentials: true,
      });
        console.log('📦 Submitted Reports:', res.data);
      const sortedReports = [...res.data].sort((a, b) => (a.organisationName || '').localeCompare(b.organisationName || ''));
      setSubmittedReports(sortedReports);
    } catch (err) {
      console.error('❌ Failed to fetch submitted reports:', err);
    }
  };

  const handleToggleLock = async (reportId) => {
    try {
      console.log('Toggling lock for report:', reportId);
      await api.post(`/admin/toggle-lock/${reportId}`);
      fetchReports();
      fetchSubmittedReports(); // refresh both
    } catch (err) {
      console.error('Error toggling lock state', err);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await api.delete(`/admin/reports/${reportId}`);
      fetchReports();
      fetchSubmittedReports();
    } catch (err) {
      console.error('Error deleting report', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      fetchReports();
      fetchSubmittedReports();
    } catch (err) {
      console.error('Error deleting user', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const filteredSubmittedReports = submittedReports.filter((report) =>
    report.organisationName?.toLowerCase().includes(reportSearch.toLowerCase())
  );

  const groupedReports = filteredSubmittedReports.reduce((acc, report) => {
    const userEmail = report.userId?.email || 'Unknown';
    if (!acc[userEmail]) acc[userEmail] = [];
    acc[userEmail].push(report);
    return acc;
  }, {});
  
  const toggleDropdown = (email) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {/* 🔍 Submitted Reports */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Submitted Reports</h2>
        <input
          type="text"
          placeholder="Search by organization name..."
          value={reportSearch}
          onChange={(e) => setReportSearch(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
        />
           {/* Toggle for showing deleted */}
  <div className="flex items-center gap-2 mb-4">
    <input
      type="checkbox"
      id="showDeleted"
      checked={showDeleted}
      onChange={() => setShowDeleted(prev => !prev)}
    />
    <label htmlFor="showDeleted" className="text-sm">Show Deleted Reports</label>
  </div>

        {filteredSubmittedReports.length === 0 ? (
          <p className="text-gray-600">No reports submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedReports).map(([email, reports]) => (
    <div key={email} className="border rounded p-4 bg-gray-50 shadow">
      <div className="flex justify-between items-center">
        <div>
          <p><strong>User:</strong> {email}</p>
          <p><strong>Total Reports:</strong> {reports.length}</p>
        </div>
        <button
          onClick={() => toggleDropdown(email)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          {openDropdowns[email] ? 'Hide Reports' : 'View Reports'}
        </button>
      </div>

      {openDropdowns[email] && (
        <div className="mt-4 space-y-4">
          {reports
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // latest first
            .map((report) => (
              <div key={report._id} className={`p-4 border rounded bg-white ${report.isDeleted ? 'border-red-300 bg-red-100' : ''}`}>
                <p><strong>Organization:</strong> {report.organisationName}</p>
                <p><strong>Submitted:</strong> {new Date(report.updatedAt).toLocaleString()}</p>
                <p><strong>Locked:</strong> {report.locked ? 'Yes' : 'No'}</p>

                <details className="text-sm mt-2">
                  <summary className="text-blue-600 cursor-pointer">View full data</summary>
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-auto max-h-60">
                    {JSON.stringify(report, null, 2)}
                  </pre>
                </details>

                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleToggleLock(report._id)}
                    className={`${
                      report.locked ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-green-400 hover:bg-green-500'
                    } text-black px-2 py-1 rounded`}
                  >
                    {report.locked ? 'Unlock' : 'Lock'}
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete Report
                  </button>
                  <button
                    onClick={() => navigate(`/admin/view-report/${report._id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    View Report
                  </button>

                  <button
  onClick={() => navigate(`/admin/edit-report/${report._id}`)}
  className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded"
>
  Edit Report
</button>

                </div>
              </div>
          ))}
        </div>
      )}
      
    </div>
            ))}
          </div>
        )}
      </div>

      {/* 👥 Users List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Registered Users</h2>
        <input
          type="text"
          placeholder="Search by email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
        />
        {filteredUsers.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="border p-4 mb-2 rounded bg-gray-50">
              <p><strong>Email:</strong> {user.email}</p>
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mt-2"
              >
                Delete User
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
