import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';

interface SearchInputProps {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export const SearchInput = ({ label, onChange, placeholder, value }: SearchInputProps) => (
  <TextField
    label={label}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon aria-hidden fontSize="small" />
          </InputAdornment>
        ),
      },
    }}
    value={value}
  />
);
