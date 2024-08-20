import React, { useState } from 'react';
import { Button, Typography, CircularProgress, Box } from '@mui/material';
import axios from 'axios';

const FileUpload = ({ onDataReceived }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError('');
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onDataReceived(response.data);
    } catch (err) {
      setError('Error uploading file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="contained" component="span">
          Select File
        </Button>
      </label>
      {file && <Typography variant="body1">{file.name}</Typography>}
      <Button
        variant="contained"
        onClick={uploadFile}
        disabled={!file || uploading}
        style={{ marginLeft: '10px' }}
      >
        {uploading ? <CircularProgress size={24} /> : 'Upload'}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default FileUpload;