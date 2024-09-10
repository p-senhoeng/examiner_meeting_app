import React, { useState, useMemo, useCallback } from 'react';
import { Typography, Box, Autocomplete, TextField, Chip, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStudentPerformance } from './StudentPerformanceContext';
import DrillDownTooltip from './DrillDownTooltip';

const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E'];

const GradeDistributionChart = () => {
  const { files, selectedFiles, studentData, handleFileSelect, isLoading } = useStudentPerformance();
  const [drillDown, setDrillDown] = useState(null);

  const calculateGradeDistribution = useCallback((data, filename) => {
    const distribution = {};
    data.forEach(student => {
      const grade = student['grade level'] || 'N/A';
      if (!distribution[grade]) {
        distribution[grade] = { count: 0, details: {}, studentInfo: [] };
      }
      distribution[grade].count++;
      const score = Math.round(parseFloat(student['Paper total (Real)'] || '0'));
      distribution[grade].details[score] = (distribution[grade].details[score] || 0) + 1;
      distribution[grade].studentInfo.push({
        id: student['ID number'] || 'Unknown',
        name: `${student['First name'] || ''} ${student['Last name'] || ''}`.trim() || 'Unknown',
        grade: parseFloat(student['Paper total (Real)'] || '0')
      });
    });
    return Object.entries(distribution).map(([grade, data]) => ({
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

    return Object.values(mergedDistribution).sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));
  }, [selectedFiles, studentData, calculateGradeDistribution]);

  const handleBarClick = useCallback((data, index, event) => {
    setDrillDown({
      grade: data.grade,
      details: data.details,
      studentInfo: data.studentInfo,
      position: { x: event.clientX, y: event.clientY },
    });
  }, []);

  const closeDrillDown = useCallback(() => {
    setDrillDown(null);
  }, []);

  const handleFileChange = (event, newValue) => {
    handleFileSelect(newValue);
  };

  const barColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Grade Distribution</Typography>
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
              <Bar key={filename} dataKey={filename} fill={barColors[index % barColors.length]} onClick={handleBarClick} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Typography>No data available. Please select a file.</Typography>
      )}

      {drillDown && (
        <DrillDownTooltip
          grade={drillDown.grade}
          details={drillDown.details}
          studentInfo={drillDown.studentInfo}
          position={drillDown.position}
          onClose={closeDrillDown}
        />
      )}
    </Box>
  );
};

export default GradeDistributionChart;