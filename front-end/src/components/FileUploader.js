import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';

const FileUploader = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('student_performance_data', file);

    try {
      const response = await fetch('http://localhost:5001/main/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button
      variant="contained"
      component="label"
      disabled={isUploading}
    >
      {isUploading ? <CircularProgress size={24} /> : 'Upload File'}
      <input
        type="file"
        hidden
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.xls"
      />
    </Button>
  );
};

export default FileUploader;