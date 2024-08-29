import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';

const HeatmapChart = ({ data }) => {
  const assessments = [
    'theory tests total (real)',
    'practical tests total (real)',
    'homework total (real)',
    'project total (real)',
    'engagement total (real)'
  ];

  const calculateCorrelation = (x, y) => {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return numerator / denominator;
  };

  const correlationData = assessments.flatMap((assessment1, i) =>
    assessments.map((assessment2, j) => {
      if (i === j) return { x: i, y: j, z: 1 };
      const x = data.map(student => parseFloat(student[assessment1]) || 0);
      const y = data.map(student => parseFloat(student[assessment2]) || 0);
      return {
        x: i,
        y: j,
        z: calculateCorrelation(x, y)
      };
    })
  );

  const colorScale = (value) => {
    const hue = ((1 - Math.abs(value)) * 240).toString(10);
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Assessment Correlation Heatmap</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <XAxis
            type="number"
            dataKey="x"
            name="x"
            tickFormatter={(index) => assessments[index].split(' ')[0]}
            domain={[0, assessments.length - 1]}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="y"
            tickFormatter={(index) => assessments[index].split(' ')[0]}
            domain={[0, assessments.length - 1]}
          />
          <ZAxis type="number" dataKey="z" range={[0, 500]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (payload && payload.length) {
                const { x, y, z } = payload[0].payload;
                return (
                  <div style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
                    <p>{`${assessments[x]} vs ${assessments[y]}`}</p>
                    <p>{`Correlation: ${z.toFixed(2)}`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter
            data={correlationData}
            fill={(entry) => colorScale(entry.z)}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <Box mt={2}>
        <Typography variant="body2">
          This heatmap shows the correlation between different assessment types. 
          Darker colors indicate stronger correlations (either positive or negative). 
          Blue shades represent positive correlations, while red shades represent negative correlations.
          A correlation of 1 means perfect positive correlation, -1 means perfect negative correlation, 
          and 0 means no correlation.
        </Typography>
      </Box>
    </Paper>
  );
};

export default HeatmapChart;