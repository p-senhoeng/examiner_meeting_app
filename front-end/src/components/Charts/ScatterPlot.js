import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, Paper, Box } from '@mui/material';
const ScatterPlot = ({ data }) => {
  const plotData = data.map(student => ({
    name: `${student['first name']} ${student['last name']}`,
    theory: parseFloat(student['theory tests total (real)']),
    practical: parseFloat(student['practical tests total (real)'])
  }));

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Theory vs Practical Performance</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="theory" name="Theory Score" unit="%" />
          <YAxis type="number" dataKey="practical" name="Practical Score" unit="%" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Students" data={plotData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
      <Box mt={2}>
        <Typography variant="body2">
          This scatter plot compares students' performance in theory tests against their performance in practical tests. 
          Each point represents a student, with their theory score on the x-axis and practical score on the y-axis. 
          This visualization helps identify any correlation between theoretical and practical skills, 
          as well as spotting students who excel in one area but may need support in another.
        </Typography>
      </Box>
    </Paper>
  );
};


export default ScatterPlot;