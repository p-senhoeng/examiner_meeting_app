import React from 'react';
import {
  AppBar, Toolbar, Typography, Container, Grid, Paper, Box, Button, TextField, 
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, 
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, 
  Alert, CircularProgress, IconButton, Tooltip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  CloudUpload as CloudUploadIcon, 
  BarChart as BarChartIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const DataProcessingUI = ({
  file,
  handleFileChange,
  uploadFile,
  uploading,
  availableFiles,
  selectedFile,
  handleFileSelect,
  handleFileDownload,
  message,
  error,
  setError,
  searchTerm,
  handleSearch,
  data,
  columns,
  orderBy,
  order,
  handleRequestSort,
  visibleRows,
  handleEditGrade,
  rowsPerPage,
  page,
  filteredData,
  handleChangePage,
  handleChangeRowsPerPage,
  editDialogOpen,
  setEditDialogOpen,
  gradeLevel,
  setGradeLevel,
  comments,
  setComments,
  handleSaveGrade,
  snackbar,
  setSnackbar,
  isLoading,
  fetchAvailableFiles,
  isDataLoading,
  handleViewData,
  hasSelectedFile
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Data Processing Dashboard</Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>File Upload</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Box>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                      Select File
                    </Button>
                  </label>
                  {file && <Typography variant="body2" sx={{ mt: 1 }}>{file.name}</Typography>}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={uploadFile}
                    disabled={!file || uploading}
                    startIcon={uploading ? <CircularProgress size={24} /> : null}
                    fullWidth
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  {message && <Typography color="primary" sx={{ mt: 1 }}>{message}</Typography>}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Available Files</Typography>
                <Tooltip title="Refresh file list">
                  <IconButton onClick={fetchAvailableFiles} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Box>
                    <Typography color="error">{error}</Typography>
                    <Button onClick={() => setError(null)}>Clear Error</Button>
                    <Button onClick={fetchAvailableFiles}>Retry</Button>
                  </Box>
                ) : Array.isArray(availableFiles) && availableFiles.length > 0 ? (
                  <>
                    <FormControl fullWidth>
                      <InputLabel id="file-select-label">Select File</InputLabel>
                      <Select
                        labelId="file-select-label"
                        value={selectedFile || ''}
                        onChange={(e) => handleFileSelect(e.target.value)}
                        label="Select File"
                      >
                        {availableFiles.map((filename) => (
                          <MenuItem key={filename} value={filename}>
                            {filename}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {selectedFile && (
                      <Button
                        onClick={() => handleFileDownload(selectedFile)}
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Download {selectedFile}
                      </Button>
                    )}
                  </>
                ) : (
                  <Typography>No files available. Try uploading a file.</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<BarChartIcon />}
              onClick={handleViewData}
              disabled={!hasSelectedFile}
              fullWidth
            >
              View Data Visualization
            </Button>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1, mt: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search"
              variant="outlined"
              onChange={handleSearch}
              value={searchTerm}
              size="small"
              fullWidth
            />
            {isDataLoading && (
              <CircularProgress size={24} sx={{ ml: 2 }} />
            )}
          </Box>

          {isDataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
              <CircularProgress />
            </Box>
          ) : data.length > 0 ? (
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table stickyHeader aria-label="sticky table">
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
                        <Button onClick={() => handleEditGrade(row)} size="small">Edit Grade</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
              <Typography variant="body1">No data available</Typography>
            </Box>
          )}

          {data.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Paper>
      </Container>

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
    </Box>
  );
};

export default DataProcessingUI;