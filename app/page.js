'use client'

import { ArrowForward } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { Box, Container, Typography, Button, Grid,
          Card, CardContent, Stack, Paper } from '@mui/material';


export default function Page() {
  return(
    <Box>
      <Navbar/>
      {/* Main Section */}
      <Box
        sx={{
          background: 'white',
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography
            variant='h2'
            component='h1'
            gutterBottom
            sx={{
              fontWeight: 'bold',
            }}
          >
            Build your own portfolio!
          </Typography>
          <Typography
            variant='h5'
            sx={{
              mb: 4,
              opacity: 0.85
            }}
          >
            Create portfolios using our drag-and-drop editor!
          </Typography>
          <Stack
            direction={{
              xs: 'column',
              sm: 'row'
            }}
          >
            <Button
              variant='contained'
              size='large'
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s'
                },
                px: 4,
                py: 1.5
              }}
            >
              Create an account
            </Button>
            <Button
              variant='contained'
              size='large'
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                '&:hover': {
                  bg: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s'
                },
                px: 4,
                py: 1.5
              }}
            >
              Try it out!
            </Button>
          </Stack>
        </Container>
      </Box>
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant='h3'
          align='center'
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 6 }}
        >

        </Typography>
      </Container>
    </Box>
  )
}
