import React, { useState } from 'react';
import { Container, Typography, Box, Tab, Tabs, Paper, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import BoxPlot from './components/Charts/BoxPlot';
import StackedBarChart from './components/Charts/StackedBarChart';
import ScatterPlot from './components/Charts/ScatterPlot';
import HeatmapChart from './components/Charts/HeatmapChart';
import RadarChartComponent from './components/Charts/RadarChartComponent';
import DataTable from './components/DataTable';
import FileUploader from './components/FileUploader';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [studentData, setStudentData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tableName, setTableName] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  const handleUploadSuccess = (data) => {
    setStudentData(data.data);
    setColumns(data.columns);
    setTableName(data.table_name);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Student Performance Analysis
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upload Student Data
            </Typography>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </Paper>
          {studentData.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {tableName}
              </Typography>
              <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab label="Data Table" />
                <Tab label="Grade Distribution" />
                <Tab label="Performance Correlation" />
                <Tab label="Individual Performance" />
                <Tab label="Assessment Correlation" />
                <Tab label="Score Distribution" />
              </Tabs>
              <Box mt={2}>
                {currentTab === 0 && <DataTable data={studentData} columns={columns} />}
                {currentTab === 1 && <StackedBarChart data={studentData} />}
                {currentTab === 2 && <ScatterPlot data={studentData} />}
                {currentTab === 3 && <RadarChartComponent student={studentData[0]} />}
                {currentTab === 4 && <HeatmapChart data={studentData} />}
                {currentTab === 5 && <BoxPlot data={studentData} />}
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;