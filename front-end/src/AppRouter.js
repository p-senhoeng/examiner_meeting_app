import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import App2 from './App2';
import { StudentPerformanceProvider } from './components/StudentPerformanceContext';

const AppRouter = () => {
  return (
    <Router>
      <StudentPerformanceProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/visualization" element={<App2 />} />
        </Routes>
      </StudentPerformanceProvider>
    </Router>
  );
};

export default AppRouter;