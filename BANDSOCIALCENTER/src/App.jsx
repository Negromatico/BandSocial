import React from 'react';
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

const App = () => {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:uid" element={<ProfileView />} />
      <Route path="/publicaciones" element={<Publicaciones />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
