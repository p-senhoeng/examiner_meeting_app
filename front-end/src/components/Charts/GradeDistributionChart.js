import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const GradeDistributionChart = ({ files }) => {
  const [selectedFiles, setSelectedFiles] = useState([files[0]]);

  const toggleFile = (file) => {
    setSelectedFiles(prev => 
      prev.includes(file)
        ? prev.filter(f => f !== file)
        : [...prev, file]
    );
  };

  const data = GRADES.map(grade => {
    const entry = { grade };
    selectedFiles.forEach(file => {
      entry[file.name] = file.data[grade] || 0;
    });
    return entry;
  });

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Grade Distribution Bar Chart</h2>
      <div style={{ marginBottom: '20px' }}>
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
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedFiles.map((file, index) => (
            <Bar key={file.name} dataKey={file.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GradeDistributionChart;