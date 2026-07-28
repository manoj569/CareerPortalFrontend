import { alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0b57d0', dark: '#083d91' },
        secondary: { main: '#455a64' },
        background: { default: '#f7f9fc', paper: '#ffffff' },
        text: { primary: '#172033', secondary: '#566176' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#8ab4f8' },
        secondary: { main: '#b0bec5' },
        background: { default: '#101319', paper: '#181c24' },
      },
    },
  },
  spacing: 8,
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 8,
          paddingInline: 20,
          whiteSpace: 'normal',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minHeight: 44, minWidth: 44 } },
    },
    MuiPaginationItem: {
      styleOverrides: { root: { minHeight: 36, minWidth: 36 } },
    },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` },
        }),
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          maxWidth: 'calc(100% - 32px)',
          margin: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        action: {
          alignItems: 'center',
          flexWrap: 'wrap',
          marginRight: 0,
        },
        message: { minWidth: 0 },
      },
    },
  },
});

export const appTheme = responsiveFontSizes(baseTheme);
