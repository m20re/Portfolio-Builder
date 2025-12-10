"use client";

import { Box } from '@mui/material';
import DashboardNavbar from './DashboardNavbar';

export default function DashboardLayout({ children, activeTab = 0, onTabChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <DashboardNavbar activeTab={activeTab} onTabChange={onTabChange} showTabs={true} />

      {/* Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5' }}>
        <Box maxWidth="xl" sx={{ mx: 'auto', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
