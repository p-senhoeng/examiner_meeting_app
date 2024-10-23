import React from 'react';
import { Link } from 'react-router-dom';
import Nav from './Nav';
import { AppBar, Toolbar, Box, Typography, Container } from '@mui/material';

function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#ffffff', // White background for a clean look
        color: '#333', // Dark text color for contrast
        boxShadow: 'none', // Remove box shadow
        padding: '10px 0',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo and Title */}
          <Box display="flex" alignItems="center">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <img
                src='https://niwa.co.nz/sites/default/files/Waik_Word_RGB_H.jpg'
                alt="Waikato University"
                style={{ 
                  height: '130px', 
                  marginRight: '100px',
                  cursor: 'pointer' // Indicates the image is clickable
                }}
              />
            </Link>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif', // Set font family for the title
                color: '#BE0028', // Set color for title to match branding or add contrast
              }}
            >
              Examiner Meeting
            </Typography>
          </Box>
          {/* Navigation Component */}
          <Nav />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;