import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Typography, Paper, Box, TextField, Autocomplete } from '@mui/material';

const RadarChartComponent = ({ data, selectedStudent, onStudentChange }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (selectedStudent) {
      const newChartData = [
        { subject: 'Theory Tests', A: parseFloat(selectedStudent['theory tests total (real)']), fullMark: 100 },
        { subject: 'Practical Tests', A: parseFloat(selectedStudent['practical tests total (real)']), fullMark: 100 },
        { subject: 'Homework', A: parseFloat(selectedStudent['homework total (real)']), fullMark: 100 },
        { subject: 'Project', A: parseFloat(selectedStudent['project total (real)']), fullMark: 100 },
        { subject: 'Engagement', A: parseFloat(selectedStudent['engagement total (real)']), fullMark: 100 },
      ];
      setChartData(newChartData);
    }
  }, [selectedStudent]);

  const handleStudentSelect = (event, value) => {
    onStudentChange(value);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Individual Student Performance</Typography>
      <Box mb={2}>
        <Autocomplete
          options={data}
          getOptionLabel={(option) => `${option['first name']} ${option['last name']} (ID: ${option['id number']})`}
          value={selectedStudent}
          onChange={handleStudentSelect}
          renderInput={(params) => <TextField {...params} label="Select Student" variant="outlined" />}
        />
      </Box>
      {selectedStudent && (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name={`${selectedStudent['first name']} ${selectedStudent['last name']}`} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      )}
      <Box mt={2}>
        <Typography variant="body2">
          This radar chart displays the selected student's performance across different assessment types. 
          Each axis represents a different aspect of the course (Theory Tests, Practical Tests, Homework, Project, and Engagement). 
          The further the data point is from the center, the higher the score in that area. 
          This visualization helps to quickly identify a student's strengths and areas for improvement. 
          Use the dropdown above to select and view different students' performance.
        </Typography>
      </Box>
    </Paper>
  );
};

export default RadarChartComponent;