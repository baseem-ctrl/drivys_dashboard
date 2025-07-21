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
import SchoolQuickEditForm from './school-quick-edit-form';
import { useEffect, useMemo, useState } from 'react';
import { Link, ListItemText, Select, TextField, Typography } from '@mui/material';
import { useGetAllLanguage } from 'src/api/language';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createSchool, useGetAllSchoolAdmin, useGetSchoolAdmin } from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: any;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  revalidateSchool: VoidFunction;
  onViewRow: VoidFunction;
  setBulkEditIds?: any;
  isBulkEdit?: any;
  setIsBulkEdit?: any;
  selectedRows?: any;
};

export default function SchoolTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  revalidateSchool,
  onViewRow,
  setBulkEditIds,
  isBulkEdit,
  selectedRows,
}: Props) {
  const { t, i18n } = useTranslation();
  const {
    vendor_translations,
    email,
    phone_number,
    status,
    is_active,
    vendor_user,
    certificate_commission_in_percentage,
    id,
  } = row;
  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);
  const { schoolAdminList, schoolAdminLoading } = useGetAllSchoolAdmin(1000, 1, i18n.language);

  const currentVendorName = vendor_user?.user?.name;

  const schoolAdmins = {
    currentAdmin: currentVendorName,
    admins: [
      {
        id: vendor_user?.user?.id,
        name: currentVendorName,
        email: vendor_user?.user?.email,
        user_type: 'SCHOOL_ADMIN',
        country_code: vendor_user?.user?.country_code ?? '',
        phone: vendor_user?.user?.phone ?? '',
        photo_url: null,
        dob: vendor_user?.user?.dob ?? '',
        is_active: true,
        wallet_balance: 0,
        wallet_points: 0,
        locale: 'en',
        gender: 'Not Specified',
        languages: [],
        user_preference: {
          id: vendor_user?.user?.preference?.id ?? '',
          user_id: vendor_user?.user?.id,
          gear: 'Unknown',
          gender: 'Not Specified',
          vehicle_type_id: null,
          vehicle_type: null,
          city_id: null,
          city: null,
        },
        user_docs: [],
      },
      ...schoolAdminList,
    ],
  };

  const [editingRowId, setEditingRowId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language ?? '');
  const [localeOptions, setLocaleOptions] = useState([]);

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const handleEditClick = () => {
    setEditingRowId(row.id);
    // setEditedData({ ...row });
  };
  const popover = usePopover();
  useEffect(() => {
    if ((language && language?.length > 0) || vendor_translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item.language_culture,
          value: item.language_culture,
        }));
      }
      const newLocales = vendor_translations
        ?.map((category: any) => category.locale)
        .filter(
          (locale: any) => !initialLocaleOptions?.some((option: any) => option.value === locale)
        )
        .map((locale: any) => ({ label: locale, value: locale }));
      setLocaleOptions([...initialLocaleOptions, ...newLocales]);
    }
  }, [language, vendor_translations, selectedLanguage]);

  const selectedLocaleObject = vendor_translations.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );
  const NewSchema = Yup.object().shape({
    name: Yup.string(),
    locale: Yup.mixed(),
    email: Yup.string().test(
      'valid-email-format',
      'Email must be in the valid format',
      function (value) {
        // Only check format if value is present
        if (value) {
          const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
          return emailRegex.test(value);
        }
        return true; // Skip format check if value is empty
      }
    ),
    phone_number: Yup.string(),
    status: Yup.mixed().nullable(),
    is_active: Yup.boolean(),
    user_id: Yup.string(),
    certificate_commission_in_percentage: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      name: selectedLocaleObject?.name || '',
      locale: selectedLocaleObject?.locale || '',
      email: email || '',
      phone_number: phone_number || '',
      status: status,
      is_active: is_active == true ? '1' : '0' || '1',
      user_id: vendor_user?.user?.id || '',
      certificate_commission_in_percentage: certificate_commission_in_percentage || 0,
    }),
    [selectedLocaleObject, row]
  );
  const methods = useForm({
    resolver: yupResolver(NewSchema) as any,
    defaultValues,
  });
  const { watch, reset, handleSubmit, formState, setValue, control } = methods;
  const values = watch();
  const { isSubmitting, errors } = formState;
  const { enqueueSnackbar } = useSnackbar();
  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedLanguage(event.target.value);
    const selectedLocaleObject = vendor_translations.find(
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
        vendor_translations: [
          {
            name: data?.name || vendor_translations?.name,
            locale: selectedLanguage || vendor_translations?.locale,
          },
        ],
        contact_email: data?.email || email,
        contact_phone_number: data?.phone_number || phone_number,
        status: data?.status || status,
        user_id:
          data?.user_id !== undefined
            ? data.user_id
            : vendor_user?.user !== null
            ? vendor_user.user_id
            : '',
        is_active: data?.is_active ? 1 : 0,
        certificate_commission_in_percentage: data?.certificate_commission_in_percentage || 0,
        create_new_user: 0,
        vendor_id: row?.id,
      };

      const response = await createSchool(payload);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setEditingRowId(null);
      revalidateSchool();
    }
  });
  const router = useRouter();
  //Bulk Select Row
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsChecked(checked);

    setBulkEditIds((prev) => (checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)));
  };
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
            event.target.closest('.editor') ||
            event.target.closest('.checkbox')
          ) {
            event.stopPropagation(); // Stop the event from bubbling up
            // popover.onOpen(event); // Open your popover here
          } else {
            onViewRow(); // Navigate to the details page
          }
        }}
      >
        <TableCell padding="checkbox" className="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            onChange={(e) => handleCheckboxChange(e)}
            inputProps={{ 'aria-label': 'select row' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="locale"
              className="editor"
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
            <>
              {row.vendor_translations?.find(
                (t: any) => t.locale?.toLowerCase() === i18n.language.toLowerCase()
              )?.locale ||
                row.vendor_translations[0]?.locale ||
                t('n/a')}
            </>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              className="editor"
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
            <Link color="inherit" sx={{ cursor: 'pointer' }} onClick={onViewRow}>
              {row.vendor_translations?.find(
                (t: any) => t.locale?.toLowerCase() === i18n.language.toLowerCase()
              )?.name ||
                row.vendor_translations[0]?.name ||
                t('n/a')}
            </Link>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              className="editor"
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ''}
                  type="email"
                />
              )}
            />
          ) : (
            email || t('n/a')
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {' '}
          {editingRowId === row.id ? (
            <Controller
              className="editor"
              name="phone_number"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors?.phone_number}
                  helperText={errors?.phone_number ? errors?.phone_number?.message : ''}
                  type="number"
                  prefix="0"
                />
              )}
            />
          ) : (
            phone_number || t('n/a')
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {' '}
          {editingRowId === row.id ? (
            <Controller
              className="editor"
              name="certificate_commission_in_percentage"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.certificate_commission_in_percentage}
                  helperText={
                    errors?.certificate_commission_in_percentage
                      ? errors?.certificate_commission_in_percentage?.message
                      : ''
                  }
                  type="number"
                />
              )}
            />
          ) : (
            certificate_commission_in_percentage || t('n/a')
          )}
        </TableCell>

        <TableCell>
          {editingRowId === row.id ? (
            <Controller
              className="editor"
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} value={field?.value || ''}>
                  {/* {localeOptions.map((option: any) => ( */}
                  <MenuItem key={'active'} value={'active'}>
                    Active
                  </MenuItem>
                  <MenuItem key={'suspended'} value={'suspended'}>
                    Suspended
                  </MenuItem>{' '}
                  <MenuItem key={'expired'} value={'expired'}>
                    Expired
                  </MenuItem>{' '}
                  <MenuItem key={'cancelled'} value={'cancelled'}>
                    Cancelled
                  </MenuItem>
                  <MenuItem key={'pending_for_verification'} value={'pending_for_verification'}>
                    Pending for verification
                  </MenuItem>
                  {/* ))} */}
                </Select>
              )}
            />
          ) : status ? (
            <Label variant="outlined" color={'default'}>
              {status}
            </Label>
          ) : (
            t('n/a')
          )}
        </TableCell>
        <TableCell>
          {editingRowId === row.id ? (
            <Controller
              className="editor"
              name="is_active"
              control={control}
              render={({ field }) => (
                <Select {...field} value={field?.value || ''}>
                  {/* {localeOptions.map((option: any) => ( */}
                  <MenuItem key={'1'} value={'1'}>
                    Active
                  </MenuItem>
                  <MenuItem key={'0'} value={'0'}>
                    In Active
                  </MenuItem>{' '}
                  {/* ))} */}
                </Select>
              )}
            />
          ) : (
            <Label
              variant="soft"
              color={
                (is_active === true && 'success') || (is_active === false && 'error') || 'default'
              }
            >
              {!is_active ? t('In Active') : t('Active')}
            </Label>
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              className="editor"
              name="user_id"
              control={control}
              render={({ field }) => {
                const selectedValue = schoolAdmins.admins.some((admin) => admin.id === field.value)
                  ? field.value
                  : '';

                return (
                  <Select {...field} value={selectedValue} displayEmpty>
                    <MenuItem value="" disabled>
                      {t('Select School Owner')}
                    </MenuItem>

                    {schoolAdmins.admins.length === 0 ? (
                      <MenuItem disabled>{t('No users available')}</MenuItem>
                    ) : (
                      schoolAdmins.admins.map((option: any) => (
                        <MenuItem
                          key={option.id}
                          value={option.id}
                          disabled={option.id === vendor_user?.user?.id} // Disable the current admin
                        >
                          {option.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                );
              }}
            />
          ) : (
            <ListItemText
              primary={vendor_user?.user?.name ?? t('n/a')}
              secondary={vendor_user?.user?.email ?? t('n/a')}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
              }}
            />
          )}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {editingRowId !== null ? (
            <LoadingButton
              className="save-button"
              sx={{ color: '#CF5A0D', borderColor: '#CF5A0D' }}
              type="submit"
              variant="outlined"
              loading={isSubmitting}
              onClick={onSubmit}
            >
              {'Save'}
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
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={() => {
          confirm.onFalse();
          onDeleteRow();
        }}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
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
            router.push(paths.dashboard.school.details(row?.id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          {t('View')}
        </MenuItem>

        {!row?.is_default && (
          <MenuItem
            onClick={() => {
              popover.onClose();
              handleEditClick();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        )}

        {!row?.is_default && (
          <MenuItem
            onClick={() => {
              popover.onClose();
              confirm.onTrue();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        )}
      </CustomPopover>
    </>
  );
}
