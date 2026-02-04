import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { Home as HomeIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="h1" sx={{ fontSize: '8rem', fontWeight: 700, color: '#2563eb' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/lookup')}
            size="large"
          >
            Student Lookup
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;