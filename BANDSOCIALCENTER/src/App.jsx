import React from 'react';
import './global.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import Publicaciones from './pages/Publicaciones';
import Chat from './pages/Chat';
import Posts from './pages/Posts';
import AppNavbar from './components/Navbar';
import Eventos from './pages/Eventos';
import { auth } from './services/firebase';

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
    <GuestContext.Provider value={{isGuest, activateGuest, deactivateGuest}}>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:uid" element={<ProfileView />} />
        <Route path="/publicaciones" element={<Publicaciones />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/" element={<Publicaciones />} />
        <Route path="/musicos" element={<Home />} />
      </Routes>
      </BrowserRouter>
    </GuestContext.Provider>
  );
};

export default App;
