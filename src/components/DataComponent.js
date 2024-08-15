import React, { useState, useEffect } from 'react';

function DataComponent() {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // 用于跟踪正在编辑的数据项 ID

  useEffect(() => {
    // 获取数据
    fetch('http://127.0.0.1:5000/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('网络请求失败');
        }
        return response.json();
      })
      .then(data => setData(data))
      .catch(error => setError(error));
  }, []);

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const newScore = parseInt(event.target.score.value, 10);

    // 更新数据
    try {
      const response = await fetch(`http://127.0.0.1:5000/data/${editingId}`, {
        method: 'PUT',
        headers: {
        },
        body: JSON.stringify({ score: newScore })
      });

      if (!response.ok) {
        throw new Error('数据更新失败');
      }

      // 更新数据
      setData(prevData => ({
        ...prevData,
        [editingId]: { ...prevData[editingId], score: newScore }
      }));

      setEditingId(null); // 完成编辑后，重置 editingId
    } catch (error) {
      setError(error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div>
      <h2>Table</h2>

    </div>
  );
}

export default DataComponent;