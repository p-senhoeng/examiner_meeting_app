import React, { useState } from 'react';
import { Box, CircularProgress, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, AppBar, Toolbar, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import RadarIcon from '@mui/icons-material/Radar';
import HeatMapIcon from '@mui/icons-material/Gradient';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import { motion } from 'framer-motion';

import BoxPlot from './components/Charts/BoxPlot';
import StackedBarChart from './components/Charts/StackedBarChart';
import ScatterPlot from './components/Charts/ScatterPlot';
import HeatmapChart from './components/Charts/HeatmapChart';
import RadarChartComponent from './components/Charts/RadarChartComponent';
import DataTable from './components/DataTable';
import FileUploader from './components/FileUploader';
import GradeDistributionPieChart from './components/Charts/GradeDistributionPieChart';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: { main: '#3f51b5' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const TAB_INFO = [
  { label: "Data Table", icon: <TableChartIcon />, color: '#4CAF50' },
  { label: "Grade Distribution Bar", icon: <BarChartIcon />, color: '#2196F3' },
  { label: "Performance Correlation", icon: <ScatterPlotIcon />, color: '#FF9800' },
  { label: "Individual Performance", icon: <RadarIcon />, color: '#E91E63' },
  { label: "Assessment Correlation", icon: <HeatMapIcon />, color: '#9C27B0' },
  { label: "Score Distribution", icon: <ShowChartIcon />, color: '#00BCD4' },
  { label: "Grade Distribution Pie", icon: <PieChartIcon />, color: '#FFC107' },
];

function App() {
  const [studentData, setStudentData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tableName, setTableName] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUploadSuccess = (data) => {
    setIsLoading(true);
    setError(null);
    try {
      setStudentData(data.data);
      setColumns(data.columns);
      setTableName(data.table_name);
      setSelectedStudent(data.data[0]);
    } catch (err) {
      setError("Error processing uploaded data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (index) => {
    setCurrentTab(index);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleStudentChange = (student) => {
    setSelectedStudent(student);
  };

  const TabContent = {
    0: <DataTable data={studentData} columns={columns} />,
    1: <StackedBarChart data={studentData} />,
    2: <ScatterPlot data={studentData} />,
    3: <RadarChartComponent data={studentData} selectedStudent={selectedStudent} onStudentChange={handleStudentChange} />,
    4: <HeatmapChart data={studentData} />,
    5: <BoxPlot data={studentData} />,
    6: <GradeDistributionPieChart data={studentData} />
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {TAB_INFO.map((tab, index) => (
          <ListItem 
            button 
            key={tab.label} 
            onClick={() => handleTabChange(index)}
            style={{ 
              backgroundColor: currentTab === index ? tab.color : 'transparent',
              color: currentTab === index ? 'white' : 'inherit',
              transition: 'background-color 0.3s'
            }}
          >
            <ListItemIcon style={{ color: currentTab === index ? 'white' : tab.color }}>
              {tab.icon}
            </ListItemIcon>
            <ListItemText primary={tab.label} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Student Performance Analysis
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </motion.div>
          {isLoading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Typography color="error" align="center" my={4}>
              {error}
            </Typography>
          )}
          {studentData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ height: 'calc(100vh - 200px)' }}
            >
              {TabContent[currentTab]}
            </motion.div>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;