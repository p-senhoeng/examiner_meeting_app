import React, { useMemo, useState } from 'react';
import { Typography, Box, TextField, Autocomplete, CircularProgress } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useStudentPerformance } from './StudentPerformanceContext';

const StudentPerformanceRadar = () => {
  const { studentData, selectedFiles, isLoading } = useStudentPerformance();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = useMemo(() => {
    return selectedFiles.flatMap(filename => 
      (studentData[filename] || []).map(student => ({
        id: student['ID number'] || 'Unknown',
        name: `${student['First name'] || ''} ${student['Last name'] || ''}`.trim() || 'Unknown',
        ...student
      }))
    );
  }, [studentData, selectedFiles]);

  const radarChartData = useMemo(() => {
    if (!selectedStudent) return [];
    return [
      { subject: 'Theory Tests', A: parseFloat(selectedStudent['Theory Tests total (Real)']) || 0, fullMark: 100 },
      { subject: 'Practical Tests', A: parseFloat(selectedStudent['Practical Tests total (Real)']) || 0, fullMark: 100 },
      { subject: 'Homework', A: parseFloat(selectedStudent['Homework total (Real)']) || 0, fullMark: 100 },
      { subject: 'Project', A: parseFloat(selectedStudent['Project total (Real)']) || 0, fullMark: 100 },
      { subject: 'Engagement', A: parseFloat(selectedStudent['Engagement total (Real)']) || 0, fullMark: 100 },
    ];
  }, [selectedStudent]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (students.length === 0) {
    return <Typography>No data available. Please select a file in the Grade Distribution section.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Individual Student Performance</Typography>
      <Autocomplete
        options={students}
        getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
        value={selectedStudent}
        onChange={(event, newValue) => setSelectedStudent(newValue)}
        renderInput={(params) => <TextField {...params} label="Select Student" variant="outlined" />}
        sx={{ mb: 2 }}
      />
      {selectedStudent && (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name={selectedStudent.name} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default StudentPerformanceRadar;

