import { useCallback, useState } from 'react';
// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
// types
import { IJobFilters, IJobFilterValue } from 'src/types/job';
import { useLocales } from 'src/locales';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { MenuItem, Select } from '@mui/material';
import { useGetGearEnum } from 'src/api/users';
import { useTranslation } from 'react-i18next';
import { useGetCategories, useGetCities, useGetVendors } from 'src/api/enum';

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
};
export default function TrainerFilters({
  open,
  onOpen,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters, //
}: Props) {
  const [searchCategory, setSearchCategory] = useState('');
  const { t } = useLocales();

  const { categories, categoriesLoading } = useGetCategories(0, 100);
  const { cities } = useGetCities(0, 1000);

  const { gearData, gearLoading } = useGetGearEnum();
  const [searchValue, setSearchValue] = useState('');

  const { vendorList, vendorLoading } = useGetVendors({ page: 1, limit: 1000 });

  const handleFilterCategory = useCallback(
    (newValue: string[]) => {
      onFilters('vehicle_type_id', newValue);
    },
    [onFilters]
  );

  const handleFilterChange = (field, value) => {
    onFilters(field, value);
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t('filters')}
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

  const renderCategory = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('category')}
      </Typography>

      <Autocomplete
        options={
          categories?.map((item: any) => ({
            label: item.category_translations
              .map((translation: any) => translation.name) // Extract all names
              .join(' - '), // Display full name
            value: item.id,
          })) ?? []
        }
        getOptionLabel={(option) => option.label}
        value={
          !filters.vehicle_type_id || filters.vehicle_type_id === undefined
            ? ''
            : filters.vehicle_type_id
        }
        onChange={(event, newValue) => handleFilterCategory(newValue)}
        renderInput={(params) => <TextField placeholder={t('Select Category')} {...params} />}
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
  const renderCity = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('city')}
      </Typography>

      <Autocomplete
        options={
          cities?.map((item: any) => ({
            label: item.city_translations.map((translation: any) => translation.name).join(' - '),
            value: item.id,
          })) ?? []
        }
        getOptionLabel={(option) => option.label}
        value={
          cities
            ?.map((item: any) => ({
              label: item.city_translations.map((translation: any) => translation.name).join(' - '),
              value: item.id,
            }))
            .find((option: any) => option.value === filters.city_id) || null
        }
        onChange={(event, newValue) =>
          handleFilterChange('city_id', newValue ? newValue.value : null)
        }
        renderInput={(params) => <TextField placeholder={t('select_city')} {...params} />}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.value}
              label={option.label}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </Stack>
  );

  const renderGear = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('gear_type')}
      </Typography>

      <Select
        value={filters.gear || ''}
        onChange={(e) => handleFilterChange('gear', e.target.value)}
      >
        {gearLoading ? (
          <MenuItem disabled>{t('loading_gears')}</MenuItem>
        ) : (
          gearData?.map((gear: any) => (
            <MenuItem key={gear.id} value={gear.name}>
              {gear.name}
            </MenuItem>
          ))
        )}
      </Select>
    </Stack>
  );
  const renderSchool = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t('school')}
      </Typography>

      <Autocomplete
        options={
          vendorList?.map((item: any) => ({
            label: item.vendor_translations
              .slice(0, 2)
              .map((translation: any) => translation.name)
              .join(' - '),
            value: item.id,
          })) ?? []
        }
        getOptionLabel={(option) => option.label}
        value={!filters.vendor_id || filters.vendor_id === undefined ? '' : filters.vendor_id}
        onChange={(event, newValue) => handleFilterChange('vendor_id', newValue)}
        renderInput={(params) => <TextField placeholder="Select School" {...params} />}
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
        {t('filters')}{' '}
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

            {renderCategory}
            {renderCity}
            {renderGear}
            {renderSchool}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
