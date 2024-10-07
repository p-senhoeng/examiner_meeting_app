import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StudentPerformanceDashboard from './components/StudentPerformanceDashboard';
import Header from './components/Header';

function App2() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [visualizationData, setVisualizationData] = useState(null);

  useEffect(() => {
    if (location.state) {
      const { selectedFile, paperCode, semesterCode } = location.state;

      // Update the visualizationData to match the format expected by StudentPerformanceDashboard
      setVisualizationData({
        selectedFile,
        paperCode,
        semesterCode,
      });
    }
    setIsLoading(false);
  }, [location.state]);

  const handleGoBack = () => {
    navigate('/review-data');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Header />
      
      <StudentPerformanceDashboard visualizationData={visualizationData} />
    </Box>
  );
}

export default App2;