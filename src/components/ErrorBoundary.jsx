import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
          <Typography variant="h4" gutterBottom color="error">
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={this.handleReset}>
              Go to Home
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;