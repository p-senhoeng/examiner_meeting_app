import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Autocomplete, 
  TextField, 
  CircularProgress,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStudentPerformance } from './StudentPerformanceContext';

const StudentDataTable = () => {
  const { files, studentData, handleFileSelect, isLoading } = useStudentPerformance();
  const [selectedFile, setSelectedFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (selectedFile && studentData[selectedFile]) {
      const data = studentData[selectedFile];
      if (data.length > 0) {
        // Create columns
        const cols = Object.keys(data[0]).map(key => ({
          field: key,
          headerName: key,
          width: 150,
          editable: false,
        }));
        setColumns(cols);

        // Create rows
        const dataRows = data.map((item, index) => ({
          id: index,
          ...item
        }));
        setRows(dataRows);

        // Prepare chart data
        const chartDataPrep = data.map((item, index) => ({
          name: index + 1,
          score: parseFloat(item['Paper total (Real)'] || 0)
        }));
        setChartData(chartDataPrep);
      } else {
        setColumns([]);
        setRows([]);
        setChartData([]);
      }
    } else {
      setColumns([]);
      setRows([]);
      setChartData([]);
    }
  }, [selectedFile, studentData]);

  const handleFileChange = (event, newValue) => {
    setSelectedFile(newValue);
    handleFileSelect([newValue]);
  };

  const averageScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.score, 0);
    return sum / chartData.length;
  }, [chartData]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Student Data Analysis
      </Typography>
      <Autocomplete
        options={files}
        value={selectedFile}
        onChange={handleFileChange}
        renderInput={(params) => <TextField {...params} label="Select File" variant="outlined" />}
        sx={{ mb: 2 }}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Score Distribution
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="average" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Student Data Table
          </Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDataTable;