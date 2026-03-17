import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentSignup from './pages/StudentSignup';
import TeacherSignup from './pages/TeacherSignup';
import PrincipalSignup from './pages/PrincipalSignup';
import PrincipalDashboard from './pages/PrincipalDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ExamInterface from './pages/ExamInterface';

export default function App() {
  const { user } = useStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        
        {/* Signup Routes */}
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/teacher" element={<TeacherSignup />} />
        <Route path="/signup/principal" element={<PrincipalSignup />} />
        <Route 
          path="/dashboard/principal/*" 
          element={user?.role === 'principal' ? <PrincipalDashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard/teacher/*" 
          element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard/student/*" 
          element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/exam/:examId" 
          element={user?.role === 'student' ? <ExamInterface /> : <Navigate to="/" />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
