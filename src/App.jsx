import React, { Suspense, lazy } from 'react';
import './global.css';
import './styles/theme.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { auth } from './services/firebase';
import ErrorBoundary from './components/ErrorBoundary';
import { ChatDockProvider } from './contexts/ChatDockContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy loading de componentes para mejorar rendimiento
const Login = lazy(() => import('./pages/Login'));
const PreLanding = lazy(() => import('./pages/PreLanding'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileView = lazy(() => import('./pages/ProfileViewNew'));
const PublicacionesNuevo = lazy(() => import('./pages/PublicacionesNuevo'));
const Posts = lazy(() => import('./pages/Posts'));
const AppNavbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const EventosNuevo = lazy(() => import('./pages/EventosNuevo'));
const MusicmarketNuevo = lazy(() => import('./pages/MusicmarketNuevo'));
const Membership = lazy(() => import('./pages/Membership'));
const Payment = lazy(() => import('./pages/Payment'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Followers = lazy(() => import('./pages/Followers'));
const Buscar = lazy(() => import('./pages/Buscar'));
const MisPublicaciones = lazy(() => import('./pages/MisPublicaciones'));
const MisGrupos = lazy(() => import('./pages/MisGrupos'));
const GamePage = lazy(() => import('./pages/GamePage'));
const AcercaDe = lazy(() => import('./pages/AcercaDe'));
const TerminosCondiciones = lazy(() => import('./pages/TerminosCondiciones'));
const PoliticaPrivacidad = lazy(() => import('./pages/PoliticaPrivacidad'));
const Contacto = lazy(() => import('./pages/Contacto'));
const Ayuda = lazy(() => import('./pages/Ayuda'));

// Componente de loading
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <div style={{
      textAlign: 'center',
      color: 'white'
    }}>
      <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', marginBottom: '1rem' }}>
        <span className="visually-hidden">Cargando...</span>
      </div>
      <h4>BandSocial</h4>
      <p>Cargando...</p>
    </div>
  </div>
);

function MainLayout() {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register', '/reset-password', '/membership', '/payment'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);
  const shouldShowFooter = !hideNavbarPaths.includes(location.pathname);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {shouldShowNavbar && <AppNavbar />}
      <Routes>
        <Route path="/" element={<PublicacionesNuevo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:uid" element={<ProfileView />} />
        <Route path="/publicaciones" element={<PublicacionesNuevo />} />
        <Route path="/eventos" element={<EventosNuevo />} />
        <Route path="/musicmarket" element={<MusicmarketNuevo />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/prelanding" element={<PreLanding />} />
        <Route path="/grupos" element={<MisGrupos />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/followers" element={<Followers />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/mis-publicaciones" element={<MisPublicaciones />} />
        <Route path="/juego" element={<GamePage />} />
        <Route path="/acerca-de" element={<AcercaDe />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/ayuda" element={<Ayuda />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </Suspense>
  );
}

export const GuestContext = React.createContext({ isGuest: false, activateGuest: () => {}, deactivateGuest: () => {} });

const App = () => {
  const [isGuest, setIsGuest] = React.useState(() => localStorage.getItem('guest') === 'true');

  React.useEffect(() => {
    const syncGuest = () => setIsGuest(localStorage.getItem('guest') === 'true');
    window.addEventListener('storage', syncGuest);
    return () => window.removeEventListener('storage', syncGuest);
  }, []);

  // Nueva lógica: si hay usuario autenticado, fuerza modo no invitado
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (u) {
        localStorage.removeItem('guest');
        setIsGuest(false);
      }
    });
    return unsub;
  }, []);

  const activateGuest = React.useCallback(() => {
    localStorage.setItem('guest', 'true');
    setIsGuest(true);
  }, []);
  const deactivateGuest = React.useCallback(() => {
    localStorage.removeItem('guest');
    setIsGuest(false);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GuestContext.Provider value={{isGuest, activateGuest, deactivateGuest}}>
          <ChatDockProvider>
            <BrowserRouter>
              <MainLayout />
            </BrowserRouter>
          </ChatDockProvider>
        </GuestContext.Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
