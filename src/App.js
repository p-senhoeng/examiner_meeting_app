import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Button, Box } from '@mui/material';
import DataVisualization from './components/DataVisualization';
import DataProcessingComponent from './components/DataProcessingComponent';

const theme = createTheme();

function App() {
  const [data, setData] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDataReceived = (receivedData) => {
    setData(receivedData.data);
    setSelectedFile(receivedData.filename);
  };

  const handleVisualize = () => {
    setShowVisualization(true);
  };

  const handleBackToProcessing = () => {
    setShowVisualization(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box my={4}>
          <h1>Student Achievement Management Center</h1>
          {!showVisualization ? (
            <>
              <DataProcessingComponent 
                onDataReceived={handleDataReceived}
              />
              {data.length > 0 && (
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
              <DataVisualization data={data} />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleBackToProcessing} 
                style={{ marginTop: '20px' }}
              >
                Return to Data Processing
              </Button>
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;