import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, Legend, LabelList, ComposedChart, Area, ScatterChart, Scatter
} from 'recharts';
import { 
  Typography, Paper, Box, TextField, Autocomplete, Button, 
  CircularProgress, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import axios from 'axios';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];
const GRADE_ORDER = ['E', 'D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];

const sortGrades = (a, b) => GRADE_ORDER.indexOf(a.Grade) - GRADE_ORDER.indexOf(b.Grade);

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
        borderColor: 'grey.300',
        p: 2,
        zIndex: 1000,
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
      borderColor: 'grey.300',
      p: 2,
      zIndex: 1000,
      maxWidth: 400,
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <Typography variant="h6">{`Grade ${grade} ${showStudentInfo ? 'Student Information' : 'Breakdown'}`}</Typography>
      <Button onClick={() => setShowStudentInfo(!showStudentInfo)}>
        {showStudentInfo ? 'Show Grade Details' : 'Show Student Information'}
      </Button>
      <Box sx={{ mt: 2, mb: 2 }}>
        {showStudentInfo ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Student ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Paper Total</th>
              </tr>
            </thead>
            <tbody>
              {detailData.map(({ id, grade }, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{grade.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

const GradeBarChart = ({ data, selectedDataSets, setDrillDown }) => {
  const sortedData = useMemo(() => [...data].sort(sortGrades), [data]);

  const handleBarClick = useCallback((data, index, event) => {
    const clickedGrade = data.Grade;
    const clickedDataSet = selectedDataSets[index];
    const details = data.details;
    const studentInfo = data.studentInfo;

    setDrillDown({
      grade: clickedGrade,
      details: details,
      studentInfo: studentInfo,
      position: { x: event.clientX, y: event.clientY },
    });
  }, [selectedDataSets, setDrillDown]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Grade" />
        <YAxis />
        <Tooltip />
        <Legend />
        {selectedDataSets.map((dataSetLabel, index) => (
          <Bar
            key={dataSetLabel}
            dataKey="Count"
            fill={COLORS[index % COLORS.length]}
            onClick={(data, index, event) => handleBarClick(data, index, event)}
          >
            <LabelList dataKey="Count" position="top" />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

const TrendLineChart = ({ data, selectedDataSets }) => {
  const sortedData = useMemo(() => [...data].sort(sortGrades), [data]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Grade" />
        <YAxis />
        <Tooltip />
        <Legend />
        {selectedDataSets.map((dataSetLabel, index) => (
          <Line
            key={dataSetLabel}
            type="monotone"
            dataKey="Count"
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
        {selectedDataSets.map((dataSetLabel, index) => (
          <Area
            key={`${dataSetLabel}-area`}
            type="monotone"
            dataKey="Count"
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.1}
            stroke="none"
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const FileUploader = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('student_performance_data', files[i]);
    }

    try {
      const response = await axios.post('http://localhost:5001/main/upload', formData);
      onUploadSuccess(response.data);
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
      {isUploading ? <CircularProgress size={24} /> : 'Upload File(s)'}
      <input
        type="file"
        hidden
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.xls"
        multiple
      />
    </Button>
  );
};

const GradeDistributionDashboard = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [gradeData, setGradeData] = useState([]);
  const [drillDown, setDrillDown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchGradeData(selectedFile);
    }
  }, [selectedFile]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5001/main/list_filenames');
      setFiles(response.data.filenames);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchGradeData = async (filename) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/charts/grade_level_data', { filename });
      const formattedData = formatGradeData(response.data.data);
      setGradeData(formattedData);
    } catch (error) {
      console.error('Error fetching grade data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatGradeData = (data) => {
    const gradeCounts = {};
    const gradeDetails = {};
    data.forEach(item => {
      const grade = item['grade level'];
      if (!gradeCounts[grade]) {
        gradeCounts[grade] = 0;
        gradeDetails[grade] = {};
      }
      gradeCounts[grade]++;
      const score = Math.round(parseFloat(item['Paper total (Real)']));
      if (!gradeDetails[grade][score]) {
        gradeDetails[grade][score] = 0;
      }
      gradeDetails[grade][score]++;
    });

    return Object.entries(gradeCounts).map(([Grade, Count]) => ({
      Grade,
      Count,
      details: gradeDetails[Grade],
      studentInfo: data.filter(item => item['grade level'] === Grade)
        .map(item => ({ id: item['ID number'], grade: parseFloat(item['Paper total (Real)']) }))
    }));
  };

  const handleUploadSuccess = (uploadedFiles) => {
    fetchFiles();
    alert('File(s) uploaded successfully!');
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
  };

  const closeDrillDown = () => {
    setDrillDown(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Grade Distribution Dashboard</Typography>
      
      <Box sx={{ mb: 3 }}>
        <FileUploader onUploadSuccess={handleUploadSuccess} />
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select File</InputLabel>
        <Select value={selectedFile} onChange={handleFileChange}>
          {files.map((file, index) => (
            <MenuItem key={index} value={file}>{file}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h5" gutterBottom>Grade Distribution</Typography>
          <GradeBarChart data={gradeData} selectedDataSets={['Count']} setDrillDown={setDrillDown} />
          
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Grade Distribution Trend</Typography>
          <TrendLineChart data={gradeData} selectedDataSets={['Count']} />

          {drillDown && (
            <DrillDownTooltip
              grade={drillDown.grade}
              details={drillDown.details}
              studentInfo={drillDown.studentInfo}
              position={drillDown.position}
              onClose={closeDrillDown}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default GradeDistributionDashboard;