import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const AdminEditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
        const res = await api.get(`/admin/get-report/${id}`);
        setFormData(res.data);
    };
    fetchReport();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchChange = (index, field, value) => {
    const updatedBranches = [...formData.branches];
    updatedBranches[index][field] = value;
    setFormData((prev) => ({ ...prev, branches: updatedBranches }));
  };

  const handlePeriodChange = (index, field, value) => {
    const updatedPeriods = [...formData.previousPeriods];
    updatedPeriods[index][field] = value;
    setFormData((prev) => ({ ...prev, previousPeriods: updatedPeriods }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/admin/update-report/${id}`, formData);
    navigate('/admin');
  };

  if (!formData) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Edit Report</h2>

      <div>
        <label>Organisation Name</label>
        <input type="text" name="organisationName" value={formData.organisationName || ''} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div>
        <label>Company Number</label>
        <input type="text" name="companyNumber" value={formData.companyNumber || ''} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div>
        <label>Current Address</label>
        <input type="text" name="currentAddress" value={formData.currentAddress || ''} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div>
        <label>Registered Address</label>
        <input type="text" name="registeredAddress" value={formData.registeredAddress || ''} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div>
        <h3 className="text-xl font-semibold">Branches</h3>
        {formData.branches?.map((branch, index) => (
          <div key={index} className="p-2 border rounded space-y-2 mt-2">
            <input type="text" placeholder="Branch Name" value={branch.name || ''} onChange={(e) => handleBranchChange(index, 'name', e.target.value)} className="w-full border p-2" />
            <input type="text" placeholder="Address" value={branch.address || ''} onChange={(e) => handleBranchChange(index, 'address', e.target.value)} className="w-full border p-2" />
            <input type="number" placeholder="Financial %" value={branch.financial || ''} onChange={(e) => handleBranchChange(index, 'financial', e.target.value)} className="w-full border p-2" />
            <input type="number" placeholder="Operational %" value={branch.operational || ''} onChange={(e) => handleBranchChange(index, 'operational', e.target.value)} className="w-full border p-2" />
          </div>
        ))}
      </div>

      <div>
        <label>Reporting Month</label>
        <input type="number" name="endMonth" value={formData.endMonth || ''} onChange={handleChange} className="w-full border p-2" />
        <label>Reporting Year</label>
        <input type="number" name="endYear" value={formData.endYear || ''} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div>
        <label>Is First Plan?</label>
        <select name="isFirstPlan" value={formData.isFirstPlan} onChange={handleChange} className="w-full border p-2">
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </div>

      {!formData.isFirstPlan && (
        <div>
          <h3 className="text-xl font-semibold">Previous Periods</h3>
          {formData.previousPeriods?.map((period, index) => (
            <div key={index} className="p-2 border rounded space-y-2 mt-2">
              <input type="number" placeholder="Year" value={period.year || ''} onChange={(e) => handlePeriodChange(index, 'year', e.target.value)} className="w-full border p-2" />
              <input type="number" placeholder="Scope 1" value={period.scope1 || ''} onChange={(e) => handlePeriodChange(index, 'scope1', e.target.value)} className="w-full border p-2" />
              <input type="number" placeholder="Scope 2" value={period.scope2 || ''} onChange={(e) => handlePeriodChange(index, 'scope2', e.target.value)} className="w-full border p-2" />
              <input type="number" placeholder="Scope 3" value={period.scope3 || ''} onChange={(e) => handlePeriodChange(index, 'scope3', e.target.value)} className="w-full border p-2" />
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold">Current Emissions</h3>
        <input type="number" name="scope1" value={formData.scope1 || ''} onChange={handleChange} className="w-full border p-2" placeholder="Scope 1" />
        <input type="number" name="scope2" value={formData.scope2 || ''} onChange={handleChange} className="w-full border p-2" placeholder="Scope 2" />
        <input type="number" name="scope3" value={formData.scope3 || ''} onChange={handleChange} className="w-full border p-2" placeholder="Scope 3" />
        <input type="number" name="totalEmissions" value={formData.totalEmissions || ''} onChange={handleChange} className="w-full border p-2" placeholder="Total Emissions" />
      </div>

      <div>
        <label>Net Zero Year</label>
        <input type="number" name="netZeroYear" value={formData.netZeroYear || ''} onChange={handleChange} className="w-full border p-2" />
        <label>Annual Reduction %</label>
        <input type="number" name="annualReductionPercentage" value={formData.annualReductionPercentage || ''} onChange={handleChange} className="w-full border p-2" />
      </div>

      <div className="flex gap-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
        <button type="button" onClick={() => navigate(-1)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  );
};

export default AdminEditReport;
