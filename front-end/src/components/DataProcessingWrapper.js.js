import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataProcessingComponent from './DataProcessingComponent';
import { useStudentPerformance } from './StudentPerformanceContext';

function DataProcessingWrapper() {
  const navigate = useNavigate();
  const { handleFileSelect } = useStudentPerformance();

  const handleDataReceived = useCallback((visualizationData) => {
    // 这里可以处理接收到的数据，如果需要的话
    console.log('Received visualization data:', visualizationData);
  }, []);

  const handleViewVisualization = useCallback((selectedFile) => {
    // 使用 handleFileSelect 来确保选中的文件在 context 中被更新
    handleFileSelect([selectedFile]);
    // 导航到可视化页面，并传递选中的文件名
    navigate('/visualization', { state: { selectedFile } });
  }, [navigate, handleFileSelect]);

  return (
    <DataProcessingComponent
      onDataReceived={handleDataReceived}
      onViewVisualization={handleViewVisualization}
    />
  );
}

export default DataProcessingWrapper;