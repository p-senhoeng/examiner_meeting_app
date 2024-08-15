import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';
import EditExplanationDialog from './EditExplanationDialog';
import ViewExplanationDialog from './ViewExplanationDialog';

const getGradeAndGPA = (score) => {
  if (score >= 95 && score <= 100) return { grade: 'A+', gpa: 9 };
  if (score >= 90 && score <= 94) return { grade: 'A+', gpa: 9 };
  if (score >= 85 && score <= 89) return { grade: 'A', gpa: 8 };
  if (score >= 80 && score <= 84) return { grade: 'A-', gpa: 7 };
  if (score >= 75 && score <= 79) return { grade: 'B+', gpa: 6 };
  if (score >= 70 && score <= 74) return { grade: 'B', gpa: 5 };
  if (score >= 65 && score <= 69) return { grade: 'B-', gpa: 4 };
  if (score >= 60 && score <= 64) return { grade: 'C+', gpa: 3 };
  if (score >= 55 && score <= 59) return { grade: 'C', gpa: 2 };
  if (score >= 50 && score <= 54) return { grade: 'C-', gpa: 1 };
  if (score >= 45 && score <= 49) return { grade: 'D', gpa: 0 };
  if (score >= 40 && score <= 44) return { grade: 'D', gpa: 0 };
  return { grade: 'E', gpa: 0 }; // 0-39
};

function DataTable({ scores, onUpdate }) {
  const [editingRow, setEditingRow] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [editExplanationDialogOpen, setEditExplanationDialogOpen] = useState(false);
  const [viewExplanationDialogOpen, setViewExplanationDialogOpen] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [modifiedRows, setModifiedRows] = useState({});

  useEffect(() => {
    console.log("Scores updated:", scores);
  }, [scores]);

  const handleOpenDialog = (row) => {
    setEditingRow(row);
    setNewGrade(row.grade);
  };

  const handleCloseDialog = () => {
    setEditingRow(null);
    setNewGrade('');
  };

  const handleOpenEditDialog = (row) => {
    setEditingRow(row);
    setCurrentExplanation(row.explanation || '');
    setEditExplanationDialogOpen(true);
  };

  const handleExplanationChange = (e) => {
    setCurrentExplanation(e.target.value);
  };

  const handleSave = () => {
    if (editingRow) {
      const updatedScores = scores.map(score => {
        if (score.name === editingRow.name && score.subject === editingRow.subject) {
          return { ...score, grade: newGrade };
        }
        return score;
      });
      onUpdate(updatedScores);
      setModifiedRows({
        ...modifiedRows,
        [`${editingRow.name}-${editingRow.subject}`]: true
      });
      handleCloseDialog(); // 关闭保存框
      handleOpenEditDialog(updatedScores.find(s => s.name === editingRow.name && s.subject === editingRow.subject));
    }
  };

  const handleOpenViewExplanationDialog = (row) => {
    console.log("Opening view dialog for:", row);
    console.log("Explanation:", row.explanation);
    setCurrentExplanation(row.explanation || '');
    setViewExplanationDialogOpen(true);
  };

  const handleCloseViewExplanationDialog = () => {
    setViewExplanationDialogOpen(false);
  };

  const handleSaveExplanation = () => {
    if (editingRow) {
      const updatedScores = scores.map(score => {
        if (score.name === editingRow.name && score.subject === editingRow.subject) {
          return { ...score, explanation: currentExplanation };
        }
        return score;
      });
      onUpdate(updatedScores);
      console.log("Saved explanation:", currentExplanation);
      setEditExplanationDialogOpen(false);
      // 确保保存后关闭保存框
      handleCloseDialog(); 
    }
  };

  return (
    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Courses</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Update</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scores.map((score, index) => {
            const { grade } = getGradeAndGPA(score.score);
            const isModified = modifiedRows[`${score.name}-${score.subject}`];
            
            return (
              <TableRow 
                key={index}
                style={{ backgroundColor: isModified ? '#FF0033' : 'inherit' }}
              >
                <TableCell>{score.name}</TableCell>
                <TableCell>{score.subject}</TableCell>
                <TableCell>{score.score}</TableCell>
                <TableCell>
                  <span 
                    onClick={() => handleOpenViewExplanationDialog(score)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {score.grade || grade}
                  </span>
                </TableCell>
                <TableCell>
                  {editingRow && editingRow.name === score.name && editingRow.subject === score.subject ? (
                    <>
                      <TextField
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                      <Button variant="contained" onClick={handleSave}>Save</Button>
                    </>
                  ) : (
                    <Button variant="contained" onClick={() => handleOpenDialog(score)}>Update grade</Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <EditExplanationDialog
        open={editExplanationDialogOpen}
        onClose={() => setEditExplanationDialogOpen(false)}
        explanation={currentExplanation}
        onChange={handleExplanationChange}
        onSave={handleSaveExplanation}
      />

      <ViewExplanationDialog
        open={viewExplanationDialogOpen}
        onClose={handleCloseViewExplanationDialog}
        explanation={currentExplanation}
      />
    </TableContainer>
  );
}

export default DataTable;
