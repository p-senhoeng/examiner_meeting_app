import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../config';
import DataProcessingUI from './DataProcessingUI';
import Header from './Header';

function DataProcessingComponent({ onDataReceived, onViewVisualization }) {
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
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [paperCode, setPaperCode] = useState('');
  const [semesterCode, setSemesterCode] = useState('');
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchAvailableFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/main/list_filenames');
      
      if (response && response.data && Array.isArray(response.data.filenames)) {
        setAvailableFiles(response.data.filenames);
      } else {
        console.warn('Unexpected response format:', response.data);
        setAvailableFiles([]);
      }
    } catch (err) {
      console.error('Error fetching available files:', err);
      setSnackbar({ open: true, message: 'Failed to fetch file list', severity: 'error' });
      setAvailableFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableFiles();
  }, [fetchAvailableFiles]);

  useEffect(() => {
    if (selectedFile) {
      fetchData(selectedFile);
    }
  }, [selectedFile]);

  const fetchData = async (filename) => {     
    setIsDataLoading(true);
    try {       
      if (!filename) {         
        throw new Error('No filename provided');       
      }        
      
      const response = await api.post('/main/get_table_data', { filename });        
      
      if (response.data && Array.isArray(response.data.data) && Array.isArray(response.data.columns)) {         
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

  const handleFileSelect = useCallback(async (filename) => {
    // Extract paperCode and semesterCode from filename
    const [paperCode, semesterCode] = filename.split('-');
    setPaperCode(paperCode);
    setSemesterCode(semesterCode);
  
    setSelectedFile(filename);
    try {
      await fetchData(filename);
      setMessage(`File "${filename}" loaded successfully. You can now view the data or download the file.`);
    } catch (err) {
      console.error('Error fetching file data:', err);
      setData([]);
      setColumns([]);
    }
  }, []);

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
      setSnackbar({
        open: true,
        message: `Failed to download file: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleFileDelete = async (filename) => {
    try {
      const response = await api.post('/main/delete_file', { filename });
      if (response.data && response.data.message) {
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        await fetchAvailableFiles();
        if (selectedFile === filename) {
          setSelectedFile(null);
          setData([]);
          setColumns([]);
        }
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setSnackbar({
        open: true,
        message: `Failed to delete file: ${err.message}`,
        severity: 'error'
      });
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

  // Define handleEditGrade function
  const handleEditGrade = (student) => {
    setEditingStudent(student);
    setGradeLevel(student.grade_level || '');
    setComments(student.comments || '');
    setEditDialogOpen(true);
  };

  // Define handleSaveGrade function
  const handleSaveGrade = async () => {
    try {
      if (!selectedFile) {
        throw new Error("No file selected. Please select a file first.");
      }
      if (!editingStudent) {
        throw new Error("No student selected for editing. Please try again.");
      }

      const studentId = editingStudent.id_number || 
                        editingStudent['id number'] || 
                        editingStudent.id || 
                        editingStudent['ID number'];

      if (!studentId) {
        console.error('Student object:', editingStudent);
        throw new Error("Unable to find a valid student ID. Please check the data format.");
      }

      const dataToSend = {
        filename: selectedFile,
        'ID number': studentId,
        'grade level': gradeLevel,
        comments: comments,
      };

      const response = await api.post('/main/update_student', dataToSend);

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

  const handleViewDataClick = useCallback(() => {
    if (selectedFile && data.length > 0) {
      const visualizationData = { data, columns, selectedFile };
      onDataReceived(visualizationData);
      onViewVisualization(selectedFile, paperCode, semesterCode);
    }
  }, [selectedFile, data, columns, paperCode, semesterCode, onDataReceived, onViewVisualization]);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter((row) =>
      Object.values(row).some((value) =>
        value !== null && value !== undefined && 
        value.toString().toLowerCase().includes((searchTerm || '').toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    const compare = (a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    };
    
    return [...filteredData].sort(compare);
  }, [filteredData, order, orderBy]);

  const visibleRows = useMemo(() => 
    sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
  [sortedData, page, rowsPerPage]);

  return (
    <>
      <Header />
      <DataProcessingUI
        availableFiles={availableFiles}
        selectedFile={selectedFile}
        handleFileSelect={handleFileSelect}
        handleFileDownload={handleFileDownload}
        handleFileDelete={handleFileDelete}
        message={message}
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
        isDataLoading={isDataLoading}
        fetchAvailableFiles={fetchAvailableFiles}
        handleViewData={handleViewDataClick}
        hasSelectedFile={!!selectedFile && data.length > 0}
        paperCode={paperCode}
        setPaperCode={setPaperCode}
        semesterCode={semesterCode}
        setSemesterCode={setSemesterCode}
      />
    </>
  );
}

export default DataProcessingComponent;
