import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Typography, Paper, Box } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const GradeDistributionPieChart = ({ data }) => {
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <p style={{ margin: '0 0 5px' }}><strong>{`Grade: ${data.grade}`}</strong></p>
          <p style={{ margin: '0 0 5px' }}>{`Number of Students: ${data.count}`}</p>
          <p style={{ margin: '0' }}>{`Percentage: ${data.percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {payload.map((entry, index) => (
        <li key={`item-${index}`} style={{ display: 'inline-block', marginRight: '10px' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '10px', 
            height: '10px', 
            backgroundColor: entry.color, 
            marginRight: '5px' 
          }}></span>
          {entry.value}
        </li>
      ))}
    </ul>
  );

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Grade Distribution</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="count"
            label={({ grade, percentage }) => `${grade} ${percentage.toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      <Box mt={2}>
        <Typography variant="body2">
          This pie chart illustrates the distribution of grades across all students. 
          Each slice represents a grade level, with the size of the slice indicating the proportion of students who achieved that grade. 
          The chart is color-coded and labeled with both the grade and its percentage.
          Hover over each slice to see more detailed information, including the exact number of students and the precise percentage.
          This visualization offers a clear and immediate overview of the grade distribution, making it easy to identify the most common grades and the overall performance trend of the class.
        </Typography>
      </Box>
    </Paper>
  );
};

export default GradeDistributionPieChart;