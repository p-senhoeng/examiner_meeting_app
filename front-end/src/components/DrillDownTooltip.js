import React, { useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  useTheme, useMediaQuery, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DrillDownTooltip = ({ grade, details, studentInfo, onClose, onStudentSelect }) => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!details || (Object.keys(details).length === 0 && (!studentInfo || studentInfo.length === 0))) {
    return null;
  }

  const detailData = Object.entries(details).map(([score, count]) => ({ 
    score: Number(score), 
    count: Math.round(count)
  }));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStudentClick = (student) => {
    onStudentSelect(student);
    onClose();
  };

  return (
    <Paper 
      sx={{
        position: 'fixed',
        left: fullScreen ? 0 : '10%',
        top: fullScreen ? 0 : '10%',
        right: fullScreen ? 0 : '10%',
        bottom: fullScreen ? 0 : '10%',
        p: 3,
        zIndex: 'tooltip',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: fullScreen ? 0 : 2,
        boxShadow: 24,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2" color="primary">
          Grade {grade} Details
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Grade Distribution" />
        <Tab label="Student List" />
      </Tabs>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tabValue === 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={detailData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: 'Score', position: 'insideBottom', offset: -5 }} />
              <YAxis allowDecimals={false} label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => Math.round(value)} />
              <Bar dataKey="count" fill={theme.palette.primary.main} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentInfo.map((student, index) => (
                  <TableRow 
                    key={index}
                    hover
                    onClick={() => handleStudentClick(student)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.id}</TableCell>
                    <TableCell align="right">{student.grade.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
};

export default DrillDownTooltip;