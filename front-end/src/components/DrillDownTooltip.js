import React, { useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Tabs, Tab
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DrillDownTooltip = ({ grade, details, studentInfo, position, onClose }) => {
  const [tabValue, setTabValue] = useState(0);

  if (!details || (Object.keys(details).length === 0 && (!studentInfo || studentInfo.length === 0))) {
    return (
      <Paper sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        p: 2,
        zIndex: 'tooltip',
        maxWidth: '400px',
        boxShadow: 3,
      }}>
        <Typography variant="h6">{`Grade ${grade}`}</Typography>
        <Typography>No detailed data available for this grade.</Typography>
        <Button onClick={onClose}>Close</Button>
      </Paper>
    );
  }

  const detailData = Object.entries(details).map(([score, count]) => ({ score: Number(score), count }));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      p: 2,
      zIndex: 'tooltip',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: 3,
    }}>
      <Typography variant="h6" gutterBottom>{`Grade ${grade} Details`}</Typography>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Grade Distribution" />
        <Tab label="Student List" />
      </Tabs>
      <Box sx={{ height: '300px' }}>
        {tabValue === 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={detailData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentInfo.map((student, index) => (
                  <TableRow key={index}>
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
      <Button onClick={onClose} sx={{ mt: 2 }}>Close</Button>
    </Paper>
  );
};

export default DrillDownTooltip;