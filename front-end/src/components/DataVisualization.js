// src/components/DataVisualization.js
import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function DataVisualization({ scores }) {
  // 处理数据以生成图表所需的格式
  const subjectScores = scores.reduce((acc, score) => {
    if (!acc[score.subject]) {
      acc[score.subject] = [];
    }
    acc[score.subject].push(score.score);
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(subjectScores),
    datasets: [{
      label: '平均分',
      data: Object.values(subjectScores).map(scores => 
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      ),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  const scoreRanges = {
    '90-100': 0,
    '80-89': 0,
    '70-79': 0,
    '60-69': 0,
    '<60': 0
  };

  scores.forEach(score => {
    if (score.score >= 90) scoreRanges['90-100']++;
    else if (score.score >= 80) scoreRanges['80-89']++;
    else if (score.score >= 70) scoreRanges['70-79']++;
    else if (score.score >= 60) scoreRanges['60-69']++;
    else scoreRanges['<60']++;
  });

  const pieData = {
    labels: Object.keys(scoreRanges),
    datasets: [{
      data: Object.values(scoreRanges),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
    }]
  };

  // 生成学生总分数据
  const studentTotalScores = scores.reduce((acc, score) => {
    if (!acc[score.name]) {
      acc[score.name] = 0;
    }
    acc[score.name] += score.score;
    return acc;
  }, {});

  const lineData = {
    labels: Object.keys(studentTotalScores),
    datasets: [{
      label: '学生总分',
      data: Object.values(studentTotalScores),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>成绩数据可视化</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">各科目平均分</Typography>
            <Bar data={barData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">成绩分布</Typography>
            <Pie data={pieData} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">学生总分趋势</Typography>
            <Line data={lineData} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DataVisualization;