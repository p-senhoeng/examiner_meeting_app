import React, { useState, useEffect } from 'react';
import api from '../config';
import DataProcessingUI from './DataProcessingUI';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0); 

  useEffect(() => {
    fetchAvailableFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchData(selectedFile);
    }
  }, [selectedFile]);



  const fetchAvailableFiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/main/list_filenames');
      
      if (response && response.data && Array.isArray(response.data.filenames)) {
        setAvailableFiles(response.data.filenames);
      } else {
        console.warn('Unexpected response format:', response.data);
        setError('Received unexpected data format from server.');
        setAvailableFiles([]);
      }
    } catch (err) {
      console.error('Error fetching available files:', err);
      setError(`Failed to fetch available files: ${err.message}`);
      setAvailableFiles([]);
    } finally {
      setIsLoading(false);
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
  
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setUploading(true);
    setError('');
    setMessage('');
  
    try {
      console.log('Starting file upload:', file.name);
      const formData = new FormData();
      formData.append('student_performance_data', file);
  
      const response = await api.post('/main/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
        }
      });
  
      console.log('Server response:', response.data);
  
      if (response.data && Array.isArray(response.data)) {
        const uploadedFile = response.data.find(file => file.status === 'success');
        if (uploadedFile) {
          setMessage(`File "${uploadedFile.filename}" uploaded successfully`);
          setSnackbar({
            open: true,
            message: 'File uploaded successfully!',
            severity: 'success'
          });
          
          // Delay fetching available files to allow server to process the upload
          setTimeout(() => {
            fetchAvailableFiles();
            setSelectedFile(uploadedFile.filename);
          }, 1000);
        } else {
          throw new Error('File upload failed');
        }
      } else {
        throw new Error('Unexpected response format from server');
      }
  
      setFile(null);
  
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Upload failed: ';
      if (err.response && err.response.status === 500) {
        errorMessage += 'Internal server error. Please try again later or contact support.';
      } else if (err.response && err.response.data) {
        errorMessage += err.response.data.error || err.response.data.message || err.message;
      } else if (err.request) {
        errorMessage += 'No response received from server. Please check your network connection.';
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };
  
  const validateFile = (file) => {
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const maxSize = 10 * 1024 * 1024; // 10MB
  
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return 'Invalid file type. Please upload a CSV or Excel file.';
    }
  
    if (file.size > maxSize) {
      return 'File is too large. Maximum size is 10MB.';
    }
  
    return null; // No error
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
      const response = await api.post('/main/export_csv', { filename }, { 
        responseType: 'blob'
      });
  
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
  
    } catch (err) {
      console.error('Error downloading file:', err);
      if (err.response) {
        console.error('Error response:', err.response);
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setError(`Failed to download file: ${err.message}`);
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
    setIsDataLoading(true);
    try {       
      if (!filename) {         
        throw new Error('No filename provided');       
      }        
      
      const response = await api.post('/main/get_table_data', { filename });        
      
      if (response.data && response.data.data && response.data.columns) {         
        setData(response.data.data);         
        setColumns(response.data.columns);         
        setSnackbar({ open: true, message: 'Data updated successfully', severity: 'success' });       
      } else {         
        throw new Error('Unexpected data format received from server');       
      }     
    } catch (err) {       
      console.error('Error fetching data:', err);       
      
      setSnackbar({         
        open: true,         
        message: `Failed to fetch data: ${err.message}`,         
        severity: 'error'       
      });       
      setData([]);
      setColumns([]);
    } finally {
      setIsDataLoading(false);
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

      // Attempt to find a valid student ID
      const studentId = editingStudent.id_number || 
                        editingStudent['id number'] || 
                        editingStudent.id || 
                        editingStudent['ID number'];

      if (!studentId) {
        console.error('Student object:', editingStudent);
        throw new Error("Unable to find a valid student ID. Please check the data format.");
      }

      console.log('Saving grade for student ID:', studentId);

      const dataToSend = {
        filename: selectedFile,
        'ID number': studentId,
        'grade level': gradeLevel,
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

          await fetchData(selectedFile);
        } else {
          throw new Error(response.data.message);
        }
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Error saving grade:', err);
      let errorMessage = 'Failed to save grade: ';
      if (err.response && err.response.status === 500) {
        errorMessage += 'Internal server error. Please try again later or contact support.';
      } else if (err.response) {
        errorMessage += err.response.data.error || err.message;
      } else if (err.request) {
        errorMessage += 'No response received from server. Please check your network connection.';
      } else {
        errorMessage += err.message;
      }
      setSnackbar({
        open: true,
        message: errorMessage,
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
    <DataProcessingUI
      file={file}
      handleFileChange={handleFileChange}
      uploadFile={uploadFile}
      uploading={uploading}
      availableFiles={availableFiles}
      selectedFile={selectedFile}
      handleFileSelect={handleFileSelect}
      handleFileDownload={handleFileDownload}
      message={message}
      error={error}
      setError={setError}
      searchTerm={searchTerm}
      handleSearch={handleSearch}
      data={data}
      columns={columns}
      orderBy={orderBy}
      order={order}
      handleRequestSort={handleRequestSort}
      visibleRows={visibleRows}
      handleEditGrade={handleEditGrade}
      rowsPerPage={rowsPerPage}
      page={page}
      filteredData={filteredData}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      editDialogOpen={editDialogOpen}
      setEditDialogOpen={setEditDialogOpen}
      gradeLevel={gradeLevel}
      setGradeLevel={setGradeLevel}
      comments={comments}
      setComments={setComments}
      handleSaveGrade={handleSaveGrade}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      isLoading={isLoading}
      fetchAvailableFiles={fetchAvailableFiles}
    />
  );
}


export default DataProcessingComponent;