import React, { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert, AppBar, Toolbar } from '@mui/material';
import { StudentPerformanceProvider } from './StudentPerformanceContext';
import GradeDistributionChart from './GradeDistributionChart';
import GradeDistributionLineChart from './GradeDistributionLineChart';
import StudentPerformanceRadar from './StudentPerformanceRadar';
import GradeBoxPlot from './GradeBoxPlot';

const StudentPerformanceDashboard = ({ visualizationData }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [fileName, setFileName] = useState(visualizationData?.selectedFile || '');
  const [paperCode, setPaperCode] = useState(visualizationData?.paperCode || '');
  const [semesterCode, setSemesterCode] = useState(visualizationData?.semesterCode || '');

  useEffect(() => {
    if (visualizationData) {
      setFileName(visualizationData.selectedFile || '');
      setPaperCode(visualizationData.paperCode || '');
      setSemesterCode(visualizationData.semesterCode || '');
    }
  }, [visualizationData]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadSuccess = (chartName) => {
    setSnackbar({ open: true, message: `${chartName} downloaded successfully`, severity: 'success' });
  };

  const handleDownloadError = (chartName) => {
    setSnackbar({ open: true, message: `Failed to download ${chartName}`, severity: 'error' });
  };

  return (
    <StudentPerformanceProvider>
      <Box sx={{ p: 3 }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: '#BE0028', marginBottom: 3, borderRadius: 3 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Student Performance Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <GradeDistributionChart
          initialFileName={fileName}
          initialPaperCode={paperCode}
          initialSemesterCode={semesterCode}
          key={`${fileName}-${paperCode}-${semesterCode}`}
          onDownloadSuccess={() => handleDownloadSuccess('Grade Distribution Chart')}
          onDownloadError={() => handleDownloadError('Grade Distribution Chart')}
        />

        <GradeDistributionLineChart
          initialFileName={fileName}
          initialPaperCode={paperCode}
          initialSemesterCode={semesterCode}
          key={`${fileName}-line-${paperCode}-${semesterCode}`}
          onDownloadSuccess={() => handleDownloadSuccess('Grade Distribution Line Chart')}
          onDownloadError={() => handleDownloadError('Grade Distribution Line Chart')}
        />

        <GradeBoxPlot
          initialFileName={fileName}
          initialPaperCode={paperCode}
          initialSemesterCode={semesterCode}
          key={`${fileName}-box-${paperCode}-${semesterCode}`}
          onDownloadSuccess={() => handleDownloadSuccess('Grade Box Plot')}
          onDownloadError={() => handleDownloadError('Grade Box Plot')}
        />

        <StudentPerformanceRadar
          initialFileName={fileName}
          initialPaperCode={paperCode}
          initialSemesterCode={semesterCode}
          key={`${fileName}-radar-${paperCode}-${semesterCode}`}
          onDownloadSuccess={() => handleDownloadSuccess('Student Performance Radar')}
          onDownloadError={() => handleDownloadError('Student Performance Radar')}
        />

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
