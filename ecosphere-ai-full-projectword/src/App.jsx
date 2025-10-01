import React, { useState, useEffect, useRef} from 'react';
import { Link , useLocation } from 'react-router-dom';
import api from './api/axiosConfig';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ReportDetails from './components/ReportDetails';
import OrganisationDetails from './components/OrganisationDetails';
import ReportingPeriod from './components/ReportingPeriod';
import EmissionsForm from './components/EmissionsForm';
import EmissionsSummary from './components/EmissionsSummary';
import ScopePieChart from './components/Charts/ScopePieChart';
import YearComparisonChart from './components/Charts/YearComparisonChart';
import ReductionPlan from './components/ReductionPlan';
import ReductionPlanResults from './components/ReductionPlanResults';
import Declaration from './components/Declaration';
import PrintButton from './components/PrintButton';
import { EMISSION_FACTORS } from './utils/emissionFactors';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import useBranchHandler from './hooks/useBranchHandler';
import TestCookie from './components/TestCookie';
import PreviousReportingPeriods from './components/PreviousReportingPeriods';
import UserReportHistory from './components/UserReportHistory';
import ReportViewPage from './components/ReportViewPage';
import RequireAdmin from './components/RequireAdmin';
import AdminEditReport from './components/AdminEditReport';

const now = new Date();
const initialFormData = {
  publicationDate: '',
  organisationName: '',
  companyNumber: '',
  currentAddress: '',
  registeredAddress: '',
  branches: [],
  endMonth: now.getMonth() + 1,
  endYear: now.getFullYear(),
  isFirstPlan: true,
  numPreviousPeriods: 0,
  electricityKWH: '',
  fleetAveCarKm: '',
  fleetDeliveryVansKm: '',
  businessTravelCarKm: '',
  businessTravelBusKm: '',
  businessTravelTrainKm: '',
  businessTravelTaxiKm: '',
  officeCommuteCarKm: '',
  officeCommuteBusKm: '',
  officeCommuteTrainKm: '',
  officeCommuteTaxiKm: '',
  homeWorkingHours: '',
  hotelNights: '',
  scope1: 0,
  scope2: 0,
  scope3: 0,
  totalEmissions: 0,
  previousPeriods: [],
  netZeroYear: '',
  annualReductionPercentage: '',
};

function App() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('formProgress');
    return saved ? JSON.parse(saved) : initialFormData;

    
  });

  const [userInfo, setUserInfo] = useState(null);
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [chartsAreFloating, setChartsAreFloating] = useState(false);
  const { addBranch, removeBranch, handleBranchChange } = useBranchHandler(formData, setFormData);
  const navigate = useNavigate();
  const reportDisplayRef = useRef();
  const location = useLocation();
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
  console.log('🌐 Loaded ADMIN_EMAIL from env:', ADMIN_EMAIL);
  
  
   useEffect(() => {
    console.log('👤 Checking email for admin redirect:', userInfo?.email);
    if (userInfo?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && location.pathname === '/') {
      console.log('✅ Redirecting to /admin');
      navigate('/admin');
    }
   }, [userInfo, location]);

   useEffect(() => {
    api
      .get('/auth/me', { withCredentials: true })
      .then((res) => {
        const { userId, email } = res.data;
        if (userId && email) {
          setUserInfo({ id: userId, email });
  
          // ✅ Fetch latest report
          api.get('/reports/latest-report', { withCredentials: true })
            .then((r) => {
              console.log('✅ Prefilling form with latest report:', r.data);
              setFormData(r.data); // 🟩 This will auto-fill the form fields
              setIsFormLocked(r.data.locked); // ✅ Use actual DB value
            })
            .catch((err) => {
              console.warn('⚠️ No report to prefill:', err.response?.data?.message || err.message);
              // optionally show empty form here
            });
        }
      })
      .catch((err) => {
        console.warn('❌ /auth/me failed:', err.response?.data || err.message);
        setUserInfo(null);
      });
  }, []);
  
  

  useEffect(() => {
    if (userInfo && !isFormLocked) {
      localStorage.setItem('formProgress', JSON.stringify(formData));
    }
  }, [formData, userInfo, isFormLocked]);

  useEffect(() => {
    if (!userInfo) return;

    api
      .get('/reports/my-report')
      .then((res) => {
        if (res.data.locked) {
          setIsFormLocked(true);
          setFormData(res.data);
          setSubmissionStatus({
            message: 'You have already submitted your report.',
            type: 'info',
          });
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          console.error('Error checking existing report:', err);
        }
      });
  }, [userInfo]);

  useEffect(() => {
    const p = (v) => parseFloat(v) || 0;
    const s1 =
      p(formData.fleetAveCarKm) * EMISSION_FACTORS.fleet_petrol_car_co2e_per_km +
      p(formData.fleetDeliveryVansKm) * EMISSION_FACTORS.fleet_diesel_van_co2e_per_km;
    const s2 = p(formData.electricityKWH) * EMISSION_FACTORS.electricity_kwh_co2e;
    const s3 =
      p(formData.businessTravelCarKm) * EMISSION_FACTORS.car_co2e_per_km +
      p(formData.businessTravelBusKm) * EMISSION_FACTORS.bus_co2e_per_km +
      p(formData.businessTravelTrainKm) * EMISSION_FACTORS.train_co2e_per_km +
      p(formData.businessTravelTaxiKm) * EMISSION_FACTORS.taxi_co2e_per_km +
      p(formData.officeCommuteCarKm) * EMISSION_FACTORS.car_co2e_per_km +
      p(formData.officeCommuteBusKm) * EMISSION_FACTORS.bus_co2e_per_km +
      p(formData.officeCommuteTrainKm) * EMISSION_FACTORS.train_co2e_per_km +
      p(formData.officeCommuteTaxiKm) * EMISSION_FACTORS.taxi_co2e_per_km +
      p(formData.homeWorkingHours) * EMISSION_FACTORS.homeworking_co2e_per_hour +
      p(formData.hotelNights) * EMISSION_FACTORS.hotel_night_co2e;

    setFormData((prev) => ({
      ...prev,
      scope1: s1 / 1000,
      scope2: s2 / 1000,
      scope3: s3 / 1000,
      totalEmissions: (s1 + s2 + s3) / 1000,
    }));
  }, [
    formData.electricityKWH,
    formData.fleetAveCarKm,
    formData.fleetDeliveryVansKm,
    formData.businessTravelCarKm,
    formData.businessTravelBusKm,
    formData.businessTravelTrainKm,
    formData.businessTravelTaxiKm,
    formData.officeCommuteCarKm,
    formData.officeCommuteBusKm,
    formData.officeCommuteTrainKm,
    formData.officeCommuteTaxiKm,
    formData.homeWorkingHours,
    formData.hotelNights,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      let updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'numPreviousPeriods') {
        const num = parseInt(value, 10) || 0;
        const endYear = parseInt(prev.endYear, 10) || new Date().getFullYear();
        const periods = [];
        for (let i = 1; i <= num; i++) {
          const year = endYear - i;
          const existing = prev.previousPeriods?.find((p) => p.year === year) || {};
          periods.push({
            year,
            scope1: existing.scope1 || '',
            scope2: existing.scope2 || '',
            scope3: existing.scope3 || '',
          });
        }
        updated.previousPeriods = periods;
      }
      if (name === 'endYear' && prev.numPreviousPeriods > 0) {
        const num = parseInt(prev.numPreviousPeriods, 10) || 0;
        const endYear = parseInt(value, 10) || new Date().getFullYear();
        const periods = [];
        for (let i = 1; i <= num; i++) {
          const year = endYear - i;
          const existing = prev.previousPeriods?.find((p) => p.year === year) || {};
          periods.push({
            year,
            scope1: existing.scope1 || '',
            scope2: existing.scope2 || '',
            scope3: existing.scope3 || '',
          });
        }
        updated.previousPeriods = periods;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const requiredFields = [
      { key: 'organisationName', label: 'Organisation Name' },
      { key: 'companyNumber', label: 'Company Number' },
      { key: 'currentAddress', label: 'Current Head Office Address' },
      { key: 'registeredAddress', label: 'Registered Head Office Address' },
    ];
  
    const missing = requiredFields.filter((f) => !formData[f.key]?.trim());
    if (missing.length > 0) {
      const fieldNames = missing.map((f) => f.label).join(', ');
      setSubmissionStatus({
        message: `Please complete the required fields: ${fieldNames}`,
        type: 'error',
      });
      return;
    }
  
    try {
      // ⬇️ Fetch base64 chart image from ReportDisplay
      const scopeChartImage = reportDisplayRef.current?.getScopeChartImage?.();
      console.log('📸 Scope chart base64:', scopeChartImage);

      // ⬇️ Attach it to the data
      const payload = {
        ...formData,
        scopePieChart: scopeChartImage,
      };
  
      await api.post('/reports', payload);
      setIsFormLocked(true);
      setSubmissionStatus({ message: 'Submitted successfully!', type: 'success' });
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      setSubmissionStatus({
        message: err.response?.data?.message || 'Submission failed.',
        type: 'error',
      });
    }
  };
  

  const handlePreviousPeriodChange = (year, field, value) => {
    setFormData((prev) => ({
      ...prev,
      previousPeriods: prev.previousPeriods.map((p) =>
        p.year === year ? { ...p, [field]: value } : p
      ),
    }));
  };


  if (!userInfo) return <AuthPage
  onAuthSuccess={(user, report) => {
    setUserInfo(user);
    if (report) {
      setFormData(report);
      setIsFormLocked(true);
    }
  }}
/>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-custom-gold min-h-screen py-8">
            <main className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
              <Header
                onLogout={async () => {
                  try {
                    await api.post('/auth/logout');
                  } catch (err) {
                    console.error('Logout failed:', err);
                  } finally {
                    setUserInfo(null);
                    localStorage.removeItem('formProgress');
                    setFormData(initialFormData); // 

                  }
                }}
              />
              {userInfo && (
        <div className="mb-6 text-right">
       <Link
        to="/my-reports"
        className="text-blue-700 hover:underline font-medium"
       >
       📜 View My Submitted Reports
        </Link>
        </div>
       )}
              <ReportDetails data={formData} handleChange={handleChange} isLocked={isFormLocked} />
              <OrganisationDetails data={formData}
                  handleChange={handleChange}
                  handleBranchChange={handleBranchChange}
                  addBranch={addBranch}           //  Make sure this is passed
                  removeBranch={removeBranch}     //  Same for remove
                  isLocked={isFormLocked} />
              <ReportingPeriod
                data={formData}
                handleChange={handleChange}
                isLocked={isFormLocked}
              />
              <PreviousReportingPeriods
                data={formData}
                handleChange={handleChange}
                previousPeriods={formData.previousPeriods}
                handlePreviousPeriodChange={handlePreviousPeriodChange}
                isLocked={isFormLocked}
               />
              <EmissionsForm data={formData} handleChange={handleChange} isLocked={isFormLocked} />
              <EmissionsSummary data={formData} />
              <ReductionPlan
                netZeroYear={formData.netZeroYear}
                annualReductionPercentage={formData.annualReductionPercentage}
                onChange={handleChange}
                isLocked={isFormLocked}
              />
              {formData.totalEmissions > 0 &&
                formData.netZeroYear &&
                formData.annualReductionPercentage && (
                  <ReductionPlanResults
                  currentEmissions={parseFloat(formData.totalEmissions)}
                  netZeroYear={parseInt(formData.netZeroYear)}
                  annualReductionPercentage={parseFloat(formData.annualReductionPercentage)}
                  />
                )}
              <Declaration />
              <div className="mt-6 flex justify-end print-hide">
                <PrintButton />
                {!isFormLocked && (
                  <button onClick={handleSubmit} className="btn-primary">
                    Save Report
                  </button>
                )}
              </div>

              {/* <div className="p-6">
         <h1 className="text-2xl font-bold mb-4">Test Cookie Page</h1>
         <TestCookie />
          </div> */}

              {submissionStatus && <p className="mt-4 text-center text-lg">{submissionStatus.message}</p>}
              <div className="h-[400px] sm:h-[420px] bg-transparent" />
            </main>
          </div>
         }
         />
       
        <Route
            path="/admin"
        element={
       <RequireAdmin user={userInfo}>
      <AdminDashboard />
     </RequireAdmin>
      }
      />
         <Route path="/admin/edit-report/:id" element={<RequireAdmin user={userInfo}><AdminEditReport /></RequireAdmin>} />
      
      <Route path="/my-reports" element={<UserReportHistory />} />
      <Route path="/my-reports/:id" element={<ReportViewPage />} />
      
       <Route path="/view-report/:id" element={<ReportViewPage isAdminView={false} />} />
       <Route path="/admin/view-report/:id" element={<RequireAdmin user={userInfo}><ReportViewPage isAdminView={true} /></RequireAdmin>} />
       
       {/* <Route path="/printable-report/:id" element={<ReportViewPage isAdminView={true} isPrintable={true} />} /> */}

    </Routes>
  );
}

export default App;
