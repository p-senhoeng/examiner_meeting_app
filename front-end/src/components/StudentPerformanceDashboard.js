// StudentPerformanceDashboard.js

import React from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { StudentPerformanceProvider } from './StudentPerformanceContext';
import FileUploadSection from './FileUploadSection';
import GradeDistributionChart from './GradeDistributionChart';
import StudentPerformanceRadar from './StudentPerformanceRadar';

const StudentPerformanceDashboard = () => {
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <StudentPerformanceProvider>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Student Performance Dashboard</Typography>
        <FileUploadSection setSnackbar={setSnackbar} />
        <GradeDistributionChart />
        <StudentPerformanceRadar />
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </StudentPerformanceProvider>
  );
};

export default StudentPerformanceDashboard;
