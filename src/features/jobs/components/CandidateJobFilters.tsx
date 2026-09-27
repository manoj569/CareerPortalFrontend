import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {

  Accordion,

  AccordionDetails,

  AccordionSummary,

  Box,

  Button,

  Checkbox,

  FormControlLabel,

  IconButton,

  Radio,

  RadioGroup,

  Slider,

  Stack,

  Tooltip,

  Typography,

} from '@mui/material';

import { useEffect, useState, type ReactNode } from 'react';



import { getWorkplaceTypeLabel } from '../constants/jobOptions';

import {

  WorkplaceType,

  type PublicJobFilterOptions,

  type SupplementalJobFilterCounts,

} from '../types/jobModels';

import type { CandidateJobSearchState } from '../utils/candidateJobSearchParams';

import {

  FacetSelectionFilter,

  type FacetSelectionOption,

} from './candidateBrowse/FacetSelectionFilter';



const SALARY_MAXIMUM_LPA = 50;

const RUPEES_PER_LAKH = 100_000;

type ExperienceBucket = {
  label: string;
  minimum: number;
  maximum?: number;
};

const EXPERIENCE_BUCKETS: ExperienceBucket[] = [
  { label: '0 – 1 years', minimum: 0, maximum: 1 },
  { label: '1 – 2 years', minimum: 1, maximum: 2 },
  { label: '2 – 4 years', minimum: 2, maximum: 4 },
  { label: '4 – 6 years', minimum: 4, maximum: 6 },
  { label: '6 – 8 years', minimum: 6, maximum: 8 },
  { label: '8 – 10 years', minimum: 8, maximum: 10 },
  { label: '10+ years', minimum: 10 },
];

const FALLBACK_EDUCATION_OPTIONS: FacetSelectionOption[] = [
  { key: '10th / SSC', label: '10th / SSC', count: 0 },
  { key: '12th / HSC', label: '12th / HSC', count: 0 },
  { key: 'Diploma', label: 'Diploma', count: 0 },
  { key: 'ITI', label: 'ITI', count: 0 },
  { key: 'Graduate', label: 'Graduate', count: 0 },
  { key: 'B.E. / B.Tech', label: 'B.E. / B.Tech', count: 0 },
  { key: 'B.Sc', label: 'B.Sc', count: 0 },
  { key: 'BCA', label: 'BCA', count: 0 },
  { key: 'B.Com', label: 'B.Com', count: 0 },
  { key: 'BBA', label: 'BBA', count: 0 },
  { key: 'Post Graduate', label: 'Post Graduate', count: 0 },
  { key: 'M.E. / M.Tech', label: 'M.E. / M.Tech', count: 0 },
  { key: 'M.Sc', label: 'M.Sc', count: 0 },
  { key: 'MCA', label: 'MCA', count: 0 },
  { key: 'MBA / PGDM', label: 'MBA / PGDM', count: 0 },
  { key: 'CA / CS / CMA', label: 'CA / CS / CMA', count: 0 },
  { key: 'PhD', label: 'PhD', count: 0 },
  { key: 'Other', label: 'Other', count: 0 },
];





interface FilterSectionProps {

  children: ReactNode;

  defaultExpanded?: boolean;

  title: string;

}



const FilterSection = ({

  children,

  defaultExpanded = false,

  title,

}: FilterSectionProps) => {

  const [expanded, setExpanded] = useState(defaultExpanded);



  return (

    <Accordion

      data-filter-group={title}

      disableGutters

      elevation={0}

      expanded={expanded}

      onChange={(_, nextExpanded) => setExpanded(nextExpanded)}

      slotProps={{

        transition: {

          unmountOnExit: false,

        },

      }}

      sx={{

        bgcolor: 'transparent',

        borderBottom: '1px solid',

        borderColor: 'divider',

        borderRadius: '0 !important',

        boxShadow: 'none',



        '&::before': {

          display: 'none',

        },



        '&:last-of-type': {

          borderBottom: 0,

        },

      }}

    >

      <AccordionSummary

        expandIcon={

          <ExpandMoreIcon

            sx={{

              color: 'text.secondary',

              fontSize: 21,

            }}

          />

        }

        sx={{

          minHeight: 50,

          px: 0,



          '&.Mui-expanded': {

            minHeight: 50,

          },



          '& .MuiAccordionSummary-content': {

            my: 1.25,

          },



          '& .MuiAccordionSummary-content.Mui-expanded': {

            my: 1.25,

          },



          '& .MuiAccordionSummary-expandIconWrapper': {

            mr: -0.5,

          },

        }}

      >

        <Typography

          sx={{

            color: 'text.primary',

            fontSize: '0.9rem',

            fontWeight: 700,

          }}

        >

          {title}

        </Typography>

      </AccordionSummary>



      <AccordionDetails

        sx={{

          px: 0,

          pb: 2,

          pt: 0,

        }}

      >

        {children}

      </AccordionDetails>

    </Accordion>

  );

};



const clamp = (

  value: number,

  minimum: number,

  maximum: number,

): number => Math.min(maximum, Math.max(minimum, value));



const amountToLpa = (

  amount: number | undefined,

  fallback: number,

): number =>

  amount === undefined

    ? fallback

    : clamp(

        Math.round(amount / RUPEES_PER_LAKH),

        0,

        SALARY_MAXIMUM_LPA,

      );



const toSalaryRange = (

  state: CandidateJobSearchState,

): [number, number] => [

  amountToLpa(state.minAmount, 0),

  amountToLpa(

    state.maxAmount,

    SALARY_MAXIMUM_LPA,

  ),

];



const formatSalary = (value: number): string =>

  value === SALARY_MAXIMUM_LPA

    ? '₹50+ LPA'

    : `₹${value} LPA`;



const enumOptions = <TValue extends number>(

  options: { value: TValue; count: number }[],

  getLabel: (value: TValue) => string,

): FacetSelectionOption[] =>

  options.map((option) => ({

    count: option.count,

    key: String(option.value),

    label: getLabel(option.value),

  }));



interface CandidateJobFiltersProps {

  appliedCount: number;

  onChange: (

    changes: Partial<CandidateJobSearchState>,

  ) => void;

  onClear: () => void;

  onCollapse?: () => void;

  options: PublicJobFilterOptions;

  state: CandidateJobSearchState;

  supplementalCounts?: SupplementalJobFilterCounts;

}



export const CandidateJobFilters = ({

  appliedCount,

  onChange,

  onClear,

  onCollapse,

  options,

  state,

  supplementalCounts,

}: CandidateJobFiltersProps) => {
const [salaryRange, setSalaryRange] = useState<

    [number, number]

  >(() => toSalaryRange(state));

  const educationOptions: FacetSelectionOption[] =
  (options.educationRequirements ?? []).length > 0
    ? (options.educationRequirements ?? []).map((option) => ({
        count: option.count,
        key: option.value,
        label: option.label,
      }))
    : FALLBACK_EDUCATION_OPTIONS;



  useEffect(() => {

    setSalaryRange([

      amountToLpa(state.minAmount, 0),

      amountToLpa(

        state.maxAmount,

        SALARY_MAXIMUM_LPA,

      ),

    ]);

  }, [state.maxAmount, state.minAmount]);



  const applySalaryRange = (value: number[]) => {

    const [

      minimum = 0,

      maximum = SALARY_MAXIMUM_LPA,

    ] = value;



    onChange({

      maxAmount:

        maximum === SALARY_MAXIMUM_LPA

          ? undefined

          : maximum * RUPEES_PER_LAKH,

      minAmount:

        minimum === 0

          ? undefined

          : minimum * RUPEES_PER_LAKH,

    });

  };



  return (

    <Stack

      data-testid="candidate-job-filter-groups"

      spacing={0}

      sx={{

        bgcolor: 'background.paper',

      }}

    >

      {/* Header */}

      <Stack

        alignItems="center"

        direction="row"

        gap={1}

        justifyContent="space-between"

        sx={{

          borderBottom: '1px solid',

          borderColor: 'divider',

          pb: 1.5,

        }}

      >

        <Box

          sx={{

            flex: 1,

            minWidth: 0,

          }}

        >

          <Typography

            component="h2"

            sx={{

              fontSize: '1.05rem',

              fontWeight: 800,

              lineHeight: 1.4,

            }}

          >

            Filters

          </Typography>

        </Box>



        <Button

          disabled={appliedCount === 0}

          onClick={onClear}

          size="small"

          sx={{

            minWidth: 'auto',

            px: 0.75,

            fontSize: '0.78rem',

            fontWeight: 700,

            textTransform: 'none',

          }}

        >

          Reset all

        </Button>



        {onCollapse ? (

          <Tooltip title="Collapse filters">

            <IconButton

              aria-label="Collapse job filters"

              onClick={onCollapse}

              size="small"

              sx={{

                ml: 0.25,

              }}

            >

              <ChevronLeftIcon fontSize="small" />

            </IconButton>

          </Tooltip>

        ) : null}

      </Stack>



      {/* Date posted */}

      <FilterSection

        defaultExpanded

        title="Date posted"

      >

        <RadioGroup

          aria-label="Date posted"

          onChange={(event) =>

            onChange({

              freshnessDays: event.target.value

                ? Number(event.target.value)

                : undefined,

            })

          }

          value={

            state.freshnessDays

              ? String(state.freshnessDays)

              : ''

          }

          sx={{

            gap: 0.15,



            '& .MuiFormControlLabel-root': {

              minHeight: 34,

              ml: -1,

              mr: 0,

            },



            '& .MuiFormControlLabel-label': {

              color: 'text.secondary',

              fontSize: '0.86rem',

            },



            '& .MuiRadio-root': {

              p: 0.75,

            },

          }}

        >

          <FormControlLabel

            control={<Radio size="small" />}

            label="All time"

            value=""

          />



          {[

            [1, 'Last 24 hours'],

            [3, 'Last 3 days'],

            [7, 'Last 7 days'],

            [15, 'Last 15 days'],

            [30, 'Last 30 days'],

          ].map(([days, label]) => {

            const freshnessDay =

              days as 1 | 3 | 7 | 15 | 30;



            const count =

              supplementalCounts?.freshness[

                freshnessDay

              ];



            return (

              <FormControlLabel

                control={<Radio size="small" />}

                key={days}

                label={

                  count !== undefined

                    ? `${label} (${count})`

                    : label

                }

                value={String(days)}

              />

            );

          })}

        </RadioGroup>

      </FilterSection>



      {/* Experience */}
        <FilterSection title="Experience level">
          <Stack spacing={0.15}>
            {EXPERIENCE_BUCKETS.map((bucket) => {
              const selected =
                (state.minExperienceYears ?? 0) === bucket.minimum &&
                (bucket.maximum === undefined
                  ? state.maxExperienceYears === undefined
                  : state.maxExperienceYears === bucket.maximum);

              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected}
                      onChange={() => {
                        if (selected) {
                          onChange({
                            minExperienceYears: undefined,
                            maxExperienceYears: undefined,
                          });
                          return;
                        }

                        onChange({
                          minExperienceYears:
                            bucket.minimum === 0 ? undefined : bucket.minimum,
                          maxExperienceYears: bucket.maximum,
                        });
                      }}
                      size="small"
                    />
                  }
                  key={`${bucket.minimum}-${bucket.maximum ?? 'plus'}`}
                  label={bucket.label}
                  sx={{
                    minHeight: 34,
                    ml: -1,
                    mr: 0,
                    '& .MuiCheckbox-root': { p: 0.75 },
                    '& .MuiFormControlLabel-label': {
                      color: selected ? 'text.primary' : 'text.secondary',
                      fontSize: '0.86rem',
                      fontWeight: selected ? 600 : 400,
                    },
                  }}
                />
              );
            })}
          </Stack>
        </FilterSection>



        {/* Location */}

      {options.locations.length > 0 ? (

        <FilterSection title="Location">

          <FacetSelectionFilter

            dialogTitle="Select locations"

            facetLabel="Location"

            onApply={(locations) =>

              onChange({ locations })

            }

            options={options.locations.map(

              (option) => ({

                count: option.count,

                key: option.value,

                label: option.label,

              }),

            )}

            searchLabel="Search locations"

            selected={state.locations}

          />

        </FilterSection>

      ) : null}



      {/* Salary */}

      <FilterSection title="Salary range">

        <Stack spacing={1.75}>

          <Typography

            color="text.secondary"

            variant="body2"

          >

            {formatSalary(salaryRange[0])}

            {' – '}

            {formatSalary(salaryRange[1])}

          </Typography>



          <Box sx={{ px: 0.75 }}>

            <Slider

              aria-label="Annual salary range"

              disableSwap

              getAriaLabel={(index) =>

                index === 0

                  ? 'Minimum annual salary'

                  : 'Maximum annual salary'

              }

              getAriaValueText={(value) =>

                formatSalary(value)

              }

              marks={[

                {

                  label: '₹0 LPA',

                  value: 0,

                },

                {

                  label: '₹50+ LPA',

                  value: SALARY_MAXIMUM_LPA,

                },

              ]}

              max={SALARY_MAXIMUM_LPA}

              min={0}

              onChange={(_, value) =>

                setSalaryRange(

                  value as [number, number],

                )

              }

              onChangeCommitted={(_, value) =>

  applySalaryRange(value)

}

              step={1}

              value={salaryRange}

              sx={{

                '& .MuiSlider-markLabel': {

                  fontSize: '0.72rem',

                },

              }}

            />

          </Box>

        </Stack>

      </FilterSection>



      {/* Work mode */}

      <FilterSection title="Work mode">

        <FacetSelectionFilter

          dialogTitle="Select work modes"

          facetLabel="Work mode"

          onApply={(values) =>

            onChange({

              workModes: values.map(Number),

            })

          }

          options={enumOptions(

            options.workModes,

            (value) =>

              value === WorkplaceType.OnSite

                ? 'Work from office'

                : getWorkplaceTypeLabel(value),

          )}

          searchLabel="Search work modes"

          selected={state.workModes.map(String)}

        />

      </FilterSection>



              {/* Education */}
        <FilterSection title="Education">
          <FacetSelectionFilter
            dialogTitle="Select education"
            facetLabel="Education"
            onApply={(educationRequirements) =>
              onChange({ educationRequirements })
            }
            options={educationOptions}
            searchLabel="Search education"
            selected={state.educationRequirements}
          />
        </FilterSection>



{/* Role category */}

      {options.roleCategories.length > 0 ? (

        <FilterSection title="Role category">

          <FacetSelectionFilter

            dialogTitle="Role category"

            facetLabel="Role category"

            onApply={(roleCategories) =>

              onChange({ roleCategories })

            }

            options={options.roleCategories.map(

              (option) => ({

                count: option.count,

                key: option.value,

                label: option.label,

              }),

            )}

            searchLabel="Search role categories"

            selected={state.roleCategories}

          />

        </FilterSection>

      ) : null}



      {/* Department */}

      {options.departments.length > 0 ? (

        <FilterSection title="Department">

          <FacetSelectionFilter

            dialogTitle="Select departments"

            facetLabel="Department"

            onApply={(departments) =>

              onChange({ departments })

            }

            options={options.departments.map(

              (option) => ({

                count: option.count,

                key: option.value,

                label: option.label,

              }),

            )}

            searchLabel="Search departments"

            selected={state.departments}

          />

        </FilterSection>

      ) : null}

    </Stack>

  );

};