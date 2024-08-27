import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const GRADES = ['A+', 'A', 'B', 'C', 'D', 'E'];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

const buttonStyle = {
  padding: '10px 15px',
  margin: '0 5px 5px 0',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.3s',
};

const GradeDistributionPieChart = ({ files }) => {
  const [selectedFiles, setSelectedFiles] = useState(files.slice(0, 3));

  const toggleFile = (file) => {
    setSelectedFiles(prev => 
      prev.includes(file)
        ? prev.filter(f => f !== file)
        : [...prev, file].slice(-3)
    );
  };

  const prepareData = (file) => {
    return GRADES.map(grade => ({
      name: grade,
      value: file.data[grade] || 0
    }));
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Grade Distribution Pie Charts</h2>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {files.map(file => (
          <button
            key={file.name}
            onClick={() => toggleFile(file)}
            style={{
              ...buttonStyle,
              backgroundColor: selectedFiles.includes(file) ? '#3b82f6' : '#e5e7eb',
              color: selectedFiles.includes(file) ? 'white' : 'black',
            }}
          >
            {file.name}
          </button>
        ))}
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '20px'
      }}>
        {selectedFiles.map((file, index) => (
          <div key={file.name} style={{ 
            width: 'calc(33.33% - 14px)', 
            minWidth: '300px', 
            maxWidth: '400px'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{file.name}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareData(file)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {prepareData(file).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradeDistributionPieChart;