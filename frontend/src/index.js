import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";

import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Loading from './pages/loading';
import Menu from './pages/menu';
import Mint from './pages/mint';
import List from './pages/list';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

const theme = createTheme();

const router = createMemoryRouter([
  {
    path: "/",
    element: <Loading />,
  },
  {
    path: "/menu",
    element: <Menu />,
  },
  {
    path: "/mint",
    element: <Mint />,
  },
  {
    path: "/list",
    element: <List />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppBar
      position="absolute"
      color="default"
      elevation={0}
      sx={{
        position: 'relative',
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap>
          Cubie Token
        </Typography>
      </Toolbar>
    </AppBar>
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <RouterProvider router={router} />
      </Paper>
    </Container>
  </ThemeProvider>
);
