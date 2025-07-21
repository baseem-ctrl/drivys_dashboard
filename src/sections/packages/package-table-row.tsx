// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import SchoolQuickEditForm from './package-quick-edit-form';
import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, InputAdornment, ListItemText, Select, TextField } from '@mui/material';
import { useGetAllLanguage } from 'src/api/language';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createSchool, useGetSchool, useGetSchoolAdmin } from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { createUpdatePackage } from 'src/api/package';
import { useGetAllCategory } from 'src/api/category';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: any;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  revalidatePackage: VoidFunction;
  onViewRow: VoidFunction;
  schoolList?: any;
};

export default function PackageTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  revalidatePackage,
  onViewRow,
  schoolList,
}: Props) {
  const {
    package_translations,
    email,
    phone_number,
    status,
    is_published,
    vendor,
    vendor_user,
    number_of_sessions,
    category_id,
    drivys_commision,
    vendor_id,
  } = row;
  const { t, i18n } = useTranslation();
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);
  const { category } = useGetAllCategory({
    limit: 1000,
    page: 1,
    published: 1,
    locale: i18n.language,
  });
  const [editingRowId, setEditingRowId] = useState(null);
  const matchedLocale = package_translations?.find(
    (t) => t.locale.toLowerCase() === i18n.language.toLowerCase()
  )?.locale;

  const [selectedLanguage, setSelectedLanguage] = useState(
    matchedLocale ?? package_translations?.[0]?.locale ?? i18n.language
  );
  const [localeOptions, setLocaleOptions] = useState([]);

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const handleEditClick = () => {
    setEditingRowId(row.id);
    // setEditedData({ ...row });
  };
  const popover = usePopover();
  useEffect(() => {
    if ((language && language?.length > 0) || package_translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item.language_culture,
          value: item.language_culture,
        }));
      }
      const newLocales = package_translations
        ?.map((category: any) => category.locale)
        .filter(
          (locale: any) => !initialLocaleOptions?.some((option: any) => option.value === locale)
        )
        .map((locale: any) => ({ label: locale, value: locale }));
      setLocaleOptions([...initialLocaleOptions, ...newLocales]);
    }
  }, [language, package_translations, selectedLanguage]);

  const selectedLocaleObject = package_translations.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );
  const NewSchema = Yup.object().shape({
    name: Yup.string(),
    locale: Yup.mixed(),
    is_published: Yup.boolean(),
    vendor_id: Yup.string(),
    number_of_sessions: Yup.number().test(
      'is-even',
      'Number of sessions must be an even number',
      function (value) {
        // If the value is defined, check if it's even
        if (value === -1) {
          return true;
        }
        if (value !== undefined && value !== null) {
          return value % 2 === 0;
        }
        // If value is undefined or null, the validation passes
        return true;
      }
    ),
    category_id: Yup.string(),
    drivys_commision: Yup.string(),
  });
  const defaultValues = useMemo(
    () => ({
      name: selectedLocaleObject?.name || '',
      locale: selectedLocaleObject?.locale || '',
      // session_inclusions: selectedLocaleObject?.session_inclusions || '',
      is_published: String(is_published) || 1,
      vendor_id: vendor_id || '',
      number_of_sessions: number_of_sessions || 0,
      category_id: category_id || '',
      drivys_commision: drivys_commision || drivys_commision === 0 ? drivys_commision : '',
    }),
    [selectedLocaleObject, row, editingRowId]
  );
  const methods = useForm({
    resolver: yupResolver(NewSchema) as any,
    defaultValues,
  });
  const { watch, reset, handleSubmit, formState, setValue, control } = methods;
  const values = watch();
  const { isSubmitting, errors } = formState;
  const handleToggle = () => {
    setValue('is_percentage', !values?.is_percentage);
  };
  const { enqueueSnackbar } = useSnackbar();
  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedLanguage(event.target.value);
    const selectedLocaleObject = package_translations.find(
      (item: { locale: string }) => item.locale === event.target.value
    );

    // Update the form values to reflect the selected locale
    if (selectedLocaleObject) {
      setValue('name', selectedLocaleObject.name); // Update name to match the locale
    } else {
      setValue('name', '');
    }
  };
  useEffect(() => {
    if (editingRowId !== null) {
      reset(defaultValues);
    }
  }, [editingRowId]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      let payload = {
        package_translation: [
          {
            name: data?.name || package_translations?.name,
            locale: selectedLanguage || package_translations?.locale,
            session_inclusions:
              selectedLocaleObject?.session_inclusions ||
              package_translations[0]?.session_inclusions,
          },
        ],
        vendor_id: [data?.vendor_id || vendor?.vendor_user?.vendor_id],
        is_published: data?.is_published ? '1' : '0',
        number_of_sessions: data?.number_of_sessions || number_of_sessions,
        category_id: data?.category_id,
        drivys_commision: data?.drivys_commision || drivys_commision,
        package_id: row?.id,
      };
      const response = await createUpdatePackage(payload);
      if (response) {
        enqueueSnackbar('Package translations updated successfully.', {
          variant: 'success',
        });
      }
    } catch (error) {
      if (error?.errors) {
        if (typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
          Object.values(error?.errors).forEach((errorMessage) => {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          });
        } else {
          enqueueSnackbar(error.errors, { variant: 'error' });
        }
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setEditingRowId(null);
      revalidatePackage();
    }
  });
  const router = useRouter();

  return (
    <>
      <TableRow
        hover
        selected={selected}
        onClick={(event) => {
          // Prevent navigation if the target is the three dots icon, save button, or if editing
          if (
            editingRowId === row.id || // Prevent navigation if editing the current row
            event.target.closest('.three-dot-icon') ||
            event.target.closest('.save-button') ||
            event.target.closest('.editor')
          ) {
            event.stopPropagation(); // Stop the event from bubbling up
            // popover.onOpen(event); // Open your popover here
          } else {
            onViewRow(); // Navigate to the details page
          }
        }}
      >
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="locale"
              control={control}
              render={({ field }) => (
                <Select {...field} value={selectedLanguage || ''} onChange={handleChange}>
                  {localeOptions?.map((option: any) => (
                    <MenuItem key={option?.value} value={option?.value}>
                      {option?.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          ) : (
            selectedLanguage || t('n/a')
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.name}
                  helperText={errors.name ? errors.name.message : ''}
                />
              )}
            />
          ) : (
            selectedLocaleObject?.name || t('n/a')
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {' '}
          {editingRowId === row.id ? (
            <Controller
              name="number_of_sessions"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.number_of_sessions}
                  helperText={errors.number_of_sessions ? errors.number_of_sessions.message : ''}
                  type="number"
                />
              )}
            />
          ) : (
            number_of_sessions || t('n/a')
          )}
        </TableCell>

        <TableCell>
          {editingRowId === row.id ? (
            <Controller
              name="is_published"
              control={control}
              render={({ field }) => (
                <Select {...field} value={field?.value || ''}>
                  {/* {localeOptions.map((option: any) => ( */}
                  <MenuItem key={'1'} value={'1'}>
                    Published
                  </MenuItem>
                  <MenuItem key={'0'} value={'0'}>
                    Un Published
                  </MenuItem>{' '}
                  {/* ))} */}
                </Select>
              )}
            />
          ) : (
            <Label
              variant="soft"
              color={
                (is_published === 1 && 'success') || (is_published === 0 && 'error') || 'default'
              }
            >
              {is_published === 0 ? t('Un Published') : t('Published')}
            </Label>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="vendor_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={schoolList.find((item) => item.id === field?.value) || null}
                  options={schoolList}
                  getOptionLabel={(option) =>
                    option?.vendor_translations?.find(
                      (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ||
                    option?.vendor_translations?.[0]?.name ||
                    'Unknown'
                  }
                  onChange={(event, newValue) => {
                    field.onChange(newValue?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('Select School')}
                      placeholder="Search School..."
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              )}
            />
          ) : (
            <ListItemText
              primary={
                vendor?.vendor_translations?.find(
                  (item) => item?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                )?.name ??
                vendor?.vendor_translations?.[0]?.name ??
                t('n/a')
              }
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
              }}
            />
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span className="dirham-symbol">&#x00EA;</span>
            {editingRowId === row.id ? (
              <Controller
                name="drivys_commision"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.email}
                    type={values?.is_percentage ? 'number' : 'text'}
                    inputProps={{ min: 0 }}
                    value={field.value || field.value === 0 ? field.value : ''}
                    helperText={errors.email ? errors.email.message : ''}
                    size="small" // optional: to better fit in a table row
                  />
                )}
              />
            ) : drivys_commision || drivys_commision === 0 ? (
              drivys_commision
            ) : (
              t('n/a')
            )}
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="category_id" // Ensure this matches your form state
              control={control}
              defaultValue={row.category_id} // Set the default value to the current category id
              render={({ field }) => (
                <Select {...field} value={field.value || ''}>
                  {category.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.category_translations.find(
                        (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                      )?.name ||
                        cat.category_translations[0]?.name ||
                        t('n/a')}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          ) : (
            <ListItemText
              primary={(() => {
                const selectedCategory = category?.find((cat) => cat.id === row.category_id);
                return selectedCategory
                  ? selectedCategory.category_translations.find(
                      (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
                    )?.name ||
                      selectedCategory.category_translations[0]?.name ||
                      t('n/a')
                  : t('n/a');
              })()}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
              }}
            />
          )}
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {editingRowId !== null ? (
            <LoadingButton
              sx={{ color: '#CF5A0D', borderColor: '#CF5A0D' }}
              type="submit"
              variant="outlined"
              loading={isSubmitting}
              onClick={onSubmit}
            >
              {t('Save')}
            </LoadingButton>
          ) : (
            // <Button
            //   onClick={onSubmit}
            //   variant="outlined"
            //   sx={{ color: '#CF5A0D', borderColor: '#CF5A0D' }}
            // >
            //   Save
            // </Button>

            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              className="three-dot-icon"
              onClick={(event) => {
                event.stopPropagation();
                popover.onOpen(event);
              }}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      {/* <SchoolQuickEditForm
        currentDelivery={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        revalidateDeliverey={revalidateDeliverey}
      /> */}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('Delete')}
        content={t('Are you sure want to delete?')}
        onConfirm={() => {
          confirm.onFalse();
          onDeleteRow();
        }}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('Delete')}
          </Button>
        }
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.package.details(row?.id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          {t('View')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            handleEditClick();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('Edit')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            confirm.onTrue();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('Delete')}
        </MenuItem>
      </CustomPopover>
    </>
  );
}
