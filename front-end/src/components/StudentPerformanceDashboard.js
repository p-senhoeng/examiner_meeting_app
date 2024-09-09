import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Area
} from 'recharts';
import { 
  Button, CircularProgress, Typography, Paper, Box, TextField, 
  Autocomplete, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

const API_BASE_URL = 'http://localhost:5001';

const DrillDownTooltip = ({ grade, details, studentInfo, position, onClose }) => {
  const [showStudentInfo, setShowStudentInfo] = useState(false);

  if (!details || (Object.keys(details).length === 0 && (!studentInfo || studentInfo.length === 0))) {
    return (
      <Box sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        zIndex: 'tooltip',
      }}>
        <Typography variant="h6">{`Grade ${grade}`}</Typography>
        <Typography>No detailed data available for this grade.</Typography>
        <Button onClick={onClose}>Close</Button>
      </Box>
    );
  }

  const detailData = showStudentInfo
    ? studentInfo
    : Object.entries(details).map(([score, count]) => ({ score: Number(score), count }));

  return (
    <Box sx={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      p: 2,
      zIndex: 'tooltip',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <Typography variant="h6">{`Grade ${grade} ${showStudentInfo ? 'Student Information' : 'Breakdown'}`}</Typography>
      <Button onClick={() => setShowStudentInfo(!showStudentInfo)}>
        {showStudentInfo ? 'Show Grade Details' : 'Show Student Information'}
      </Button>
      <Box sx={{ my: 2 }}>
        {showStudentInfo ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Paper Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detailData.map(({ id, grade }, index) => (
                  <TableRow key={index}>
                    <TableCell>{id}</TableCell>
                    <TableCell>{grade.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={detailData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
      <Button onClick={onClose}>Close</Button>
    </Box>
  );
};

const StudentPerformanceDashboard = ({ onDataUpdate }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drillDown, setDrillDown] = useState(null);

  useEffect(() => {
    fetchFileList();
  }, []);

  const fetchFileList = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/main/list_filenames`);
      setFiles(response.data.filenames);
    } catch (error) {
      setError('Failed to fetch file list');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('student_performance_data', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/main/upload`, formData);
      fetchFileList();
      setSelectedFile(response.data[0].filename);
    } catch (error) {
      setError('File upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event, value) => {
    setSelectedFile(value);
    if (value) {
      try {
        const response = await axios.post(`${API_BASE_URL}/main/get_table_data`, { filename: value });
        setStudentData(response.data.data);
        onDataUpdate(response.data.data, response.data.columns);
      } catch (error) {
        setError('Failed to fetch student data');
      }
    }
  };


  const calculateGradeDistribution = useCallback(() => {
    const distribution = {};
    studentData.forEach(student => {
      const grade = student['grade level'];
      distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return Object.entries(distribution).map(([grade, count]) => ({ grade, count }));
  }, [studentData]);

  const handleBarClick = useCallback((data, index, event) => {
    setDrillDown({
      grade: data.grade,
      details: {}, // We would need to calculate this from the studentData
      studentInfo: studentData.filter(student => student['grade level'] === data.grade)
        .map(student => ({ id: student['ID number'], grade: parseFloat(student['Paper total (Real)']) })),
      position: { x: event.clientX, y: event.clientY },
    });
  }, [studentData]);

  const closeDrillDown = useCallback(() => {
    setDrillDown(null);
  }, []);

  const exportCsv = async () => {
    if (!selectedFile) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/main/export_csv`, 
        { filename: selectedFile },
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedFile}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setError('Failed to export CSV');
    }
  };

  const gradeDistribution = calculateGradeDistribution();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Student Performance Dashboard</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" component="label">
          Upload File
          <input type="file" hidden onChange={handleFileUpload} accept=".csv,.xlsx,.xls" />
        </Button>
      </Box>

      {isLoading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      <Autocomplete
        options={files}
        value={selectedFile}
        onChange={handleFileSelect}
        renderInput={(params) => <TextField {...params} label="Select File" variant="outlined" />}
        sx={{ mb: 2 }}
      />

      {selectedFile && (
        <Box>
          <Button onClick={exportCsv} variant="outlined" sx={{ mb: 2 }}>Export CSV</Button>

          <Typography variant="h5" gutterBottom>Grade Distribution</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" onClick={handleBarClick} />
            </BarChart>
          </ResponsiveContainer>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Grade Distribution Trend</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
              <Area type="monotone" dataKey="count" fill="#8884d8" fillOpacity={0.1} />
            </ComposedChart>
          </ResponsiveContainer>

          {drillDown && (
            <DrillDownTooltip
              grade={drillDown.grade}
              details={drillDown.details}
              studentInfo={drillDown.studentInfo}
              position={drillDown.position}
              onClose={closeDrillDown}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default StudentPerformanceDashboard;