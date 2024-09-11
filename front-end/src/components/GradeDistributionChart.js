import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  Typography, 
  Box, 
  Autocomplete, 
  TextField, 
  Chip, 
  CircularProgress, 
  Paper
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { useStudentPerformance } from './StudentPerformanceContext';
import DrillDownTooltip from './DrillDownTooltip';

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

const GradeDistributionChart = () => {
  const { files, selectedFiles, studentData, handleFileSelect, isLoading } = useStudentPerformance();
  const [drillDown, setDrillDown] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const radarRef = useRef(null);

  const calculateGradeDistribution = useCallback((data, filename) => {
    const distribution = {};

    data.forEach(student => {
      const score = parseFloat(student['Paper total (Real)'] || '0');
      const grade = calculateGrade(score);
      if (!distribution[grade]) {
        distribution[grade] = { count: 0, details: {}, studentInfo: [] };
      }
      distribution[grade].count++;
      const roundedScore = Math.round(score);
      distribution[grade].details[roundedScore] = (distribution[grade].details[roundedScore] || 0) + 1;
      distribution[grade].studentInfo.push({
        id: student['ID number'] || 'Unknown',
        name: `${student['First name'] || ''} ${student['Last name'] || ''}`.trim() || 'Unknown',
        grade: score,
        ...student
      });
    });

    return Object.entries(distribution)
      .sort((a, b) => gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]))
      .map(([grade, data]) => ({
        grade,
        [filename]: data.count,
        details: data.details,
        studentInfo: data.studentInfo
      }));
  }, []);

  const gradeDistribution = useMemo(() => {
    const allDistributions = selectedFiles.map(filename => 
      calculateGradeDistribution(studentData[filename] || [], filename)
    );

    const mergedDistribution = {};
    allDistributions.forEach(distribution => {
      distribution.forEach(item => {
        if (!mergedDistribution[item.grade]) {
          mergedDistribution[item.grade] = { grade: item.grade };
        }
        Object.assign(mergedDistribution[item.grade], {
          [Object.keys(item).find(key => key !== 'grade' && key !== 'details' && key !== 'studentInfo')]: item[Object.keys(item).find(key => key !== 'grade' && key !== 'details' && key !== 'studentInfo')],
          details: item.details,
          studentInfo: item.studentInfo
        });
      });
    });

    return Object.values(mergedDistribution)
      .sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));
  }, [selectedFiles, studentData, calculateGradeDistribution]);

  const handleBarClick = useCallback((data, index, event) => {
    setDrillDown({
      grade: data.grade,
      details: data.details,
      studentInfo: data.studentInfo,
    });
  }, []);

  const closeDrillDown = useCallback(() => {
    setDrillDown(null);
  }, []);

  const handleFileChange = (event, newValue) => {
    handleFileSelect(newValue);
    setSelectedStudent(null);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    closeDrillDown();
    if (radarRef.current) {
      radarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const barColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

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

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Grade Distribution (New Zealand System)</Typography>
        <Autocomplete
          multiple
          options={files}
          value={selectedFiles}
          onChange={handleFileChange}
          renderInput={(params) => <TextField {...params} label="Select Files" variant="outlined" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          sx={{ mb: 2 }}
        />
        {gradeDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedFiles.map((filename, index) => (
                <Bar 
                  key={filename} 
                  dataKey={filename} 
                  fill={barColors[index % barColors.length]} 
                  onClick={handleBarClick} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography>No data available. Please select a file.</Typography>
        )}
      </Paper>

      {drillDown && (
        <DrillDownTooltip
          grade={drillDown.grade}
          details={drillDown.details}
          studentInfo={drillDown.studentInfo}
          onClose={closeDrillDown}
          onStudentSelect={handleStudentSelect}
        />
      )}

      <Paper elevation={3} sx={{ p: 3, mt: 3 }} ref={radarRef}>
        <Typography variant="h5" gutterBottom>Individual Student Performance</Typography>
        {selectedStudent ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {selectedStudent.name} (ID: {selectedStudent.id})
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name={selectedStudent.name} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography>Select a student from the grade distribution to view their performance.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default GradeDistributionChart;