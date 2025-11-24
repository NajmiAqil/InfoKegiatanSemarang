import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InfoDisplay from './components/InfoDisplay/InfoDisplay';
import LoginPage from './components/LoginPage';
import AtasanPage from './components/AtasanPage';
import BawahanPage from './components/BawahanPage';
import AddKegiatan from './components/AddKegiatan';
import EditKegiatan from './components/EditKegiatan';
import DetailKegiatan from './components/DetailKegiatan/DetailKegiatan';
import SignUp from './components/SignUp';
import SignUpSuccess from './components/SignUpSuccess';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<InfoDisplay />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup-success" element={<SignUpSuccess />} />
        <Route path="/atasan" element={<AtasanPage />} />
        <Route path="/bawahan" element={<BawahanPage />} />
        <Route path="/add-kegiatan" element={<AddKegiatan />} />
        <Route path="/edit-kegiatan/:id" element={<EditKegiatan />} />
        <Route path="/kegiatan/:id" element={<DetailKegiatan />} />
      </Routes>
    </div>
  );
}

export default App;