// Summary.js
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function Summary({ scores }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>姓名</TableCell>
            <TableCell>科目</TableCell>
            <TableCell>分数</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scores.map((score, index) => (
            <TableRow key={index}>
              <TableCell>{score.name}</TableCell>
              <TableCell>{score.subject}</TableCell>
              <TableCell>{score.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Summary;
