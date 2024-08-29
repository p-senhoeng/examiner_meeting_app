import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentPerformance = () => {
  const [columns, setColumns] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [tableName, setTableName] = useState('');
  const [chartData, setChartData] = useState([]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('student_performance_data', file);

    try {
      const response = await fetch('http://localhost:5001/main/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      handleUploadSuccess(result);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed. Please try again.');
    }
  };

  const handleUploadSuccess = (data) => {
    setColumns(data.columns);
    setStudentData(data.data);
    setTableName(data.table_name);
    updateChartData(data.data);
  };

  const updateChartData = (data) => {
    const gradeCounts = data.reduce((acc, student) => {
      const grade = student['grade level'];
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(gradeCounts).map(([grade, count]) => ({
      grade,
      count
    }));

    setChartData(chartData);
  };

  return (
    <div className="student-performance">
      <h1>Student Performance Data</h1>
      <input 
        type="file" 
        accept=".csv,.xlsx,.xls" 
        onChange={(e) => handleFileUpload(e.target.files[0])} 
      />
      
      {tableName && <h2>Table: {tableName}</h2>}
      
      {studentData.length > 0 && (
        <div className="data-table">
          <h3>Student Data</h3>
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentData.map((student) => (
                <tr key={student.id}>
                  {columns.map((column) => (
                    <td key={`${student.id}-${column}`}>{student[column]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="grade-chart">
          <h3>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;