import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Box,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

import type { PortfolioSectionType } from '../types/portfolioModels';

type PortfolioSectionRowProps = {
  sectionType: PortfolioSectionType;
  label: string;
  description?: string;
  icon: ReactNode;
  visible: boolean;
  disabled?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onEdit?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

const PortfolioSectionRow = ({
  sectionType,
  label,
  description,
  icon,
  visible,
  disabled = false,
  canMoveUp = false,
  canMoveDown = false,
  onVisibilityChange,
  onEdit,
  onMoveUp,
  onMoveDown,
}: PortfolioSectionRowProps) => {
  const canMove = Boolean(
    onMoveUp || onMoveDown,
  );

  const handleMove = () => {
    if (disabled) {
      return;
    }

    if (
      canMoveDown &&
      onMoveDown
    ) {
      onMoveDown();
      return;
    }

    if (
      canMoveUp &&
      onMoveUp
    ) {
      onMoveUp();
    }
  };

  return (
    <Stack
      alignItems="center"
      direction="row"
      spacing={{
        xs: 0.75,
        sm: 1,
      }}
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        minHeight: 54,
        px: {
          xs: 0.75,
          sm: 1,
        },
        py: 0.65,
        transition: (theme) =>
          theme.transitions.create([
            'border-color',
            'background-color',
            'box-shadow',
          ]),

        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
          boxShadow: (theme) =>
            theme.shadows[1],
        },

        '&:hover .portfolio-section-edit':
          {
            opacity: 1,
          },
      }}
    >
      <Tooltip
        arrow
        title={
          canMove
            ? 'Change section order'
            : 'Section order'
        }
      >
        <span>
          <IconButton
            aria-label={`Move ${label}`}
            disabled={
              disabled || !canMove
            }
            onClick={handleMove}
            size="small"
            sx={{
              color: 'text.disabled',
              cursor:
                disabled || !canMove
                  ? 'default'
                  : 'grab',
              flexShrink: 0,
              height: 30,
              width: 30,

              '&:hover': {
                bgcolor: 'transparent',
                color: 'text.secondary',
              },
            }}
          >
            <DragIndicatorRoundedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </IconButton>
        </span>
      </Tooltip>

      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'action.hover',
          borderRadius: 1.5,
          color: 'primary.main',
          display: 'flex',
          flexShrink: 0,
          height: 34,
          justifyContent: 'center',
          width: 34,

          '& svg': {
            fontSize: 18,
          },
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          pl: 0.15,
        }}
      >
        <Typography
          sx={{
            color: 'text.primary',
            fontSize: '0.78rem',
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>

        {description ? (
          <Typography
            color="text.secondary"
            noWrap
            sx={{
              fontSize: '0.64rem',
              lineHeight: 1.35,
              mt: 0.15,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>

      <Tooltip
        arrow
        title={
          visible
            ? `Hide ${label}`
            : `Show ${label}`
        }
      >
        <Switch
          checked={visible}
          disabled={disabled}
          onChange={(
            _,
            checked,
          ) => {
            onVisibilityChange(
              checked,
            );
          }}
          size="small"
          slotProps={{
            input: {
              'aria-label': label,
            },
          }}
          sx={{
            flexShrink: 0,
            mr: onEdit
              ? 0
              : 0.25,

            '& .MuiSwitch-switchBase':
              {
                p: 0.75,
              },

            '& .MuiSwitch-thumb': {
              height: 16,
              width: 16,
            },

            '& .MuiSwitch-track': {
              borderRadius: 999,
            },
          }}
        />
      </Tooltip>

      {onEdit ? (
        <Tooltip
          arrow
          title={`Edit ${label}`}
        >
          <span>
            <IconButton
              aria-label={`Edit ${label}`}
              className="portfolio-section-edit"
              disabled={disabled}
              onClick={onEdit}
              size="small"
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                color: 'text.secondary',
                flexShrink: 0,
                height: 30,
                opacity: {
                  xs: 1,
                  md: 0.78,
                },
                transition: (theme) =>
                  theme.transitions.create([
                    'background-color',
                    'border-color',
                    'color',
                    'opacity',
                  ]),
                width: 30,

                '&:hover': {
                  bgcolor: 'primary.main',
                  borderColor:
                    'primary.main',
                  color:
                    'primary.contrastText',
                },
              }}
            >
              <EditOutlinedIcon
                sx={{
                  fontSize: 15,
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}

      <Box
        component="span"
        sx={{
          display: 'none',
        }}
      >
        {sectionType}
      </Box>
    </Stack>
  );
};

export default PortfolioSectionRow;