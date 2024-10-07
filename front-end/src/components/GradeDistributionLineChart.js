import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Box, Paper, CircularProgress, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStudentPerformance } from './StudentPerformanceContext';
import { fetchGradeLevelData } from './studentDataService';

const GradeDistributionLineChart = ({ initialFileName, onDownloadSuccess, onDownloadError }) => {
  const { selectedFiles, handleFileSelect } = useStudentPerformance();
  const [gradeDistribution, setGradeDistribution] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    if (initialFileName && !selectedFiles.includes(initialFileName)) {
      handleFileSelect([initialFileName]);
    }
  }, [initialFileName, selectedFiles, handleFileSelect]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const newDistribution = {};
      for (const filename of selectedFiles) {
        try {
          const gradeLevelData = await fetchGradeLevelData(filename);
          const distribution = calculateDistribution(gradeLevelData);
          newDistribution[filename] = distribution;
        } catch (error) {
          console.error(`Error fetching data for ${filename}:`, error);
        }
      }
      setGradeDistribution(newDistribution);
      setIsLoading(false);
    };

    if (selectedFiles.length > 0) {
      fetchData();
    }
  }, [selectedFiles]);

  const calculateDistribution = (gradeLevelData) => {
    const distribution = {};
    gradeLevelData.forEach(grade => {
      distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return distribution;
  };

  const chartData = useMemo(() => {
    const defaultGradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E'];
    const allGrades = new Set(defaultGradeOrder);

    // Collect all unique grades from all files
    Object.values(gradeDistribution).forEach(distribution => {
      Object.keys(distribution).forEach(grade => allGrades.add(grade));
    });

    // Sort grades
    const sortedGrades = [...allGrades].sort((a, b) => {
      const aIndex = defaultGradeOrder.indexOf(a);
      const bIndex = defaultGradeOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return sortedGrades.map(grade => {
      const data = { grade };
      selectedFiles.forEach(file => {
        data[file] = gradeDistribution[file]?.[grade] || 0;
      });
      return data;
    });
  }, [gradeDistribution, selectedFiles]);

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const handleDownload = async () => {
    try {
      // Implementation of chart download logic
      onDownloadSuccess('Grade Distribution Line Chart');
    } catch (error) {
      console.error('Error downloading chart:', error);
      onDownloadError('Grade Distribution Line Chart');
    }
  };

  const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

  const ChartComponent = chartType === 'line' ? LineChart : AreaChart;
  const DataComponent = chartType === 'line' ? Line : Area;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Grade Distribution Trend</Typography>
        <Box>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
          >
            <ToggleButton value="line" aria-label="line chart">
              Line
            </ToggleButton>
            <ToggleButton value="area" aria-label="area chart">
              Area
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
  variant="contained"
  onClick={handleDownload}
  sx={{
    backgroundColor: '#BE0028', // Set the background color
    color: 'white', // Set the text color
    '&:hover': {
      backgroundColor: '#8A001D', // Set the color when hovered
    },
  }}
>
  Download Chart
</Button>

        </Box>
      </Box>
      <Box sx={{ height: 400 }}>
        {isLoading ? (
          <CircularProgress />
        ) : chartData.length > 0 && selectedFiles.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedFiles.map((filename, index) => (
                <DataComponent 
                  key={filename}
                  type="monotone"
                  dataKey={filename}
                  stroke={lineColors[index % lineColors.length]}
                  fill={lineColors[index % lineColors.length]}
                  fillOpacity={chartType === 'area' ? 0.3 : 1}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              ))}
            </ChartComponent>
          </ResponsiveContainer>
        ) : (
          <Typography>No data available. Please select files to display the grade distribution.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default GradeDistributionLineChart;