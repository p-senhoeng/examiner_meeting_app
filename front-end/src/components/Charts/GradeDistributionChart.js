import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GRADES = ['A+', 'A', 'B', 'C', 'D', 'E'];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

const GradeDistributionChart = ({ files }) => {
  if (!files || files.length === 0) {
    return <div>No data available. Please upload a file or wait for data to load.</div>;
  }

  const data = GRADES.map(grade => {
    const entry = { grade };
    files.forEach(file => {
      if (file && file.name && file.data) {
        entry[file.name] = file.data[grade] || 0;
      }
    });
    return entry;
  });

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Grade Distribution Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip />
          <Legend />
          {files.map((file, index) => (
            file && file.name && (
              <Bar 
                key={file.name} 
                dataKey={file.name} 
                fill={COLORS[index % COLORS.length]} 
              />
            )
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GradeDistributionChart;