import React from 'react';

const EmissionsForm = ({ data, handleChange, isLocked }) => {

  const toNum = (val) => val ? `${parseFloat(val).toLocaleString()} km` : '0 km';
  const toHours = (val) => val ? `${parseFloat(val).toLocaleString()} hours` : '0 hours';
  const toNights = (val) => val ? `${parseFloat(val).toLocaleString()} nights` : '0 nights';

  return (
    <div className="section-card">
      <h2 className="section-title-gradient" style={{backgroundImage: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)'}}>5. Enter Emissions Data</h2>
      <div className="space-y-8">
        
        {/* Vehicles Fleet */}
        <div>
          <span className="form-label-styled font-bold text-green-700">Vehicles Fleet (owned by the organisation) <span className="text-gray-700">(Scope 1):</span></span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="form-label-styled">Average Car:</label>
              <input type="number" name="fleetAveCarKm" value={data.fleetAveCarKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 10000" disabled={isLocked} />
            </div>
            <div>
              <label className="form-label-styled">Delivery Vans (km):</label>
              <input type="number" name="fleetDeliveryVansKm" value={data.fleetDeliveryVansKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 25000" disabled={isLocked} />
            </div>
          </div>
        </div>
        {/* Electricity Usage */}
        <div>
          <label className="form-label-styled font-bold text-green-700">Electricity Usage (kWh) <span className="text-gray-700">(Scope 2):</span></label>
          <input type="number" name="electricityKWH" value={data.electricityKWH ?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 50000" disabled={isLocked} />
        </div>
        {/* Business Travel */}
        <div>
          <span className="form-label-styled font-bold text-green-700">Business Travel by Land (km) <span className="text-gray-700">(Scope 3):</span></span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="form-label-styled">Average Car:</label>
              <input type="number" name="businessTravelCarKm" value={data.businessTravelCarKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 2000" disabled={isLocked} />
            </div>
            <div>
              <label className="form-label-styled">Bus:</label>
              <input type="number" name="businessTravelBusKm" value={data.businessTravelBusKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 500" disabled={isLocked} />
            </div>
            <div>
              <label className="form-label-styled">Train:</label>
              <input type="number" name="businessTravelTrainKm" value={data.businessTravelTrainKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 1500" disabled={isLocked} />
            </div>
            <div>
              <label className="form-label-styled">Taxi:</label>
              <input type="number" name="businessTravelTaxiKm" value={data.businessTravelTaxiKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 100" disabled={isLocked} />
            </div>
          </div>
        </div>
        {/* Office Commute */}
        <div>
          <span className="form-label-styled font-bold text-green-700">Office Commute (km) <span className="text-gray-700">(Scope 3):</span></span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="form-label-styled">Average Car:</label>
              <input type="number" name="officeCommuteCarKm" value={data.officeCommuteCarKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 1000" disabled={isLocked} />
            </div>
            <div>
              <label className="form-label-styled">Bus:</label>
              <input type="number" name="officeCommuteBusKm" value={data.officeCommuteBusKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 200" disabled={isLocked} />
            </div>
            <div>
              <label className="form-label-styled">Train:</label>
              <input type="number" name="officeCommuteTrainKm" value={data.officeCommuteTrainKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 800" disabled={isLocked} />
            </div>
            <div>
              <label className="form-label-styled">Taxi:</label>
              <input type="number" name="officeCommuteTaxiKm" value={data.officeCommuteTaxiKm?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 50" disabled={isLocked} />
            </div>
          </div>
        </div>
        {/* Home Working & Hotel Stays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label-styled">Home Working (Total Hours) <span className="text-gray-700">(Scope 3):</span></label>
            <input type="number" name="homeWorkingHours" value={data.homeWorkingHours?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 2000" disabled={isLocked} />
          </div>
          <div>
            <label className="form-label-styled">Hotel Stays (Total Nights) <span className="text-gray-700">(Scope 3):</span></label>
            <input type="number" name="hotelNights" value={data.hotelNights?? ''} onChange={handleChange} className="form-input-styled focus:ring-green-400" placeholder="e.g., 50" disabled={isLocked} />
          </div>
        </div>
      </div>

      {/* Static Data for Print */}
      <div className="print-only p-4 border border-green-200 rounded-lg">
        <h3 className="text-lg font-bold text-green-800 mb-4">Entered Data:</h3>
        <p><strong>Electricity Usage (Scope 2):</strong> {data.electricityKWH ? `${parseFloat(data.electricityKWH).toLocaleString()} kWh` : '0 kWh'}</p>
        
        <div className="mt-4">
          <p className="font-bold">Vehicles Fleet (owned by the organisation) (Scope 1):</p>
          <ul className="list-disc list-inside ml-4">
            <li>Average Car: {toNum(data.fleetAveCarKm)}</li>
            <li>Delivery Vans: {toNum(data.fleetDeliveryVansKm)}</li>
          </ul>
        </div>

        <div className="mt-4">
          <p className="font-bold">Business Travel by Land (Scope 3):</p>
          <ul className="list-disc list-inside ml-4">
            <li>Average Car: {toNum(data.businessTravelCarKm)}</li>
            <li>Bus: {toNum(data.businessTravelBusKm)}</li>
            <li>Train: {toNum(data.businessTravelTrainKm)}</li>
            <li>Taxi: {toNum(data.businessTravelTaxiKm)}</li>
          </ul>
        </div>

        <div className="mt-4">
          <p className="font-bold">Office Commute (Scope 3):</p>
          <ul className="list-disc list-inside ml-4">
            <li>Average Car: {toNum(data.officeCommuteCarKm)}</li>
            <li>Bus: {toNum(data.officeCommuteBusKm)}</li>
            <li>Train: {toNum(data.officeCommuteTrainKm)}</li>
            <li>Taxi: {toNum(data.officeCommuteTaxiKm)}</li>
          </ul>
        </div>

        <div className="mt-4">
          <p><strong>Home Working (Total Hours) (Scope 3):</strong> {toHours(data.homeWorkingHours)}</p>
          <p><strong>Hotel Stays (Total Nights) (Scope 3):</strong> {toNights(data.hotelNights)}</p>
        </div>
      </div>
    </div>
  );
};

export default EmissionsForm;