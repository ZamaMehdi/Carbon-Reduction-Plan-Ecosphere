import React from 'react';

const Declaration = () => (
  <div className="print-only mt-12 pt-12 border-t-2 border-dashed border-gray-300" style={{ breakBefore: 'page' }}>
    <h2 className="section-title section-title-gray mb-6">Declaration and Sign Off</h2>
    <p className="text-sm text-gray-700 mb-6 leading-relaxed">
      This Carbon Reduction Plan has been completed in accordance with PPN 006 and associated guidance and reporting standard for Carbon Reduction Plans. Emissions have been reported and recorded in accordance with the published reporting standard for Carbon Reduction Plans and the GHG Reporting Protocol corporate standard and uses the appropriate government emission conversion factors for greenhouse gas company reporting. Scope 1 and Scope 2 emissions have been reported in accordance with SECR requirements (where required), and the required subset of Scope 3 emissions have been reported in accordion with the published reporting standard for Carbon Reduction Plans and the Corporate Value Chain (Scope 3) Standard. This Carbon Reduction Plan has been reviewed and signed off by the board of directors (or equivalent management body).
    </p>
    <p className="text-md text-gray-800 mb-12">Signed on behalf of the supplier:</p>
    
    <div className="space-y-12">
      <div>
        <p className="text-sm text-gray-700">Name:</p>
        <div className="border-b border-gray-400 w-full mt-2">&nbsp;</div>
      </div>
      <div>
        <p className="text-sm text-gray-700">Date:</p>
        <div className="border-b border-gray-400 w-full mt-2">&nbsp;</div>
      </div>
    </div>

    <div className="mt-24 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
        <p className="mb-4">
            <strong>Disclaimer:</strong> The emission factors used in this tool are examples based on publicly available data citing UK Government GHG Conversion Factors. For official PPN006 compliance and accurate reporting, please refer to the latest UK Government GHG Conversion Factors for Company Reporting (e.g., from DEFRA/DESNZ).
        </p>
        <p>Owner, Concept & Design by Ghulam Ali</p>
        <p>This report is prepared by EcoSphere AI using the GHG conversion factors.</p>
    </div>
  </div>
);

export default Declaration; 