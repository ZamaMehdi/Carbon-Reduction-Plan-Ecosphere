import React from 'react';
import Markdown from 'react-markdown';

const OrganisationDetails = ({
  data,
  handleChange,
  handleBranchChange,
  addBranch,
  removeBranch,
  isLocked,
}) => {
  function getOverviewText(data) {
    const org = data.organisationName || 'N/A';
    const num = data.companyNumber || 'N/A';
    const head = data.currentAddress || 'N/A';
    const reg = data.registeredAddress || 'N/A';
    let overview = `The organisation, **${org}**, with Company Number **${num}**, currently operates from its head office at **${head}**, and its registered office is at **${reg}**.`;

    if (data.branches && data.branches.length > 0) {
      overview += `\n\nIt also operates **${data.branches.length} branch${data.branches.length > 1 ? 'es' : ''}**:`;
      data.branches.forEach((branch, i) => {
        overview += `\n- **Branch ${i + 1} (${branch.name || 'N/A'})** located at **${branch.address || 'N/A'}**, with **${branch.financial || 0}%** financial control and **${branch.operational || 0}%** operational control.`;
      });
    }
    return overview;
  }
 
  return (
    <div className="section-card">
      <h2 className="section-title-gradient" style={{ backgroundColor: '#000000' }}>
        2. Organisation Details
      </h2>

      {/* Organisation Fields */}
      <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label-styled">Organisation Name:</label>
          <input
            name="organisationName"
            value={data.organisationName}
            onChange={handleChange}
            className="form-input-styled focus:ring-purple-400"
            placeholder="e.g., EcoSphere AI Ltd"
            disabled={isLocked}
          />
        </div>
        <div>
          <label className="form-label-styled">Company Number:</label>
          <input
            name="companyNumber"
            value={data.companyNumber}
            onChange={handleChange}
            className="form-input-styled focus:ring-purple-400"
            placeholder="e.g., 98765432"
            disabled={isLocked}
          />
        </div>
        </div>
        <div>
          <label className="form-label-styled">Current Head Office Address:</label>
          <input
            name="currentAddress"
            value={data.currentAddress}
            onChange={handleChange}
            className="form-input-styled focus:ring-purple-400"
            placeholder="e.g., 789 Tech Drive, London, SW1A 0AB"
            disabled={isLocked}
          />
        </div>
        <div>
          <label className="form-label-styled">Registered Head Office Address:</label>
          <input
            name="registeredAddress"
            value={data.registeredAddress}
            onChange={handleChange}
            className="form-input-styled focus:ring-purple-400"
            placeholder="e.g., 101 Innovation Way, Manchester, M1 1BB"
            disabled={isLocked}
          />
        </div>
      </div>

      {/* Branches */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Branches (if any):</h3>
        {data.branches.map((branch, index) => (
          <div key={index} className="narrative-card bg-purple-50 border-purple-400">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">Branch {index + 1}</span>
              {!isLocked && (
                <button onClick={() => removeBranch(index)} className="btn-danger text-xs px-2 py-1">
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label-styled">Branch Name:</label>
                <input
                  value={branch.name}
                  onChange={(e) => handleBranchChange(index, 'name', e.target.value)}
                  className="form-input-styled"
                  placeholder="e.g., Southern Hub"
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="form-label-styled">Address:</label>
                <input
                  value={branch.address}
                  onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                  className="form-input-styled"
                  placeholder="e.g., 23 Lakeside Ave, Bristol"
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="form-label-styled">Financial Control (%):</label>
                <input
                  type="number"
                  value={branch.financial}
                  onChange={(e) => handleBranchChange(index, 'financial', e.target.value)}
                  className="form-input-styled"
                  placeholder="e.g., 100"
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="form-label-styled">Operational Control (%):</label>
                <input
                  type="number"
                  value={branch.operational}
                  onChange={(e) => handleBranchChange(index, 'operational', e.target.value)}
                  className="form-input-styled"
                  placeholder="e.g., 100"
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>
        ))}
        {!isLocked && (
          <button onClick={addBranch} className="btn-secondary">
            Add Branch
          </button>
        )}
      </div>

      {/* Overview */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Organisation Overview:</h3>
        <div className="p-4 bg-gray-50 rounded-lg prose prose-sm">
          <Markdown>{getOverviewText(data)}</Markdown>
        </div>
      </div>
    </div>
  );
};

export default OrganisationDetails;
