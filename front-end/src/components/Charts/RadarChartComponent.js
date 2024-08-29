import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Typography, Paper, Box } from '@mui/material';

const RadarChartComponent = ({ student }) => {
  const data = [
    { subject: 'Theory Tests', A: parseFloat(student['theory tests total (real)']), fullMark: 100 },
    { subject: 'Practical Tests', A: parseFloat(student['practical tests total (real)']), fullMark: 100 },
    { subject: 'Homework', A: parseFloat(student['homework total (real)']), fullMark: 100 },
    { subject: 'Project', A: parseFloat(student['project total (real)']), fullMark: 100 },
    { subject: 'Engagement', A: parseFloat(student['engagement total (real)']), fullMark: 100 },
  ];

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Individual Student Performance</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name={`${student['first name']} ${student['last name']}`} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
      <Box mt={2}>
        <Typography variant="body2">
          This radar chart displays an individual student's performance across different assessment types. 
          Each axis represents a different aspect of the course (Theory Tests, Practical Tests, Homework, Project, and Engagement). 
          The further the data point is from the center, the higher the score in that area. 
          This visualization helps to quickly identify a student's strengths and areas for improvement. 
          A well-rounded student would have a more circular shape, while irregular shapes indicate varying performance across different areas.
        </Typography>
      </Box>
    </Paper>
  );
};

export default RadarChartComponent;