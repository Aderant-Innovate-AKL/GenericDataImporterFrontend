import { useState } from 'react';

import { PlatformPageTitleBar } from '@aderant/stridyn-foundation';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div data-testid="home-page">
      <PlatformPageTitleBar title="Home" />
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          p: 4,
        }}
        data-testid="home-page-container"
      >
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome to Hackathon UI Template
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Build fast with React 19, TypeScript, Vite, and Material UI
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RocketLaunchIcon />}
              href="https://github.com/aderant/platform-design"
              target="_blank"
            >
              Start Building
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<CodeIcon />}
              href="https://crispy-adventure-zwnv2z4.pages.github.io/?path=/docs/ask-maddi-askmaddi--docs"
              target="_blank"
            >
              View Components
            </Button>
          </Box>
        </Box>

        {/* Navigation Examples Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Navigation Examples
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Common navigation patterns you can use
            </Typography>

            {/* Tabs Example */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tabs Navigation
              </Typography>
              <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                <Tab label="Overview" />
                <Tab label="Features" />
                <Tab label="Settings" />
              </Tabs>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 1 }}>
                <Typography variant="body2">
                  {activeTab === 0 && 'Overview content goes here'}
                  {activeTab === 1 && 'Features content goes here'}
                  {activeTab === 2 && 'Settings content goes here'}
                </Typography>
              </Box>
            </Box>

            {/* Breadcrumbs Example */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Breadcrumbs
              </Typography>
              <Breadcrumbs>
                <Link underline="hover" color="inherit" href="/">
                  Home
                </Link>
                <Link underline="hover" color="inherit" href="/projects">
                  Projects
                </Link>
                <Typography color="text.primary">Current Project</Typography>
              </Breadcrumbs>
            </Box>

            {/* Stepper Example */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Stepper (Workflow)
              </Typography>
              <Stepper activeStep={1} sx={{ mt: 2 }}>
                <Step>
                  <StepLabel>Setup</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Configure</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Deploy</StepLabel>
                </Step>
              </Stepper>
            </Box>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Helpful Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="https://react.dev/" target="_blank" underline="hover">
                React Documentation
              </Link>
              <Link href="https://mui.com/" target="_blank" underline="hover">
                Material UI Components
              </Link>
              <Link href="https://vitejs.dev/" target="_blank" underline="hover">
                Vite Build Tool
              </Link>
              <Link href="https://tanstack.com/query" target="_blank" underline="hover">
                TanStack Query
              </Link>
              <Link
                href="https://www.typescriptlang.org/"
                target="_blank"
                underline="hover"
              >
                TypeScript Guide
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
