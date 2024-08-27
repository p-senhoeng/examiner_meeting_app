import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Button } from '@mui/material';
import ScoreUpload from './components/ScoreUpload';
import DataVisualization from './components/DataVisualization';
import DataTable from './components/DataTable';

const theme = createTheme();

function App() {
  const [scores, setScores] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);

  const handleScoreUpload = (uploadedScores) => {
    setScores(uploadedScores);
  };

  const handleVisualize = () => {
    setShowVisualization(true);
  };

  const handleBackToUpload = () => {
    setShowVisualization(false);
  };

  const handleScoreUpdate = (updatedScores) => {
    setScores(updatedScores);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        {!showVisualization ? (
          <>
            <h1>Student Achievement Management Center</h1>
            <ScoreUpload onUpload={handleScoreUpload} />
            {scores.length > 0 && (
              <>
                <DataTable 
                  scores={scores} 
                  onUpdate={handleScoreUpdate}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleVisualize} 
                  style={{ marginTop: '20px' }}
                >
                  Data Visualization
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <DataVisualization scores={scores} />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBackToUpload} 
              style={{ marginTop: '20px' }}
            >
              Return
            </Button>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
