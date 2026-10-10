import type { SvgIconComponent } from '@mui/icons-material';

export interface NavigationItem {
  label: string;
  path: string;
  icon?: SvgIconComponent;
  end?: boolean;
  preserveCurrentLocation?: boolean;
  badge?: string;
  children?: NavigationItem[];
  activePaths?: string[];
}
