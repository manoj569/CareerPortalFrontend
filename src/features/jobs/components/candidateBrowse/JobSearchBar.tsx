import SearchIcon from '@mui/icons-material/Search';
import { Button, Grid, InputAdornment, Paper, TextField } from '@mui/material';

interface JobSearchBarProps {
  experience: string;
  keyword: string;
  location: string;
  onExperienceChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

export const JobSearchBar = ({
  experience,
  keyword,
  location,
  onExperienceChange,
  onKeywordChange,
  onLocationChange,
  onSearch,
}: JobSearchBarProps) => (
  <Paper
    component="form"
    onSubmit={(event) => {
      event.preventDefault();
      onSearch();
    }}
    role="search"
    sx={{ p: { xs: 1.5, sm: 2 } }}
  >
    <Grid alignItems="stretch" container spacing={1.25}>
      <Grid size={{ xs: 12, md: 5 }}>
        <TextField
          fullWidth
          label="Skills, job title or company"
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="e.g. React developer"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
          value={keyword}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField fullWidth label="Location" onChange={(event) => onLocationChange(event.target.value)} placeholder="e.g. Bengaluru" value={location} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TextField
          fullWidth
          label="Minimum experience"
          onChange={(event) => onExperienceChange(event.target.value)}
          slotProps={{ htmlInput: { min: 0, max: 60 } }}
          type="number"
          value={experience}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <Button fullWidth startIcon={<SearchIcon />} sx={{ minHeight: 48, height: '100%' }} type="submit" variant="contained">
          Search jobs
        </Button>
      </Grid>
    </Grid>
  </Paper>
);
