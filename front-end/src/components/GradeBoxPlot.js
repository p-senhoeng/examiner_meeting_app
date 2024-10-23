import React, { useMemo, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import Plot from 'react-plotly.js';
import { useStudentPerformance } from './StudentPerformanceContext';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const GradeBoxPlot = ({ onDownloadSuccess, onDownloadError }) => {
  const { studentData, selectedFiles } = useStudentPerformance();
  const chartRef = useRef(null);

  const plotData = useMemo(() => {
    return selectedFiles.map(filename => {
      const grades = studentData[filename].map(student => parseFloat(student['Paper total (Real)']) || 0);
      
      return {
        y: grades,
        type: 'box',
        name: filename,
        boxpoints: 'outliers',
        jitter: 0.3,
        pointpos: -1.8
      };
    });
  }, [studentData, selectedFiles]);

  const layout = {
    title: 'Grade Distribution Boxplot',
    yaxis: {
      title: 'Grade',
      range: [0, 100]
    },
    boxmode: 'group'
  };

  const handleDownload = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        canvas.toBlob((blob) => {
          saveAs(blob, 'grade_box_plot.png');
        });
        onDownloadSuccess();
      } catch (error) {
        console.error('Error generating image:', error);
        onDownloadError();
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Grade Distribution Boxplot</Typography>
        <Button
  variant="contained"
  onClick={handleDownload}
  sx={{
    backgroundColor: '#BE0028', // Set the background color
    color: 'white', // Set the text color
    '&:hover': {
      backgroundColor: '#8A001D', // Set the color when hovered
    },
  }}
>
  Download Chart
</Button>

      </Box>
      <Box sx={{ width: '100%', height: 500 }} ref={chartRef}>
        <Plot
          data={plotData}
          layout={layout}
          useResizeHandler={true}
          style={{width: "100%", height: "100%"}}
        />
      </Box>
    </Paper>
  );
};

export default GradeBoxPlot;