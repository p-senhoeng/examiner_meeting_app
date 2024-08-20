import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Button } from '@mui/material';
import DataVisualization from './components/DataVisualization';
import DataTable from './components/DataTable';

const theme = createTheme();

function App() {
  const [scores, setScores] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);

  const handleVisualize = () => {
    setShowVisualization(true);
  };

  const handleBackToUpload = () => {
    setShowVisualization(false);
  };

  const handleScoreUpdate = (updatedScores) => {
    // Ensure updatedScores is an array
    if (Array.isArray(updatedScores)) {
      setScores(updatedScores);
    } else {
      console.error("Updated scores are not an array:", updatedScores);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        {!showVisualization ? (
          <>
            <h1>Student Achievement Management Center</h1>
            <DataTable 
              scores={scores} 
              onUpdate={handleScoreUpdate}
            />
            {scores.length > 0 && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleVisualize} 
                style={{ marginTop: '20px' }}
              >
                Data Visualization
              </Button>
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
