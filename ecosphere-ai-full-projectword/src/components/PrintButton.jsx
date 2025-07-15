import React from 'react';

const PrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-hide my-8 text-center">
      <button
        onClick={handlePrint}
        className="btn-secondary"
      >
        Print Report
      </button>
    </div>
  );
};

export default PrintButton; 