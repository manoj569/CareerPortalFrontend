import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material';

interface JobSearchBarProps {
  experience: string;
  keyword: string;
  location: string;
  onExperienceChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

const CONTROL_HEIGHT = 54;

const fieldSx = {
  flex: 1,
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    height: CONTROL_HEIGHT,
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontSize: '0.94rem',
    '& fieldset': {
      borderColor: '#d9dee7',
    },
    '&:hover fieldset': {
      borderColor: '#b8c1cf',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1.5,
    },
  },
  '& .MuiInputAdornment-root': {
    color: '#7b8494',
  },
};

export const JobSearchBar = ({
  experience,
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  onSearch,
}: JobSearchBarProps) => (
  <Paper
    component="form"
    elevation={0}
    onSubmit={(event) => {
      event.preventDefault();
      onSearch();
    }}
    role="search"
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      backgroundColor: 'background.paper',
      p: { xs: 1.5, sm: 2 },
    }}
  >
    {/*
      Keep the existing experience value/callback in this component's API.

      Experience is intentionally not rendered in the primary search row.
      It continues to be controlled through the existing filters on the
      Browse Jobs page.
    */}
    <input
      aria-hidden="true"
      readOnly
      tabIndex={-1}
      type="hidden"
      value={experience}
    />

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 1.55fr) minmax(260px, 1fr) 160px',
        },
        gap: 1.25,
        alignItems: 'center',
      }}
    >
      <TextField
        data-control-height={CONTROL_HEIGHT}
        data-testid="job-search-keyword"
        fullWidth
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="Job title, skills, company or keywords"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
          htmlInput: {
            'aria-label': 'Job title, skills, company or keywords',
          },
        }}
        sx={fieldSx}
        value={keyword}
      />

      <TextField
        data-control-height={CONTROL_HEIGHT}
        data-testid="job-search-location"
        fullWidth
        onChange={(event) => onLocationChange(event.target.value)}
        placeholder="Location (e.g. Pune, Mumbai, Remote)"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
          htmlInput: {
            'aria-label': 'Location',
          },
        }}
        sx={fieldSx}
        value={location}
      />

      <Button
        data-control-height={CONTROL_HEIGHT}
        data-testid="job-search-submit"
        fullWidth
        startIcon={<SearchIcon />}
        sx={{
          borderRadius: '8px',
          height: CONTROL_HEIGHT,
          minHeight: CONTROL_HEIGHT,
          px: 2.5,
          fontWeight: 700,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        }}
        type="submit"
        variant="contained"
      >
        Search jobs
      </Button>
    </Box>
  </Paper>
);