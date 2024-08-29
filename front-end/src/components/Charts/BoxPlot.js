import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Typography, Paper, Box } from '@mui/material';

const BoxPlot = ({ data }) => {
  const calculateBoxPlotData = (assessment) => {
    const values = data.map(student => parseFloat(student[assessment])).sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length / 4)];
    const median = values[Math.floor(values.length / 2)];
    const q3 = values[Math.floor(values.length * 3 / 4)];
    const min = Math.max(values[0], q1 - 1.5 * (q3 - q1));
    const max = Math.min(values[values.length - 1], q3 + 1.5 * (q3 - q1));
    
    return { assessment, min, q1, median, q3, max };
  };

  const boxPlotData = [
    calculateBoxPlotData('theory tests total (real)'),
    calculateBoxPlotData('practical tests total (real)'),
    calculateBoxPlotData('homework total (real)'),
    calculateBoxPlotData('project total (real)'),
    calculateBoxPlotData('engagement total (real)')
  ];

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Score Distribution Across Assessments</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={boxPlotData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="assessment" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="min" fill="#8884d8" stackId="a" name="Minimum" />
          <Bar dataKey="q1" fill="#82ca9d" stackId="a" name="First Quartile" />
          <Bar dataKey="median" fill="#ffc658" stackId="a" name="Median" />
          <Bar dataKey="q3" fill="#ff7300" stackId="a" name="Third Quartile" />
          <Bar dataKey="max" fill="#a4de6c" stackId="a" name="Maximum" />
        </ComposedChart>
      </ResponsiveContainer>
      <Box mt={2}>
        <Typography variant="body2">
          This box plot shows the distribution of scores across different assessment types. 
          For each assessment, the plot displays five key statistics:
          - The minimum score (excluding outliers)
          - The first quartile (25th percentile)
          - The median (50th percentile)
          - The third quartile (75th percentile)
          - The maximum score (excluding outliers)
          
          This visualization helps to understand the spread and central tendency of scores for each assessment type. 
          It can identify which assessments have the widest range of scores, which have the highest median scores, 
          and if there are any significant differences in score distributions between different types of assessments.
        </Typography>
      </Box>
    </Paper>
  );
};

export default BoxPlot;