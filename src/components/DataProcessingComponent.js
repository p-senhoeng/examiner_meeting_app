import React, { useState, useEffect } from 'react';
import api from '../config';
import Papa from 'papaparse';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Paper, TextField, Box, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Typography,
  CircularProgress
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


  useEffect(() => {
    fetchAvailableFiles();
  }, []);


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
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        setError(`Server error: ${err.response.status}. ${err.response.data.error || ''}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request error:', err.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError('An error occurred while setting up the request.');
      }
      
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
  
    const formData = new FormData();
    formData.append('student_performance_data', file);
  
    try {
      const response = await api.post('/main/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchAvailableFiles();
      setFile(null);
      setError('File uploaded successfully');
      
      if (response.data && response.data.data && response.data.columns) {
        setData(response.data.data);
        setColumns(response.data.columns);
        setSelectedFile(response.data.table_name);
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Error response data:', err.response.data);
        setError(`Upload failed: ${err.response.data.error || err.response.data.message || 'Unknown server error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (filename) => {
    setSelectedFile(filename);
    setError('');
    try {
      const response = await api.post('/main/export_csv', { filename }, { responseType: 'text' });
      
      // Parse CSV data
      const result = Papa.parse(response.data, { header: true, skipEmptyLines: true });
  
      if (result.data && result.meta && result.meta.fields) {
        setData(result.data);
        setColumns(result.meta.fields);
        setMessage(`File "${filename}" loaded successfully. You can now view the data or download the file.`);
      } else {
        throw new Error('Failed to parse CSV data');
      }
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

  const handleSaveGrade = async () => {
    try {
      if (!selectedFile) {
        setError("No file selected. Please select a file first.");
        return;
      }
      if (!editingStudent) {
        setError("No student selected for editing. Please try again.");
        return;
      }
  
      const studentId = editingStudent.id_number || editingStudent.id || '';
  
      const response = await api.post('/main/update_student', {
        filename: selectedFile,
        id_number: studentId,
        grade_level: gradeLevel,
        comments: comments,
      });
  
      if (response.data && response.data.data && response.data.columns) {
        setData(response.data.data);
        setColumns(response.data.columns);
        setEditDialogOpen(false);
        setError('Grade updated successfully');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Error saving grade:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save grade changes.');
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

{data.length > 0 && (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column}>{column}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.slice(0, 10).map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column}>{row[column]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}

      <TableContainer>
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
  );
}

export default DataProcessingComponent;