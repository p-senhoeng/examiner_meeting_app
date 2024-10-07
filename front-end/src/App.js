import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import Home from './components/Home';
import CSVUpload from './components/CSVUpload';
import ReviewData from './components/DataProcessingComponent';
import App2 from './App2';
import { StudentPerformanceProvider } from './components/StudentPerformanceContext';

const theme = createTheme();

function AppContent() {
  const [visualizationData, setVisualizationData] = useState(null);
  const navigate = useNavigate();

  const handleDataReceived = (data) => {
    console.log('Data received:', data);
    setVisualizationData(data);
  };

  const handleViewVisualization = (filename, paperCode, semesterCode) => {
    console.log('Viewing visualization for:', filename);
    console.log('Paper Code:', paperCode, 'Semester Code:', semesterCode);
    navigate('/visualization', {
      state: {
        visualizationData,
        selectedFile: filename,
        paperCode,
        semesterCode,
      },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StudentPerformanceProvider>
        <Container maxWidth="lg">
          <Box my={4}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload-csv" element={<CSVUpload />} />
              <Route
                path="/review-data"
                element={
                  <ReviewData
                    onDataReceived={handleDataReceived}
                    onViewVisualization={handleViewVisualization}
                  />
                }
              />
              <Route
                path="/visualization"
                element={<App2 />}
              />
            </Routes>
          </Box>
        </Container>
      </StudentPerformanceProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;