import { useCallback } from 'react';
// @mui
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
// types
import { IJobFilters, IJobFilterValue } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useGetAllCategory } from 'src/api/category';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onOpen: VoidFunction;
  onClose: VoidFunction;
  //
  filters: IJobFilters;
  onFilters: (name: string, value: IJobFilterValue) => void;
  //
  canReset: boolean;
  onResetFilters: VoidFunction;
  //
  roleOptions: string[];
  benefitOptions: string[];
  experienceOptions: string[];
  employmentTypeOptions: string[];
  publishOptions: string[];
  locationOptions: {
    code: string;
    label: string;
    phone: string;
    suggested?: boolean;
  }[];
};

export default function CategoryFilters({
  open,
  onOpen,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
  //
  roleOptions,
  locationOptions,
  benefitOptions,
  experienceOptions,
  employmentTypeOptions,
  publishOptions,
  setParentId,
}: Props) {
  const { category } = useGetAllCategory({
    limit: 1000,
    page: 1,
    has_child: 1,
  });

  let parentCategoryOptions = category?.map((item) => {
    const translations = item.category_translations;

    // Find the translation for both Arabic and English locales
    const englishTranslation = translations.find((t) => t.locale === 'en');
    const arabicTranslation = translations.find((t) => t.locale === 'ar');

    return {
      label: `${englishTranslation?.name || 'Unknown'} (${arabicTranslation?.name || 'Unknown'})`,
      value: item.id,
    };
  });
  // parentCategoryOptions = parentCategoryOptions?.map((option) => option.label)

  const handleFilterPublish = useCallback(
    (newValue: string) => {
      onFilters('published', newValue);
    },
    [onFilters]
  );

  const handleFilterParent = useCallback(
    (newValue: string[]) => {
      onFilters('parent_id', newValue);
    },
    [onFilters]
  );

  const handleFilterLocations = useCallback(
    (newValue: string[]) => {
      onFilters('locations', newValue);
    },
    [onFilters]
  );

  const handleFilterBenefits = useCallback(
    (newValue: string) => {
      const checked = filters.benefits.includes(newValue)
        ? filters.benefits.filter((value) => value !== newValue)
        : [...filters.benefits, newValue];
      onFilters('benefits', checked);
    },
    [filters.benefits, onFilters]
  );

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Filters
      </Typography>

      <Tooltip title="Reset">
        <IconButton onClick={onResetFilters}>
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderPublish = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Publish Status
      </Typography>
      {publishOptions.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Radio
              checked={option === filters.published}
              onClick={() => handleFilterPublish(option)}
            />
          }
          label={option}
          sx={{
            ...(option === 'all' && {
              textTransform: 'capitalize',
            }),
          }}
        />
      ))}
    </Stack>
  );

  const renderRoles = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Parent Category
      </Typography>
      <Autocomplete
        options={parentCategoryOptions?.map((option) => option)}
        getOptionLabel={(option) => option.label}
        value={filters.parent_id}
        onChange={(event, newValue) => handleFilterParent(newValue)}
        renderInput={(params) => <TextField placeholder="Select Category" {...params} />}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              label={option}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        {renderHead}

        <Divider />

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {/* {renderEmploymentTypes} */}

            {renderPublish}

            {renderRoles}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
