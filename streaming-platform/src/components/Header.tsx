import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  AccountCircle, 
  Menu as MenuIcon, 
  Home, 
  Movie, 
  Tv, 
  Star, 
  Person, 
  ExitToApp,
  AdminPanelSettings 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, customUser, signOut, isSubscribed, hasFreeTrial } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      handleUserMenuClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = customUser?.email === 'admin@streaming.com'; // Simple admin check

  const navigationItems = [
    { label: 'Início', path: '/', icon: <Home /> },
    { label: 'Filmes', path: '/movies', icon: <Movie /> },
    { label: 'Séries', path: '/series', icon: <Tv /> },
    { label: 'Exclusivos', path: '/exclusive', icon: <Star /> },
  ];

  const userMenuItems = [
    { label: 'Perfil', action: () => navigate('/profile'), icon: <Person /> },
    ...(isAdmin ? [{ label: 'Painel Admin', action: () => navigate('/admin'), icon: <AdminPanelSettings /> }] : []),
    { label: 'Sair', action: handleSignOut, icon: <ExitToApp /> },
  ];

  const renderNavigation = () => (
    <>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          color="inherit"
          onClick={() => navigate(item.path)}
          sx={{
            mr: 2,
            color: location.pathname === item.path ? '#e50914' : '#fff',
            borderBottom: location.pathname === item.path ? '2px solid #e50914' : 'none',
            '&:hover': {
              bgcolor: 'rgba(229, 9, 20, 0.1)',
            }
          }}
        >
          {item.label}
        </Button>
      ))}
    </>
  );

  const renderUserSection = () => {
    if (!user) {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/auth')}
            sx={{ 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Entrar
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/auth')}
            sx={{
              bgcolor: '#e50914',
              '&:hover': { bgcolor: '#b20710' }
            }}
          >
            Cadastrar
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Subscription status */}
        {!isSubscribed && !hasFreeTrial && (
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/subscription')}
            sx={{
              bgcolor: '#e50914',
              '&:hover': { bgcolor: '#b20710' },
              fontSize: '0.75rem',
            }}
          >
            Assinar
          </Button>
        )}
        
        {hasFreeTrial && !isSubscribed && (
          <Typography variant="body2" sx={{ color: '#ffd700' }}>
            Teste gratuito
          </Typography>
        )}

        {/* User menu */}
        <IconButton onClick={handleUserMenuOpen} sx={{ color: '#fff' }}>
          <Avatar
            src={customUser?.avatar_url}
            sx={{ width: 32, height: 32, bgcolor: '#e50914' }}
          >
            {customUser?.name?.charAt(0) || <AccountCircle />}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: '#111',
              color: '#fff',
              border: '1px solid #333',
            }
          }}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {customUser?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#aaa' }}>
                {customUser?.email}
              </Typography>
            </Box>
          </MenuItem>
          {userMenuItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                item.action();
                handleUserMenuClose();
              }}
              sx={{
                '&:hover': { bgcolor: '#333' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.icon}
                {item.label}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 0,
              fontWeight: 'bold',
              color: '#e50914',
              cursor: 'pointer',
              mr: 4,
            }}
            onClick={() => navigate('/')}
          >
            StreamFlix
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {renderNavigation()}
            </Box>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* User section */}
          {!isMobile && renderUserSection()}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: '#000',
            color: '#fff',
            width: 250,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* User info for mobile */}
          {user && (
            <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #333' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={customUser?.avatar_url}
                  sx={{ width: 40, height: 40, bgcolor: '#e50914', mr: 2 }}
                >
                  {customUser?.name?.charAt(0) || <AccountCircle />}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {customUser?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#aaa' }}>
                    {customUser?.email}
                  </Typography>
                </Box>
              </Box>
              
              {!isSubscribed && !hasFreeTrial && (
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  onClick={() => {
                    navigate('/subscription');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    bgcolor: '#e50914',
                    '&:hover': { bgcolor: '#b20710' },
                  }}
                >
                  Assinar
                </Button>
              )}
            </Box>
          )}

          <List>
            {/* Navigation items */}
            {navigationItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    '&:hover': { bgcolor: '#333' },
                    color: location.pathname === item.path ? '#e50914' : '#fff',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {item.icon}
                    <ListItemText primary={item.label} />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}

            {/* User menu items for mobile */}
            {user && userMenuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  sx={{ '&:hover': { bgcolor: '#333' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {item.icon}
                    <ListItemText primary={item.label} />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}

            {/* Auth buttons for mobile */}
            {!user && (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    sx={{ '&:hover': { bgcolor: '#333' } }}
                  >
                    <ListItemText primary="Entrar" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    sx={{ '&:hover': { bgcolor: '#333' } }}
                  >
                    <ListItemText primary="Cadastrar" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Spacer for fixed header */}
      <Toolbar />
    </>
  );
};

export default Header;