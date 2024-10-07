import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { StudentPerformanceProvider } from './StudentPerformanceContext';
import DataProcessingComponent from './DataProcessingComponent';
import App2 from '../App2';

const VisualizationWrapper = () => {
  const [visualizationData, setVisualizationData] = useState(null);
  const navigate = useNavigate();

  const handleDataReceived = async (data) => {
    setVisualizationData(data);
    return Promise.resolve();
  };

  const handleViewVisualization = (selectedFileName) => {
    if (selectedFileName && visualizationData) {
      navigate('/visualization', { state: { fileName: selectedFileName, visualizationData } });
    }
  };

  return (
    <StudentPerformanceProvider>
      <Routes>
        <Route 
          path="/" 
          element={
            <DataProcessingComponent
              onDataReceived={handleDataReceived}
              onViewVisualization={handleViewVisualization}
            />
          } 
        />
        <Route 
          path="/visualization" 
          element={<App2 />} 
        />
      </Routes>
    </StudentPerformanceProvider>
  );
};

export default VisualizationWrapper;
