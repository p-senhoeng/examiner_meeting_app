import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, Paper, Box } from '@mui/material';

const StackedBarChart = ({ data }) => {
  const gradeOrder = ['B', 'B+', 'A-', 'A', 'A+'];
  const totalStudents = data.length;

  const gradeDistribution = data.reduce((acc, student) => {
    const grade = student['grade level'];
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  const chartData = gradeOrder.map(grade => {
    const count = gradeDistribution[grade] || 0;
    const percentage = (count / totalStudents * 100).toFixed(2);
    return {
      grade,
      count,
      percentage: parseFloat(percentage)
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <p style={{ margin: '0 0 5px' }}><strong>{`Grade: ${label}`}</strong></p>
          <p style={{ margin: '0 0 5px' }}>{`Number of Students: ${payload[0].value}`}</p>
          <p style={{ margin: '0' }}>{`Percentage: ${payload[0].payload.percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Grade Distribution</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
        </BarChart>
      </ResponsiveContainer>
      <Box mt={2}>
        <Typography variant="body2">
          This bar chart displays the distribution of grades across all students. 
          Each bar represents a grade level, and the height of the bar indicates the number of students who achieved that grade. 
          The grades are ordered from B to A+ to show the progression of performance. 
          Hover over each bar to see the exact number of students and the percentage they represent in the total student population.
          This visualization helps to quickly identify the most common grades and the overall performance trend of the class.
        </Typography>
      </Box>
    </Paper>
  );
};

export default StackedBarChart;