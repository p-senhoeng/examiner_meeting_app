import React, { useMemo, useState, useRef } from 'react';
import { 
  Typography, Box, TextField, Autocomplete, CircularProgress, useTheme, 
  Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button
} from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useStudentPerformance } from './StudentPerformanceContext';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const StudentPerformanceRadar = ({ onDownloadSuccess, onDownloadError }) => {
  const { 
    studentData, 
    selectedFiles, 
    isLoading, 
    selectedStudentsForRadar, 
    addStudentToRadar, 
    removeStudentFromRadar 
  } = useStudentPerformance();
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const chartRef = useRef(null);

  const allStudents = useMemo(() => {
    return selectedFiles.flatMap(filename => 
      (studentData[filename] || []).map(student => ({
        id: student['ID number'] || 'Unknown',
        name: `${student['First name'] || ''} ${student['Last name'] || ''}`.trim() || 'Unknown',
        ...student
      }))
    );
  }, [studentData, selectedFiles]);

  const radarChartData = useMemo(() => {
    if (selectedStudentsForRadar.length === 0) return [];
    
    const subjects = [
      'External tool: Laboratory 1 - Osmosis - 2024 (Real)',
      'External tool: Cells and Microscopy (Real)',
      'External tool: Post-lab - Heart and lung dissection - 2024 (Real)',
      'External tool: Acids & Bases, Blood (Real)',
      'External tool: Lab: Musculoskeletal - Deer Knee Dissection (Real)',
      'Assignment: MCQ 1 (20%) (Real)',
      'Assignment: MCQ 2 (20%) (Real)',
      'Assignment: SAQ 1 (15%) (Real)',
      'Assignment: SAQ 2 (15%) (Real)'
    ];
    
    return subjects.map(subject => {
      const dataPoint = { subject: subject.replace('External tool: ', '').replace('Assignment: ', '').replace(' (Real)', '') };
      selectedStudentsForRadar.forEach((student, index) => {
        dataPoint[`Student${index + 1}`] = parseFloat(student[subject]) || 0;
      });
      return dataPoint;
    });
  }, [selectedStudentsForRadar]);

  const handleStudentChange = (event, newValue) => {
    selectedStudentsForRadar.forEach(student => removeStudentFromRadar(student.id));
    newValue.forEach(student => addStudentToRadar(student));
  };

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main
  ];

  const handleLegendClick = (entry, index) => {
    setActiveIndex(index);
  };

  const handleDownload = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        canvas.toBlob((blob) => {
          saveAs(blob, 'student_performance_radar.png');
        });
        onDownloadSuccess();
      } catch (error) {
        console.error('Error generating image:', error);
        onDownloadError();
      }
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Student Performance Comparison</Typography>
      <Autocomplete
        multiple
        options={allStudents}
        getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
        value={selectedStudentsForRadar}
        onChange={handleStudentChange}
        renderInput={(params) => <TextField {...params} label="Select Students" variant="outlined" />}
        sx={{ mb: 2 }}
      />
      {selectedStudentsForRadar.length > 0 ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Performance Radar Chart</Typography>
            <Button 
              variant="contained" 
              onClick={handleDownload}
              sx={{
                backgroundColor: '#BE0028',
                '&:hover': {
                  backgroundColor: '#8A001D',
                },
              }}
            >
              Download Chart
            </Button>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box ref={chartRef}>
                <ResponsiveContainer width="100%" height={600}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                      style={{ fontSize: 10 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {selectedStudentsForRadar.map((student, index) => (
                      <Radar
                        key={student.id}
                        name={student.name}
                        dataKey={`Student${index + 1}`}
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={index === activeIndex ? 0.6 : 0.1}
                        strokeWidth={index === activeIndex ? 3 : 1}
                      />
                    ))}
                    <Tooltip />
                    <Legend 
                      wrapperStyle={{ fontSize: 12, fontWeight: 'bold' }}
                      onClick={handleLegendClick}
                      formatter={(value, entry, index) => (
                        <span style={{ 
                          color: index === activeIndex ? colors[index % colors.length] : theme.palette.text.primary,
                          fontWeight: index === activeIndex ? 'bold' : 'normal'
                        }}>
                          {value}
                        </span>
                      )}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Assessment</TableCell>
                      {selectedStudentsForRadar.map((student) => (
                        <TableCell key={student.id} align="right">{student.name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {radarChartData.map((row) => (
                      <TableRow key={row.subject}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {row.subject}
                        </TableCell>
                        {selectedStudentsForRadar.map((student, index) => (
                          <TableCell key={student.id} align="right">
                            {row[`Student${index + 1}`].toFixed(2)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Typography>No students selected. Select students from the dropdown to compare their performance.</Typography>
      )}
    </Box>
  );
};

export default StudentPerformanceRadar;