import React, { useState } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Popover,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  Delete as DeleteIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import { styled, createTheme, ThemeProvider, keyframes, alpha } from '@mui/material/styles';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import Header from './Header'; // Import your Header component

// Create a custom theme with Waikato University's red color
const theme = createTheme({
  palette: {
    primary: {
      main: '#BE0028', // Waikato University red
    },
    secondary: {
      main: '#5D001D', // A darker shade of red for contrast
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Define keyframes for animations
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const selectionWave = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled components
const WaikatoAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-4px)',
  },
}));

const InteractiveButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    animation: `${pulse} 0.5s ease-in-out infinite`,
  },
}));

const DownloadButton = styled(InteractiveButton)(({ theme }) => ({
  '&:hover': {
    '& .MuiSvgIcon-root': {
      animation: `${bounce} 1s ease infinite`,
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background 0.3s ease-in-out',
  ...(selected && {
    background: `linear-gradient(
      90deg, 
      ${alpha('#ff0000', 0.2)} 0%, 
      ${alpha('#ff7f00', 0.2)} 14.28%, 
      ${alpha('#ffff00', 0.2)} 28.56%, 
      ${alpha('#00ff00', 0.2)} 42.84%, 
      ${alpha('#0000ff', 0.2)} 57.12%, 
      ${alpha('#4b0082', 0.2)} 71.4%, 
      ${alpha('#9400d3', 0.2)} 85.68%, 
      ${alpha('#ff0000', 0.2)} 100%
    )`,
    backgroundSize: '200% 100%',
    animation: `${selectionWave} 5s linear infinite`,
  }),
}));

const DataProcessingUI = ({
  availableFiles,
  selectedFile,
  handleFileSelect,
  handleFileDownload,
  handleFileDelete,
  searchTerm,
  handleSearch,
  data,
  columns,
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
  isDataLoading,
  fetchAvailableFiles,
  handleViewData,
  hasSelectedFile,
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [tableHeight, setTableHeight] = useState(440);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleStudentClick = (event, student) => {
    setSelectedStudent(student);
    setSelectedStudentId(student['ID number']);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleResize = (event, { size }) => {
    setTableHeight(size.height);
  };

  // Function to find the lowest grade
  const findLowestGrade = () => {
    return Math.min(...visibleRows.map(row => parseFloat(row['Paper total (Real)']) || 0));
  };

  const lowestGrade = findLowestGrade();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
        
        <WaikatoAppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Data Processing Dashboard
            </Typography>
          </Toolbar>
        </WaikatoAppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <AnimatedPaper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <Typography variant="h6" gutterBottom>File Selection</Typography>
                  <Tooltip title="Refresh file list">
                    <IconButton 
                      onClick={fetchAvailableFiles} 
                      color="primary"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="file-select-label">Select File</InputLabel>
                    <Select
                      labelId="file-select-label"
                      value={selectedFile || ""}
                      onChange={(e) => handleFileSelect(e.target.value)}
                      label="Select File"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {availableFiles.map((filename) => (
                        <MenuItem key={filename} value={filename}>{filename}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedFile && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Tooltip title="Download selected file">
                        <DownloadButton
                          onClick={() => handleFileDownload(selectedFile)}
                          variant="outlined"
                          startIcon={<GetAppIcon />}
                        >
                          Download
                        </DownloadButton>
                      </Tooltip>
                      <Tooltip title="Delete selected file">
                        <InteractiveButton
                          onClick={() => handleFileDelete(selectedFile)}
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </InteractiveButton>
                      </Tooltip>
                    </Box>
                  )}
                </AnimatedPaper>
              </Zoom>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <AnimatedPaper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="h6" gutterBottom>Data Overview</Typography>
                  <TextField
                    label="Search"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearch}
                    fullWidth
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                  <Tooltip title="View data visualization">
                    <InteractiveButton
                      variant="contained"
                      color="primary"
                      onClick={handleViewData}
                      disabled={!hasSelectedFile}
                      fullWidth
                      size="large"
                      sx={{ mt: 2 }}
                      startIcon={<BarChartIcon />}
                    >
                      View Data Visualization
                    </InteractiveButton>
                  </Tooltip>
                </AnimatedPaper>
              </Zoom>
            </Grid>
          </Grid>

          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <AnimatedPaper elevation={3} sx={{ mt: 3, p: 3, overflow: 'hidden' }}>
              <Typography variant="h6" gutterBottom>Student Data</Typography>
              {isDataLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', bgcolor: 'rgba(0, 0, 0, 0.1)' }}>
                  <CircularProgress sx={{ color: 'primary.main', animationDuration: '550ms' }} />
                </Box>
              ) : data.length > 0 ? (
                <>
                  <ResizableBox
                    width={Infinity}
                    height={tableHeight}
                    onResize={handleResize}
                    minConstraints={[Infinity, 200]}
                    maxConstraints={[Infinity, 1000]}
                  >
                    <TableContainer sx={{ height: '100%' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            {columns.map((column) => (
                              <TableCell key={column} sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main', color: 'common.white' }}>
                                {column}
                              </TableCell>
                            ))}
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'primary.main', color: 'common.white' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visibleRows.map((row, index) => (
                            <StyledTableRow 
                              key={index} 
                              onClick={(event) => handleStudentClick(event, row)}
                              selected={selectedStudentId === row['ID number']}
                              sx={{
                                ...(parseFloat(row['Paper total (Real)']) === lowestGrade && {
                                  '&:not(:hover):not(.Mui-selected)': {
                                    backgroundColor: 'rgba(190, 0, 40, 0.1)', // Highlight lowest grade with a light red
                                  },
                                  '&:hover:not(.Mui-selected)': {
                                    backgroundColor: 'rgba(190, 0, 40, 0.2)',
                                  },
                                }),
                              }}
                            >
                              {columns.map((column) => (
                                <TableCell 
                                  key={column} 
                                  sx={{ 
                                    fontSize: '0.9rem',
                                    ...(column === 'Paper total (Real)' && parseFloat(row[column]) === lowestGrade && {
                                      fontWeight: 'bold',
                                      color: 'primary.main',
                                    }),
                                  }}
                                >
                                  {row[column] != null ? row[column].toString() : ''}
                                </TableCell>
                              ))}
                              <TableCell>
                                <InteractiveButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditGrade(row);
                                  }}
                                  size="small"
                                  variant="outlined"
                                >
                                  Edit Grade
                                </InteractiveButton>
                              </TableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </ResizableBox>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              ) : (
                <Typography variant="body1" sx={{ p: 2 }}>No data available</Typography>
              )}
            </AnimatedPaper>
          </Zoom>
        </Container>

        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          TransitionComponent={Zoom}
          PaperProps={{
            style: {
              borderRadius: '12px',
            },}}
            >
              <DialogTitle>Edit Student Grade</DialogTitle>
              <DialogContent>
                {selectedStudent && (
                  <DialogContentText>
                    Editing grade for student: {selectedStudent['First name']} {selectedStudent['Last name']} (ID: {selectedStudent['ID number']})
                  </DialogContentText>
                )}
                <TextField
                  autoFocus
                  margin="dense"
                  label="Grade Level"
                  fullWidth
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  sx={{ mb: 2 }}
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
                <InteractiveButton onClick={handleSaveGrade} variant="contained" color="primary">
                  Save
                </InteractiveButton>
              </DialogActions>
            </Dialog>
    
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              {selectedStudent && (
                <Box sx={{ p: 5, maxWidth: 600 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedStudent['First name']} {selectedStudent['Last name']}
                  </Typography>
                  <Typography variant="body2">ID: {selectedStudent['ID number']}</Typography>
                  <Typography variant="body2">Grade: {selectedStudent['Paper total (Real)']}</Typography>
                  {parseFloat(selectedStudent['Paper total (Real)']) === lowestGrade && (
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold', mt: 1 }}>
                      Lowest grade in class
                    </Typography>
                  )}
                  {/* Add more student details as needed */}
                </Box>
              )}
            </Popover>
    
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              TransitionComponent={Fade}
            >
              <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </ThemeProvider>
      );
    };
    
    export default DataProcessingUI;