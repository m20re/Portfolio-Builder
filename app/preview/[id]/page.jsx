"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { portfolioAPI } from '../../../lib/api';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  Alert,
  Chip,
} from '@mui/material';

export default function PreviewPortfolioPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      loadPortfolio();
    }
  }, [id, isAuthenticated]);

  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.getById(id);
      setPortfolio(response.portfolio);
    } catch (err) {
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !portfolio) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error || 'Portfolio not found'}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 6 }}>
      {/* Preview Banner */}
      <Box sx={{ bgcolor: 'warning.main', py: 2, mb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label="PREVIEW MODE" color="warning" />
            This is how your portfolio will look when published
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={0} sx={{ p: 6, mb: 4, textAlign: 'center', borderRadius: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mx: 'auto',
              mb: 3,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {portfolio.user.name.charAt(0).toUpperCase()}
          </Avatar>
          
          <Typography variant="h3" gutterBottom fontWeight="bold">
            {portfolio.title}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom>
            by {portfolio.user.name}
          </Typography>
          
          {portfolio.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
              {portfolio.description}
            </Typography>
          )}
        </Paper>

        {/* Sections */}
        {portfolio.sections && portfolio.sections.map((section) => (
          <Paper
            key={section.id}
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            {section.title && (
              <Typography variant="h5" gutterBottom fontWeight="600" color="primary.main">
                {section.title}
              </Typography>
            )}
            
            {section.content && (
              <Box
                sx={{
                  mt: 2,
                  '& p': { marginBottom: 2, lineHeight: 1.7 },
                  '& h1, & h2, & h3': { marginTop: 3, marginBottom: 2 },
                  '& img': { maxWidth: '100%', borderRadius: 2, marginTop: 2, marginBottom: 2 },
                  '& a': { color: 'primary.main', textDecoration: 'none' },
                  '& ul': { paddingLeft: 3 },
                  '& li': { marginBottom: 1 },
                }}
                dangerouslySetInnerHTML={{ 
                  __html: typeof section.content === 'string' 
                    ? section.content 
                    : section.content?.html || '' 
                }}
              />
            )}
          </Paper>
        ))}

        {/* Projects Section */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
              Projects
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              {portfolio.projects.map((project) => (
                <Paper
                  key={project.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {project.title}
                  </Typography>
                  
                  {project.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {project.description}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
