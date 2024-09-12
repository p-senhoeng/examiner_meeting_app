import React, { useMemo, useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useStudentPerformance } from './StudentPerformanceContext';

const GradeDistributionLineChart = () => {
  const { selectedFiles, studentData } = useStudentPerformance();
  const [chartType, setChartType] = useState('line');

  const gradeDistribution = useMemo(() => {
    const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E'];
    
    const calculateGrade = (score) => {
      if (score >= 90) return 'A+';
      if (score >= 85) return 'A';
      if (score >= 80) return 'A-';
      if (score >= 75) return 'B+';
      if (score >= 70) return 'B';
      if (score >= 65) return 'B-';
      if (score >= 60) return 'C+';
      if (score >= 55) return 'C';
      if (score >= 50) return 'C-';
      if (score >= 40) return 'D';
      return 'E';
    };

    const distribution = {};

    selectedFiles.forEach(filename => {
      const data = studentData[filename] || [];
      data.forEach(student => {
        const score = parseFloat(student['Paper total (Real)'] || '0');
        const grade = calculateGrade(score);
        if (!distribution[grade]) {
          distribution[grade] = { grade };
          selectedFiles.forEach(f => distribution[grade][f] = 0);
        }
        distribution[grade][filename]++;
      });
    });

    return Object.values(distribution).sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));
  }, [selectedFiles, studentData]);

  console.log('Grade Distribution:', gradeDistribution);

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

  const ChartComponent = chartType === 'line' ? LineChart : AreaChart;
  const DataComponent = chartType === 'line' ? Line : Area;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Grade Distribution Trend</Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="chart type"
        >
          <ToggleButton value="line" aria-label="line chart">
            Line
          </ToggleButton>
          <ToggleButton value="area" aria-label="area chart">
            Area
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ width: '100%', height: 400 }}>
        {gradeDistribution.length > 0 && selectedFiles.length > 0 ? (
          <ResponsiveContainer>
            <ChartComponent data={gradeDistribution}>
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