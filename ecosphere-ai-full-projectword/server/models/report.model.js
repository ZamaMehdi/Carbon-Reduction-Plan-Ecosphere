// 📁 server/models/report.model.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String, required: true },
  publicationDate: String,
  organisationName: String,
  companyNumber: String,
  currentAddress: String,
  registeredAddress: String,
  branches: [
    {
      name: String,
      address: String,
      financial: String,
      operational: String,
    }
  ],
  endMonth: Number,
  endYear: Number,
  isFirstPlan: Boolean,
  numPreviousPeriods: Number,
  electricityKWH: Number,
  fleetAveCarKm: Number,
  fleetDeliveryVansKm: Number,
  businessTravelCarKm: Number,
  businessTravelBusKm: Number,
  businessTravelTrainKm: Number,
  businessTravelTaxiKm: Number,
  officeCommuteCarKm: Number,
  officeCommuteBusKm: Number,
  officeCommuteTrainKm: Number,
  officeCommuteTaxiKm: Number,
  homeWorkingHours: Number,
  hotelNights: Number,
  scope1: Number,
  scope2: Number,
  scope3: Number,
  totalEmissions: Number,
  previousPeriods: [
    {
      year: Number,
      endMonth: Number,
      scope1: Number,
      scope2: Number,
      scope3: Number,
    }
  ],
  netZeroYear: String,
  annualReductionPercentage: String,
  accessCode: String,
  locked: { type: Boolean, default: true },
  submitted: { type: Boolean, default: false },
  isDeleted: {
    type: Boolean,
    default: false
   },
 }, { timestamps: true },
 
);

module.exports = mongoose.model('Report', reportSchema);
