import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Import the hamburger icon
import { keyframes } from '@mui/system';

// Define keyframes for the underline animation
const underlineAnimation = keyframes`
  0% {
    width: 0;
    left: 0;
  }
  100% {
    width: 100%;
    left: 0;
  }
`;

const Nav = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button 
        onClick={handleClick} 
        sx={{ 
          color: '#333', // Text color
          backgroundColor: 'transparent', // Transparent background
          '&:hover': { backgroundColor: 'transparent' }, // Remove hover background
          minWidth: 'auto' // To make sure button doesn't have extra width
        }}
      >
        <MenuIcon sx={{ fontSize: '1.5rem' }} /> {/* Use MenuIcon as hamburger */}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {/* Home menu item specifically navigates to the root path */}
        <MenuItem
          onClick={handleClose}
          component={Link}
          to="/"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#333', // Default text color
            '&:hover': {
              color: '#CC0033', // Change text color on hover
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '0',
              height: '2px',
              bottom: '0px',
              left: '0',
              backgroundColor: '#CC0033', // Red underline color
              transition: 'width 0.3s ease-out',
            },
            '&:hover::after': {
              width: '100%', // Animate underline from left to right
            },
          }}
        >
          Home
        </MenuItem>
        {/* Other menu items */}
        <MenuItem
          onClick={handleClose}
          component={Link}
          to="/review-data"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#333',
            '&:hover': {
              color: '#CC0033',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '0',
              height: '2px',
              bottom: '0px',
              left: '0',
              backgroundColor: '#CC0033',
              transition: 'width 0.3s ease-out',
            },
            '&:hover::after': {
              width: '100%',
            },
          }}
        >
          Review Data
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          component={Link}
          to="/visualization"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#333',
            '&:hover': {
              color: '#CC0033',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '0',
              height: '2px',
              bottom: '0px',
              left: '0',
              backgroundColor: '#CC0033',
              transition: 'width 0.3s ease-out',
            },
            '&:hover::after': {
              width: '100%',
            },
          }}
        >
          Visualization
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          component={Link}
          to="/upload-csv"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#333',
            '&:hover': {
              color: '#CC0033',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '0',
              height: '2px',
              bottom: '0px',
              left: '0',
              backgroundColor: '#CC0033',
              transition: 'width 0.3s ease-out',
            },
            '&:hover::after': {
              width: '100%',
            },
          }}
        >
          Upload CSV
        </MenuItem>
      </Menu>
    </>
  );
};

export default Nav;
