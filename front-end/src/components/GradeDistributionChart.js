import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Typography, 
  Box, 
  Autocomplete, 
  TextField, 
  CircularProgress, 
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts';
import DrillDownTooltip from './DrillDownTooltip';
import { useStudentPerformance } from './StudentPerformanceContext';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const GradeDistributionChart = ({ 
  initialFileName, 
  initialPaperCode, 
  initialSemesterCode, 
  visualizationData, 
  onDownloadSuccess, 
  onDownloadError 
}) => {
  const { 
    files, 
    studentData, 
    handleFileSelect, 
    isLoading,
    addStudentToRadar,
    selectedStudentsForRadar
  } = useStudentPerformance();

  const [paperCode, setPaperCode] = useState(initialPaperCode || '');
  const [semesterCode, setSemesterCode] = useState(initialSemesterCode || '');
  const [compareSemesterCodes, setCompareSemesterCodes] = useState([]);
  const [availablePaperCodes, setAvailablePaperCodes] = useState([]);
  const [semesterCodesMap, setSemesterCodesMap] = useState({});
  const [selectedFiles, setSelectedFiles] = useState(initialFileName ? [initialFileName] : []);
  const [drillDownData, setDrillDownData] = useState(null);
  const [hoveredBarKey, setHoveredBarKey] = useState(null);
  const prevSelectedFilesRef = useRef([]);
  const chartRef = useRef(null);

  // Custom order for grades
  const gradeOrder = ['E', 'D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];

  // Custom sort function for the grade distribution
  const sortGrades = (a, b) => {
    const indexA = gradeOrder.indexOf(a.grade);
    const indexB = gradeOrder.indexOf(b.grade);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA === -1) return -1;
    if (indexB === -1) return 1;
    return 0;
  };

  useEffect(() => {
    if (visualizationData) {
      const { selectedFile } = visualizationData;
      if (selectedFile) {
        const [parsedPaperCode, parsedSemesterCode] = selectedFile.split('-');
        setPaperCode(parsedPaperCode);
        setSemesterCode(parsedSemesterCode);
      }
    }
  }, [visualizationData]);

  useEffect(() => {
    const paperCodesSet = new Set();
    const semestersMap = {};

    if (files && files.length > 0) {
      files.forEach(file => {
        const [paper, semester] = file.split('-'); 
        paperCodesSet.add(paper);

        if (!semestersMap[paper]) {
          semestersMap[paper] = [];
        }
        semestersMap[paper].push(semester);
      });
    }

    const sortedPaperCodes = Array.from(paperCodesSet).sort();
    setAvailablePaperCodes(sortedPaperCodes);

    const sortedSemestersMap = {};
    Object.keys(semestersMap).forEach((key) => {
      sortedSemestersMap[key] = semestersMap[key].sort();
    });

    setSemesterCodesMap(sortedSemestersMap);
  }, [files, visualizationData]);

  useEffect(() => {
    if (paperCode && semesterCode) {
      const newSelectedFiles = [`${paperCode}-${semesterCode}`, ...compareSemesterCodes.map(code => `${paperCode}-${code}`)];
      if (JSON.stringify(newSelectedFiles) !== JSON.stringify(prevSelectedFilesRef.current)) {
        setSelectedFiles(newSelectedFiles);
        prevSelectedFilesRef.current = newSelectedFiles;
        handleFileSelect(newSelectedFiles);
      }
    }
  }, [paperCode, semesterCode, compareSemesterCodes, handleFileSelect]);

  const handleBarClick = (data, filename) => {
    const gradeLevel = data.grade;
    const fileData = studentData[filename] || [];

    const gradeDetails = fileData.reduce((acc, student) => {
      if (student['grade level'] === gradeLevel) {
        acc.details[student['Paper total (Real)']] = (acc.details[student['Paper total (Real)']] || 0) + 1;
        acc.studentInfo.push({
          name: `${student['First name']} ${student['Last name']}`,
          id: student['ID number'],
          grade: student['Paper total (Real)'],
          ...student
        });
      }
      return acc;
    }, { details: {}, studentInfo: [] });

    setDrillDownData({
      grade: gradeLevel,
      details: gradeDetails.details,
      studentInfo: gradeDetails.studentInfo,
      filename: filename
    });
  };

  const handleDrillDownClose = () => {
    setDrillDownData(null);
  };

  const handleScrollSemester = (direction) => {
    if (!paperCode || !(paperCode in semesterCodesMap)) return;

    const semesters = semesterCodesMap[paperCode];
    const currentIndex = semesters.indexOf(semesterCode);

    if (currentIndex !== -1) {
      const newIndex = direction === 'up'
        ? (currentIndex + 1) % semesters.length
        : (currentIndex - 1 + semesters.length) % semesters.length;

      setSemesterCode(semesters[newIndex]);
    }
  };

  const gradeDistribution = useMemo(() => {
    if (selectedFiles.length === 0) return [];
    const distribution = {};

    selectedFiles.forEach(filename => {
      const fileData = studentData[filename] || [];
      fileData.forEach(student => {
        const grade = student['grade level'];
        if (!distribution[grade]) {
          distribution[grade] = { 
            grade, 
            ...selectedFiles.reduce((acc, f) => ({ ...acc, [f]: 0 }), {})
          };
        }
        distribution[grade][filename]++;
      });
    });

    return Object.values(distribution).sort(sortGrades);
  }, [selectedFiles, studentData]);

  const barColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];
  const hoverColor = '#ffa07a';

  const handleDownload = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) {
            saveAs(blob, 'grade_distribution_chart.png');
            onDownloadSuccess('Grade Distribution Chart');
          } else {
            onDownloadError('Grade Distribution Chart');
          }
        });
      });
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Grade Distribution</Typography>
        <Button
          variant="contained"
          onClick={handleDownload}
          sx={{
            backgroundColor: '#BE0028',
            color: 'white',
            '&:hover': {
              backgroundColor: '#8A001D',
            },
          }}
        >
          Download Chart
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Autocomplete
          options={availablePaperCodes}
          value={paperCode}
          onChange={(event, newValue) => setPaperCode(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Paper Code" variant="outlined" />}
          sx={{ flex: 1 }}
        />

        <Autocomplete
          options={(semesterCodesMap[paperCode] || []).sort()}
          value={semesterCode}
          onChange={(event, newValue) => setSemesterCode(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Semester Code" variant="outlined" />}
          sx={{ flex: 1 }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            onClick={() => handleScrollSemester('up')}
            variant="contained"
            sx={{
              mb: 1,
              backgroundColor: '#BE0028',
              color: 'white',
              '&:hover': {
                backgroundColor: '#8A001D',
              },
            }}
          >
            ▲
          </Button>

          <Button
            onClick={() => handleScrollSemester('down')}
            variant="contained"
            sx={{
              backgroundColor: '#BE0028',
              color: 'white',
              '&:hover': {
                backgroundColor: '#8A001D',
              },
            }}
          >
            ▼
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', mb: 2 }}>
        <Autocomplete
          multiple
          options={(semesterCodesMap[paperCode] || []).filter(code => code !== semesterCode).sort()}
          value={compareSemesterCodes}
          onChange={(event, newValue) => setCompareSemesterCodes(newValue)}
          renderInput={(params) => <TextField {...params} label="Compare Semesters" variant="outlined" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
          sx={{ flex: 1 }}
        />
      </Box>

      <Box ref={chartRef}>
        {gradeDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedFiles.map((filename, index) => (
                <Bar
                  key={filename}
                  dataKey={filename}
                  fill={hoveredBarKey === filename ? hoverColor : barColors[index % barColors.length]}
                  onMouseEnter={() => setHoveredBarKey(filename)}
                  onMouseLeave={() => setHoveredBarKey(null)}
                  onClick={(data) => handleBarClick(data, filename)}
                >
                  <LabelList dataKey={filename} position="top" />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography>No data available. Please select a paper code and semester(s).</Typography>
        )}
      </Box>

      {drillDownData && (
        <DrillDownTooltip 
          grade={drillDownData.grade}
          details={drillDownData.details}
          studentInfo={drillDownData.studentInfo}
          selectedFile={drillDownData.filename}
          onClose={handleDrillDownClose}
          addStudentToRadar={addStudentToRadar}
          selectedStudentsForRadar={selectedStudentsForRadar}
        />
      )}
    </Paper>
  );
};

export default GradeDistributionChart;