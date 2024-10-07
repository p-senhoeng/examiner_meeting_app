import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { fetchFileList, uploadFile, getTableData, exportCsv } from './studentDataService';

const StudentPerformanceContext = createContext();

export const useStudentPerformance = () => useContext(StudentPerformanceContext);

export const StudentPerformanceProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [studentData, setStudentData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudentsForRadar, setSelectedStudentsForRadar] = useState([]);

  const loadFileList = useCallback(async () => {
    setIsLoading(true);
    try {
      const fileList = await fetchFileList();
      setFiles(fileList);
      return fileList;
    } catch (err) {
      setError('Failed to fetch file list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    setIsLoading(true);
    try {
      await uploadFile(file);
      const fileList = await loadFileList();
      return { success: true, message: 'File uploaded successfully', fileList };
    } catch (err) {
      setError('File upload failed');
      return { success: false, message: 'File upload failed' };
    } finally {
      setIsLoading(false);
    }
  }, [loadFileList]);

  const handleFileSelect = useCallback(async (filenames) => {
    setIsLoading(true);
    setError(null);
    try {
      const newStudentData = { ...studentData };
      for (const filename of filenames) {
        if (!newStudentData[filename]) {
          const data = await getTableData(filename);
          newStudentData[filename] = data.data;
        }
      }
      setStudentData(newStudentData);
      setSelectedFiles(filenames);
      return { success: true, message: 'Data loaded successfully' };
    } catch (err) {
      setError('Failed to fetch student data');
      return { success: false, message: 'Failed to fetch student data' };
    } finally {
      setIsLoading(false);
    }
  }, [studentData]);

  const handleExportCsv = useCallback(async (filename) => {
    try {
      await exportCsv(filename);
      return { success: true, message: 'CSV exported successfully' };
    } catch (err) {
      return { success: false, message: 'Failed to export CSV' };
    }
  }, []);

  const addStudentToRadar = useCallback((student) => {
    setSelectedStudentsForRadar(prev => {
      if (prev.find(s => s.id === student.id)) {
        return prev; // Student already in the list
      }
      return [...prev, student];
    });
  }, []);

  const removeStudentFromRadar = useCallback((studentId) => {
    setSelectedStudentsForRadar(prev => prev.filter(s => s.id !== studentId));
  }, []);

  useEffect(() => {
    loadFileList();
  }, [loadFileList]);

  const value = {
    files,
    selectedFiles,
    studentData,
    isLoading,
    error,
    loadFileList,
    handleFileUpload,
    handleFileSelect,
    handleExportCsv,
    selectedStudentsForRadar,
    addStudentToRadar,
    removeStudentFromRadar
  };

  return (
    <StudentPerformanceContext.Provider value={value}>
      {children}
    </StudentPerformanceContext.Provider>
  );
};

export default StudentPerformanceProvider;