import React from 'react';
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Breadcrumbs, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';

function BasicAppbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#3c8dbc' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
            Silicontechlab Pvt. Ltd
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="account"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginLeft: 8 }}>Exam Controller</span>
              </div>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <p>Exam Controller <br />Examiner</p>
              </div>
            </MenuItem>
            <MenuItem onClick={handleMenuClose} style={{ justifyContent: 'center' }}>
              <Button variant="contained" color="primary">
                <i className="fa fa-lock" /> Sign out
              </Button>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, backgroundColor: '#fff' }}>
        <Box className="content-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Message</Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} />
              Home
            </Link>
            <Typography color="textPrimary">Message</Typography>
          </Breadcrumbs>
        </Box>
      </Box>
    </Box>
  );
}

export default BasicAppbar;
