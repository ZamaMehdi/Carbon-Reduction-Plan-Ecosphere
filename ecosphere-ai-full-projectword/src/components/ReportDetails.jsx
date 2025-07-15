import React from 'react';

const ReportDetails = ({ data, handleChange, isLocked }) => {
  return (
    <div className="section-card">
      <h2 className="section-title-gradient" style={{ backgroundColor: '#6366f1' }}>1. Report Details</h2>
      <div className="space-y-6">
        <div className="print-hide">
          <label htmlFor="publicationDate" className="form-label-styled">Publication Date:</label>
          <input
            type="date"
            id="publicationDate"
            name="publicationDate"
            value={data.publicationDate}
            onChange={handleChange}
            className="form-input-styled focus:ring-cyan-400 md:w-1/2"
            disabled={isLocked}
          />
        </div>
        <div className="print-only mb-4">
          <p className="form-label-styled">Publication Date:</p>
          <p className="py-2 px-3">{data.publicationDate || 'dd-mm-yyyy'}</p>
        </div>
        {data.publicationDate && (
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="section-subtitle section-title-blue">Report Publication:</h3>
          <p className="text-gray-700">This report is published on{' '}
           <strong>
           {(() => {
             const date = new Date(data.publicationDate);
             const dd = String(date.getDate()).padStart(2, '0');
             const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
             const yyyy = date.getFullYear();
             return `${dd}-${mm}-${yyyy}`;
           })()}</strong>.</p>
        </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetails; 