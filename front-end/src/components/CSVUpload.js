import React, { useState } from "react";
import Header from "./Header";
import '../styles/CSVupload.css';
import { AppBar, Toolbar, Typography, ThemeProvider, createTheme } from '@mui/material';
import { styled } from '@mui/system';

// Create a custom theme with Waikato University's red color
const theme = createTheme({
  palette: {
    primary: {
      main: '#BE0028', // Waikato University red
    },
  },
});

// Styled AppBar component
const WaikatoAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  position: 'static',
  marginBottom: theme.spacing(3),
}));

function CSVUpload() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileUpload = async () => {
        let hasEmptyFields = false;

        // Validation and error checking for each file
        const updatedFiles = selectedFiles.map((file) => {
            let error = '';

            // Check for empty fields
            if (file.paperCode.trim() === '' || file.semesterCode.trim() === '') {
                error = 'Please fill in both Paper Code and Semester Code.';
                hasEmptyFields = true;
            }
            
            // Validation for paperCode: must be 5 letters followed by 3 digits (e.g., COMPX563)
            if (!error && !/^[A-Z]{5}\d{3}$/.test(file.paperCode.trim())) {
                error = 'Paper Code must be 5 letters followed by 3 digits (e.g., COMPX563).';
                hasEmptyFields = true;
            }

            // Validation for semesterCode: must be 2 digits followed by 1 letter (e.g., 21A)
            if (!error && !/^\d{2}[A-Z]$/.test(file.semesterCode.trim())) {
                error = 'Semester Code must be 2 digits followed by 1 letter (e.g., 21A).';
                hasEmptyFields = true;
            }

            // Generate the renamed filename here for consistent reference
            const renamedFilename = `${file.paperCode}-${file.semesterCode}${getFileExtension(file.file.name)}`;

            return { ...file, error, renamedFilename };
        });

        setSelectedFiles(updatedFiles);

        // If any validation errors exist, do not proceed with the upload
        if (hasEmptyFields) {
            setUploadStatus('Please fill in all required fields correctly.');
            return;
        }

        // Begin file upload process if validation passes
        setUploadStatus('Uploading...');

        const formData = new FormData();

        updatedFiles.forEach(({ file, renamedFilename }) => {
            formData.append('student_performance_data', file, renamedFilename);
        });

        try {
            const response = await fetch('http://127.0.0.1:5001/main/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Server response:', data);
                
                const updatedFilesWithResult = updatedFiles.map((fileObj) => {
                    const responseItem = data.find(item => item.filename === fileObj.renamedFilename);
                    
                    return {
                        ...fileObj,
                        result: responseItem ? { 
                            status: responseItem.status, 
                            details: responseItem.details || 'No details provided',
                        } : { status: 'unknown', details: 'No details provided' }
                    };
                });

                setSelectedFiles(updatedFilesWithResult);
                setUploadStatus('Upload Completed');
            } else {
                // Handle error response
                const errorMessage = data[0]?.details || 'An unknown error occurred';
                setUploadStatus(`Upload Failed: ${errorMessage}`);
                
                const updatedFilesWithError = updatedFiles.map((fileObj) => (fileObj.error === ''
                    ? { ...fileObj, result: { status: 'failed', details: errorMessage } }
                    : fileObj
                ));
                
                setSelectedFiles(updatedFilesWithError);
            }
        } catch (error) {
            setUploadStatus(`Error during file upload: ${error.message}`);
        }
    };

    const handleFilesSelected = (files) => {
        if (files && files.length > 0) {
            const newFiles = Array.from(files).map(file => ({
                file,
                paperCode: '',
                semesterCode: '',
                result: null,
                error: '',
                renamedFilename: '' // Add this property to hold the renamed file name
            }));
            setSelectedFiles(newFiles);
            setUploadStatus('');
        }
    };

    const handleInputChange = (index, field, value) => {
        const upperCaseValue = value.toUpperCase();
        const updatedFiles = selectedFiles.map((fileObj, idx) =>
            index === idx ? { ...fileObj, [field]: upperCaseValue, error: '' } : fileObj
        );
        setSelectedFiles(updatedFiles);
    };

    const getFileExtension = (filename) => {
        return filename.substring(filename.lastIndexOf('.'));
    };

    const handleDeleteFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
    };

    const successCount = selectedFiles.filter(file => file.result && file.result.status === 'success').length;
    const failureCount = selectedFiles.filter(file => file.result && file.result.status === 'failed').length;

    const isUploadCompleted = uploadStatus.includes('Completed');

    return (
        <ThemeProvider theme={theme}>
            <Header />
            <WaikatoAppBar
                position="static"
                elevation={0}
                sx={{
                    borderRadius: '8px',
                }}
            >
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        CSV Upload 
                    </Typography>
                </Toolbar>
            </WaikatoAppBar>
            <div className="csv-upload-container">
                <DragAndDropBox onFileSelect={handleFilesSelected} />

                {selectedFiles.length > 0 && (
                    <div className="file-rename">
                        <h3>Rename Files Before Uploading:</h3>
                        <ul>
                            {selectedFiles.map((fileObj, index) => (
                                <li
                                    key={index}
                                    className={`file-item-container ${
                                        fileObj.result?.status === 'success' ? 'success' :
                                        fileObj.result?.status === 'failed' ? 'failure' : ''
                                    }`}
                                >
                                    <span className="file-item">{fileObj.file.name}</span>

                                    <div className="input-fields-wrapper">
                                        <div className="input-fields">
                                            <input
                                                type="text"
                                                placeholder="Paper Code"
                                                value={fileObj.paperCode}
                                                onChange={(e) =>
                                                    handleInputChange(index, 'paperCode', e.target.value)
                                                }
                                                disabled={isUploadCompleted}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Semester Code"
                                                value={fileObj.semesterCode}
                                                onChange={(e) =>
                                                    handleInputChange(index, 'semesterCode', e.target.value)
                                                }
                                                disabled={isUploadCompleted}
                                            />
                                        </div>

                                        {/* Display error message for validation */}
                                        {fileObj.error && (
                                            <div className="upload-result failure">
                                                {fileObj.error}
                                            </div>
                                        )}
                                    </div>

                                    {!(fileObj.result && fileObj.result.status !== null) && !isUploadCompleted && (
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteFile(index)}
                                        >
                                            &times;
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="button-container">
                            <button
                                className="upload-button"
                                onClick={handleFileUpload}
                                disabled={isUploadCompleted}
                            >
                                Upload Files
                            </button>
                        </div>
                    </div>
                )}

                {uploadStatus.includes('Completed') && (
                    <div className="upload-summary">
                        <h3>Upload Summary</h3>
                        <p>
                            {`Upload Completed: ${successCount} file(s) successful, ${failureCount} file(s) failed.`}
                        </p>
                        <ul>
                            {selectedFiles.map((fileObj, index) => (
                                <li key={index}>
                                    {fileObj.result?.status === 'success' && (
                                        <span className="success">
                                            {fileObj.file.name} renamed as {fileObj.renamedFilename} - Upload Successful
                                        </span>
                                    )}
                                    {fileObj.result?.status === 'failed' && (
                                        <span className="failure">
                                            {fileObj.file.name} renamed as {fileObj.renamedFilename} - Upload Failed: {fileObj.result.details}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <p>Would you like to:</p>
                        <div>
                            <button className="review-button" onClick={() => window.location.href = '/review-data'}>
                                Review Data
                            </button>
                            <button className="visualize-button" onClick={() => window.location.href = '/visualization'}>
                                Go to Visualization
                            </button>
                        </div>
                    </div>
                )}

                {uploadStatus && !uploadStatus.includes('Completed') && <UploadStatus status={uploadStatus} />}
            </div>
        </ThemeProvider>
    );
}

function DragAndDropBox({ onFileSelect }) {
    const [dragging, setDragging] = useState(false);
    const fileInputRef = React.createRef();

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        const uploadedFiles = Array.from(e.dataTransfer.files);
        onFileSelect(uploadedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        onFileSelect(selectedFiles);
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
            <div
                className={`drag-and-drop-box ${dragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <p className="upload-message">
                    {dragging ? 'Release to upload your files' : 'Drag & drop files here'}
                </p>
            </div>

            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <div className="button-container">
                <button className="browse-button" onClick={handleBrowseClick}>
                    Browse Files
                </button>
            </div>
        </div>
    );
}

function UploadStatus({ status }) {
    return (
        <div className="upload-status">
            <p>{status}</p>
        </div>
    );
}

export default CSVUpload;
