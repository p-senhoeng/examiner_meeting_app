import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import DataProcessingComponent from './components/DataProcessingComponent';

const theme = createTheme();

function App() {
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDataReceived = (receivedData) => {
    setData(receivedData.data);
    setSelectedFile(receivedData.filename);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box my={4}>
          <h1>Student Achievement Management Center</h1>
          <DataProcessingComponent
            onDataReceived={handleDataReceived}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;