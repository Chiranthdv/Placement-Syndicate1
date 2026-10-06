import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ExperienceListPage from './pages/ExperienceListPage';
import AddExperiencePage from './pages/AddExperiencePage';
import MyExperiencesPage from './pages/MyExperiencesPage';
import ProfilePage from './pages/ProfilePage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/experiences" element={<ExperienceListPage />} />
            <Route path="/experiences/new" element={<AddExperiencePage />} />
            <Route path="/my-experiences" element={<MyExperiencesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/upload-resume" element={<ResumeUploadPage />} />
          </Route>
          
          <Route element={<ProtectedRoute requiredRole="Admin" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
