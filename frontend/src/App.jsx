import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';
import ClerkSync from './components/common/ClerkSync';
import InstallPWA from './components/common/InstallPWA';
import ScrollToTop from './components/common/ScrollToTop';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ActiveBookingBar from './components/booking/ActiveBookingBar';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import RoleSelection from './pages/RoleSelection';
import AdminDashboard from './pages/AdminDashboard';
import PartnerPage from './pages/PartnerPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import ProfilePage from './pages/ProfilePage';
import GeneralInfoPage from './pages/GeneralInfoPage';

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const App = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Provider store={store}>
        <BrowserRouter>
          <ScrollToTop />
          <ClerkSync />
          <InstallPWA />
          <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1c1c',
              color: '#fff',
              border: '1px solid rgba(250,204,21,0.2)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#facc15', secondary: '#000' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          
          {/* Clerk Auth Routes - Using Default Clerk Components as requested */}
          <Route path="/login/*" element={<AppLayout><div className="cl-rootBox"><SignIn routing="path" path="/login" signUpUrl="/register" /></div></AppLayout>} />
          <Route path="/register/*" element={<AppLayout><div className="cl-rootBox"><SignUp routing="path" path="/register" signInUrl="/login" /></div></AppLayout>} />
          
          <Route path="/services" element={<AppLayout><ServicesPage /></AppLayout>} />
          <Route path="/services/:id" element={<AppLayout><ServiceDetailPage /></AppLayout>} />
          <Route path="/providers" element={<AppLayout><ProvidersPage /></AppLayout>} />
          <Route path="/providers/:id" element={<AppLayout><ProviderDetailPage /></AppLayout>} />
          <Route path="/become-a-partner" element={<AppLayout><PartnerPage /></AppLayout>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          
          {/* Info Routes */}
          <Route path="/about-us" element={<AppLayout><GeneralInfoPage /></AppLayout>} />
          <Route path="/privacy-policy" element={<AppLayout><GeneralInfoPage /></AppLayout>} />
          <Route path="/terms-conditions" element={<AppLayout><GeneralInfoPage /></AppLayout>} />
          <Route path="/safety-measures" element={<AppLayout><GeneralInfoPage /></AppLayout>} />
          <Route path="/help-center" element={<AppLayout><GeneralInfoPage /></AppLayout>} />
          
          {/* Role Selection - Forced after Clerk Auth if role is missing */}
          <Route path="/select-role" element={<ProtectedRoute><AppLayout><RoleSelection /></AppLayout></ProtectedRoute>} />

          {/* User Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <AppLayout><UserDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Provider Protected Route */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <AppLayout><ProviderDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-All */}
          <Route path="*" element={
            <AppLayout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-9xl gradient-text mb-4">404</h1>
                  <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                  <a href="/" className="btn btn-primary">Back Home</a>
                </div>
              </div>
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </Provider>
    </ClerkProvider>
  );
};

export default App;
