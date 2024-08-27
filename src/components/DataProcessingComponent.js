import React, { useState, useEffect } from 'react';
import api from '../config';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Paper, TextField, Box, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Typography,
  CircularProgress, Snackbar, Alert
} from '@mui/material';

function DataProcessingComponent() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [gradeLevel, setGradeLevel] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchAvailableFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchData(selectedFile);
    }
  }, [selectedFile]);

  const fetchAvailableFiles = async () => {
    try {
      const response = await api.get('/main/list_csv');
      
      if (response && response.data && Array.isArray(response.data["CSV files"])) {
        setAvailableFiles(response.data["CSV files"]);
      } else {
        console.warn('Unexpected response format:', response.data);
        setError('Received unexpected data format from server.');
        setAvailableFiles([]);
      }
    } catch (err) {
      console.error('Error fetching available files:', err);
      setError(`Failed to fetch available files: ${err.message}`);
      setAvailableFiles([]);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError('');
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const preprocessedFile = await preprocessFile(file);
      
      const formData = new FormData();
      formData.append('student_performance_data', preprocessedFile);
      formData.append('file_extension', 'csv');

      const response = await api.post('/main/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchAvailableFiles();
      setFile(null);
      setMessage('File uploaded and processed successfully');

      if (response.data && response.data.data && response.data.columns) {
        setData(response.data.data);
        setColumns(response.data.columns);
        setSelectedFile(response.data.table_name);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const preprocessFile = async (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let data;

    if (fileExtension === 'csv') {
      data = await parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      data = await parseExcel(file);
    } else {
      throw new Error('Unsupported file format');
    }

    const preprocessedHeaders = data[0].map(header => 
      header.toString().substring(0, 60).trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    );
    
    const uniqueHeaders = makeHeadersUnique(preprocessedHeaders);
    
    data[0] = uniqueHeaders;

    const csv = Papa.unparse(data);
    return new File([csv], 'preprocessed_data.csv', { type: 'text/csv' });
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });
  };

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        resolve(jsonData);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const makeHeadersUnique = (headers) => {
    const uniqueHeaders = new Set();
    return headers.map(header => {
      let uniqueHeader = header;
      let counter = 1;
      while (uniqueHeaders.has(uniqueHeader)) {
        uniqueHeader = `${header}_${counter}`;
        counter++;
      }
      uniqueHeaders.add(uniqueHeader);
      return uniqueHeader;
    });
  };

  const handleFileSelect = async (filename) => {
    setSelectedFile(filename);
    setError('');
    try {
      await fetchData(filename);
      setMessage(`File "${filename}" loaded successfully. You can now view the data or download the file.`);
    } catch (err) {
      console.error('Error fetching file data:', err);
      setError(`Failed to load file data: ${err.message}`);
      setData([]);
      setColumns([]);
    }
  };

  const handleFileDownload = async (filename) => {
    try {
      const response = await api.post('/main/export_csv', { filename }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEditGrade = (student) => {
    setEditingStudent(student);
    setGradeLevel(student.grade_level || '');
    setComments(student.comments || '');
    setEditDialogOpen(true);
  };

  const fetchData = async (filename) => {
    try {
      if (!filename) {
        throw new Error('No filename provided');
      }
  
      console.log(`Attempting to fetch data for file: ${filename}`);
      
      const response = await api.post('/main/export_csv', { filename }, { responseType: 'blob' });
      
      console.log('Server response received');
  
      const text = await response.data.text();
      
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  
      if (result.data && result.meta && result.meta.fields) {
        setData(result.data);
        setColumns(result.meta.fields);
        console.log(`Data fetched successfully for file: ${filename}`);
        setSnackbar({ open: true, message: 'Data updated successfully', severity: 'success' });
      } else {
        console.error('Unexpected data format:', result);
        throw new Error('Unexpected data format received from server');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setSnackbar({ 
        open: true, 
        message: `Failed to fetch updated data: ${err.message}`, 
        severity: 'error' 
      });
      throw err;
    }
  };
  
  const handleSaveGrade = async () => {
    try {
      if (!selectedFile) {
        throw new Error("No file selected. Please select a file first.");
      }
      if (!editingStudent) {
        throw new Error("No student selected for editing. Please try again.");
      }
  
      // 确保我们使用正确的 id_number
      const studentId = editingStudent.id_number || editingStudent['id number'] || editingStudent.id;
      if (!studentId) {
        throw new Error("Invalid student ID. Please try again.");
      }
  
      // 记录所有可能的 ID 字段
      console.log('Student object:', editingStudent);
      console.log('Possible ID fields:', {
        id_number: editingStudent.id_number,
        'id number': editingStudent['id number'],
        id: editingStudent.id
      });
  
      const dataToSend = {
        filename: selectedFile,
        id_number: studentId,
        grade_level: gradeLevel,
        comments: comments,
      };
  
      console.log('Sending data to server:', dataToSend);
  
      const response = await api.post('/main/update_student', dataToSend);
  
      console.log('Server response:', response.data);
  
      if (response.data && response.data.message) {
        if (response.data.message.includes('successfully')) {
          setEditDialogOpen(false);
          setSnackbar({ open: true, message: response.data.message, severity: 'success' });
          setEditingStudent(null);
          setGradeLevel('');
          setComments('');
  
          // 更新本地数据
          if (response.data.data && response.data.columns) {
            setData(response.data.data);
            setColumns(response.data.columns);
          } else {
            console.warn('Server response does not contain updated data or columns');
          }
        } else {
          throw new Error(response.data.message);
        }
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Error saving grade:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setSnackbar({
        open: true,
        message: `Failed to save grade: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = stableSort(filteredData, getComparator(order, orderBy));

  const visibleRows = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <React.Fragment>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box mb={2}>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span">
              Select File
            </Button>
          </label>
          {file && <Typography variant="body1">{file.name}</Typography>}
          <Button
            variant="contained"
            onClick={uploadFile}
            disabled={!file || uploading}
            style={{ marginLeft: '10px' }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </Box>

        <Box mb={2}>
          <Typography variant="h6">Available Files:</Typography>
          {Array.isArray(availableFiles) && availableFiles.length > 0 ? (
            availableFiles.map((filename) => (
              <Box key={filename} mb={1}>
                <Button
                  onClick={() => handleFileSelect(filename)}
                  variant={selectedFile === filename ? "contained" : "outlined"}
                  style={{ marginRight: '10px' }}
                >
                  {filename}
                </Button>
                {selectedFile === filename && (
                  <Button
                    onClick={() => handleFileDownload(filename)}
                    variant="outlined"
                    color="primary"
                  >
                    Download
                  </Button>
                )}
              </Box>
            ))
          ) : (
            <Typography>No files available</Typography>
          )}
        </Box>

        {message && (
          <Typography color="primary" variant="body2" style={{ marginTop: '10px' }}>
            {message}
          </Typography>
        )}

        {error && (
          <Typography color="error" variant="body2" style={{ marginTop: '10px' }}>
            {error}
          </Typography>
        )}

<TextField
          label="Search"
          variant="outlined"
          onChange={handleSearch}
          value={searchTerm}
          style={{ marginBottom: '20px' }}
        />

        {data.length > 0 && (
          <React.Fragment>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column}
                        sortDirection={orderBy === column ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === column}
                          direction={orderBy === column ? order : 'asc'}
                          onClick={() => handleRequestSort(column)}
                        >
                          {column}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <TableRow hover key={index}>
                      {columns.map((column) => (
                        <TableCell key={column}>{row[column]}</TableCell>
                      ))}
                      <TableCell>
                        <Button onClick={() => handleEditGrade(row)}>Edit Grade</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visibleRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </React.Fragment>
        )}

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Student Grade</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Grade Level"
              fullWidth
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Comments"
              fullWidth
              multiline
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGrade}>Save</Button>
          </DialogActions>
        </Dialog>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export default DataProcessingComponent;