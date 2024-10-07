import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

export const fetchFileList = async () => {
  const response = await axios.get(`${API_BASE_URL}/main/list_filenames`);
  return response.data.filenames;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('student_performance_data', file);
  const response = await axios.post(`${API_BASE_URL}/main/upload`, formData);
  return response.data[0];
};

export const getTableData = async (filename) => {
  const response = await axios.post(`${API_BASE_URL}/main/get_table_data`, { filename });
  return response.data;
};

export const exportCsv = async (filename) => {
  const response = await axios.post(
    `${API_BASE_URL}/main/export_csv`, 
    { filename },
    { responseType: 'blob' }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// 新添加的函数
export const fetchGradeLevelData = async (filename) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/charts/query_table_data`, {
      filename: filename,
      columns: ['grade level']
    });
    return response.data.data['grade level'];
  } catch (error) {
    console.error('Error fetching grade level data:', error);
    throw error;
  }
};