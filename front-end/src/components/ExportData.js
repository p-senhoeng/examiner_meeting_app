import React from 'react';
import { Button } from '@mui/material';
import { CSVLink } from 'react-csv';

function ExportData({ scores }) {
  const headers = [
    { label: '姓名', key: 'name' },
    { label: '科目', key: 'subject' },
    { label: '分数', key: 'score' }
  ];

  return (
    <CSVLink data={scores} headers={headers} filename={'成绩数据.csv'}>
      <Button variant="contained" color="secondary">导出数据</Button>
    </CSVLink>
  );
}

export default ExportData;