// src/components/ScoreUpload.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Button, Input } from '@mui/material';

function ScoreUpload({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          // 处理 CSV 数据
          const scores = result.data.slice(1).map(row => ({
            name: row[0],
            subject: row[1],
            score: parseInt(row[2], 10)
          }));
          // 将处理后的数据传递给父组件
          onUpload(scores);
        },
        header: false // 指定 CSV 文件没有标题行
      });
    }
  };

  return (
    <div>
      <Input type="file" accept=".csv" name="student_performance_data" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleUpload}>Please upload student performance data
      </Button>
    </div>
  
  );
}

export default ScoreUpload;