import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import { motion } from 'framer-motion';

import StudentPerformanceDashboard from './components/StudentPerformanceDashboard';
import GradeDistributionChart from './components/GradeDistributionChart';

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
  { label: "Dashboard", icon: <DashboardIcon />, color: '#4CAF50' },
  { label: "Grade Distribution", icon: <BarChartIcon />, color: '#2196F3' },
];

function App() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (index) => {
    setCurrentTab(index);
    if (isMobile) {
      setMobileOpen(false);
    }
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

  const TabContent = {
    0: <StudentPerformanceDashboard />,
    1: <GradeDistributionChart />,
  };

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ height: 'calc(100vh - 200px)' }}
          >
            {TabContent[currentTab]}
          </motion.div>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;