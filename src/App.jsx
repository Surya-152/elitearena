// src/App.jsx — v9 FINAL — All features + AmbientSound + Multi-ad
import { lazy, Suspense }               from 'react';
import { BrowserRouter, Routes, Route }  from 'react-router-dom';
import { Toaster }                       from 'react-hot-toast';
import { AuthProvider }                  from './context/AuthContext';
import { ProtectedRoute, AdminRoute }    from './components/common/ProtectedRoute';
import Navbar                            from './components/common/Navbar';
import Footer                            from './components/common/Footer';
import AmbientSound                      from './components/common/AmbientSound';

// Lazy pages
const Home             = lazy(() => import('./pages/Home'));
const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'));
const VerifyEmail      = lazy(() => import('./pages/VerifyEmail'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const TournamentDetail = lazy(() => import('./pages/TournamentDetail'));
const Wallet           = lazy(() => import('./pages/Wallet'));
const Leaderboard      = lazy(() => import('./pages/Leaderboard'));
const Profile          = lazy(() => import('./pages/Profile'));
const KYC              = lazy(() => import('./pages/KYC'));
const Support          = lazy(() => import('./pages/Support'));
const ElitePass        = lazy(() => import('./pages/ElitePass'));
const Achievements     = lazy(() => import('./pages/Achievements'));
const Stats            = lazy(() => import('./pages/Stats'));
const Team             = lazy(() => import('./pages/Team'));
const News             = lazy(() => import('./pages/news/News'));
const ArticleDetail    = lazy(() => import('./pages/news/ArticleDetail'));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const PrivacyPolicy    = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService   = lazy(() => import('./pages/legal/TermsOfService'));
const Compliance       = lazy(() => import('./pages/legal/Compliance'));
const NotFound         = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-ea-cyan/20 border-t-ea-cyan animate-spin" />
        <p className="font-mono text-xs text-ea-muted animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"                element={<Home />}           />
            <Route path="/login"           element={<Login />}          />
            <Route path="/register"        element={<Register />}       />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email"    element={<VerifyEmail />}    />
            <Route path="/leaderboard"     element={<Leaderboard />}    />
            <Route path="/news"            element={<News />}           />
            <Route path="/news/:id"         element={<ArticleDetail />}  />
            <Route path="/privacy"         element={<PrivacyPolicy />}  />
            <Route path="/terms"           element={<TermsOfService />} />
            <Route path="/compliance"      element={<Compliance />}     />

            {/* Protected */}
            <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>}        />
            <Route path="/tournament/:id"  element={<ProtectedRoute><TournamentDetail /></ProtectedRoute>} />
            <Route path="/wallet"          element={<ProtectedRoute><Wallet /></ProtectedRoute>}           />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>}          />
            <Route path="/kyc"             element={<ProtectedRoute><KYC /></ProtectedRoute>}              />
            <Route path="/support"         element={<ProtectedRoute><Support /></ProtectedRoute>}          />
            <Route path="/elite-pass"      element={<ProtectedRoute><ElitePass /></ProtectedRoute>}        />
            <Route path="/achievements"    element={<ProtectedRoute><Achievements /></ProtectedRoute>}     />
            <Route path="/stats"           element={<ProtectedRoute><Stats /></ProtectedRoute>}            />
            <Route path="/team"            element={<ProtectedRoute><Team /></ProtectedRoute>}             />

            {/* Admin */}
            <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>}            />

            {/* 404 */}
            <Route path="*"               element={<NotFound />}       />
          </Routes>
        </Suspense>

        <Footer />

        {/* Ambient sound button — fixed bottom-right */}
        <AmbientSound />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background:   '#10101f',
              color:        '#ccd0f0',
              border:       '1px solid rgba(30,30,58,0.9)',
              fontFamily:   '"Outfit", sans-serif',
              fontSize:     '14px',
              borderRadius: '12px',
              boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: { style:{borderColor:'rgba(0,255,136,0.3)'}, iconTheme:{primary:'#00ff88',secondary:'#10101f'} },
            error:   { style:{borderColor:'rgba(255,0,128,0.3)'}, iconTheme:{primary:'#ff0080',secondary:'#10101f'} },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
