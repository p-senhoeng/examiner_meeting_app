import React, { useState } from 'react';
import GradeDistributionChart from './components/Charts/GradeDistributionChart';

import GradeDistributionPieChart from './components/Charts/GradeDistributionPieChart';

const mockFiles = [
  { 
    name: '2023 Trimester A', 
    data: { 'A+': 10, 'A': 20, 'B': 30, 'C': 25, 'D': 10, 'E': 5 } 
  },
  { 
    name: '2023 Trimester B', 
    data: { 'A+': 15, 'A': 25, 'B': 35, 'C': 20, 'D': 5, 'E': 0 } 
  },
  { 
    name: '2024 Trimester A', 
    data: { 'A+': 12, 'A': 22, 'B': 33, 'C': 23, 'D': 8, 'E': 2 } 
  },
];

const App = () => {
  const [files, setFiles] = useState(mockFiles);

  const handleFileUpload = (event) => {
    // 这里应该实现文件上传和解析逻辑
    // 为了演示，我们只是添加一个新的模拟文件
    const newFile = {
      name: `新上传文件 ${files.length + 1}`,
      data: { 'A+': 14, 'A': 24, 'B': 34, 'C': 22, 'D': 5, 'E': 1 }
    };
    setFiles([...files, newFile]);
  };

  return (
    <div className="App">
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0' }}>Grade Distribution Chart</h1>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Upload CSV Files
        </label>
      </div>
      <GradeDistributionChart files={files} />
      <GradeDistributionPieChart files={files} />
    </div>
  );
};

export default App;