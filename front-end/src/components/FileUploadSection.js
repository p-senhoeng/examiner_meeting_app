// FileUploadSection.js

import React from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { useStudentPerformance } from './StudentPerformanceContext';

const FileUploadSection = ({ setSnackbar }) => {
  const { 
    isLoading, 
    error, 
    handleFileUpload, 
    loadFileList 
  } = useStudentPerformance();

  const onFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await handleFileUpload(file);
      setSnackbar({ open: true, message: result.message, severity: result.success ? 'success' : 'error' });
      if (result.success) {
        // Refresh the file list after successful upload
        await loadFileList();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'File upload failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button 
        variant="contained" 
        component="label" 
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={24} /> : null}
      >
        {isLoading ? 'Uploading...' : 'Upload File'}
        <input 
          type="file" 
          hidden 
          onChange={onFileUpload} 
          accept=".csv,.xlsx,.xls" 
        />
      </Button>

      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
    </Box>
  );
};

export default FileUploadSection;