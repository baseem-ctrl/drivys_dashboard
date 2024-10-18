// @mui
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
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
import { useEffect, useMemo, useState } from 'react';
import { Link, ListItemText, Select, TextField } from '@mui/material';
import { useGetAllLanguage } from 'src/api/language';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { createHomeListing } from 'src/api/homelisting';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: any;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  revalidateHomeListing: VoidFunction;
  onViewRow: VoidFunction;
};

const catalogueOptions = [{ label: "Drivers", value: "1" }, { label: "Categories", value: "2" }]

export default function SchoolTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  revalidateHomeListing,
  onViewRow,
}: Props) {
  const {
    translations,
    catalogue_type,
    display_order,
    is_active,
    id,
  } = row;
  const { language } =
    useGetAllLanguage(0, 1000);
  const [editingRowId, setEditingRowId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(translations?.[0]?.locale ?? '');
  const [selectedCatalogue, setSelectedCatalogue] = useState(catalogueOptions[0]?.value ?? '');

  const [localeOptions, setLocaleOptions] = useState([]);

  const confirm = useBoolean();
  const handleEditClick = () => {

    setEditingRowId(row.id);
  };
  const popover = usePopover();
  useEffect(() => {
    if ((language && language?.length > 0) || translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item.language_culture,
          value: item.language_culture,
        }));
      }
      const newLocales = translations
        ?.map((category: any) => category.locale)
        .filter(
          (locale: any) => !initialLocaleOptions?.some((option: any) => option.value === locale)
        )
        .map((locale: any) => ({ label: locale, value: locale }));
      setLocaleOptions([...initialLocaleOptions, ...newLocales]);
    }
  }, [language, translations, selectedLanguage]);

  const selectedLocaleObject = translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );
  const NewSchema = Yup.object().shape({
    title: Yup.string(),
    locale: Yup.mixed(),
    description: Yup.string(),
    is_active: Yup.boolean(),
    catalogue_type: Yup.string(),
    display_order: Yup.string(),
  });
  const defaultValues = useMemo(
    () => ({
      title: selectedLocaleObject?.title || '',
      locale: selectedLocaleObject?.locale || '',
      description: selectedLocaleObject?.description || '',
      display_order: display_order || '',
      is_active: is_active || 1,
      catalogue_type: catalogue_type || ''
    }),
    [selectedLocaleObject, row]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema) as any,
    defaultValues,
  });
  const { watch, reset, handleSubmit, formState, setValue, control } = methods;
  const { isSubmitting, errors } = formState;
  const { enqueueSnackbar } = useSnackbar();
  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedLanguage(event.target.value);
    const selectedLocaleObject = translations.find(
      (item: { locale: string }) => item.locale === event.target.value
    );

    // Update the form values to reflect the selected locale
    if (selectedLocaleObject) {
      setValue('title', selectedLocaleObject.name); // Update name to match the locale
    } else {
      setValue('title', '');
    }
  };
  const handleChangeCatalogue = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedCatalogue(event.target.value);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const body = new FormData()
      body.append("translation[0][locale]", selectedLanguage || translations?.locale)
      body.append("translation[0][title]", data?.title || translations?.title)
      body.append("translation[0][description]", data?.description || translations?.description)
      body.append("display_order", data?.display_order || display_order)
      body.append("catalogue_type", data?.catalogue_type || catalogue_type)
      body.append("is_active", data?.is_active ? '1' : '0')
      body.append("home_page_listing_id", selectedLocaleObject?.home_page_listing_id ?? row?.id)

      const response = await createHomeListing(body);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
      }
    } catch (error) {
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setEditingRowId(null);
      revalidateHomeListing();
    }
  });
  const router = useRouter();
  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}
        <TableCell>{id}</TableCell>


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
            selectedLanguage
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.title}
                  helperText={errors.title ? errors.title.message : ''}
                />
              )}
            />
          ) : (
            <Link color="inherit" sx={{ cursor: 'pointer' }} onClick={onViewRow}>
              {selectedLocaleObject?.title ?? 'N/A'}
            </Link>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.description}
                  helperText={errors?.description ? errors?.description?.message : ''}
                />
              )}
            />
          ) : (
            <Link color="inherit" sx={{ cursor: 'pointer' }} onClick={onViewRow}>
              {selectedLocaleObject?.description ?? 'N/A'}
            </Link>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              name="catalogue_type"
              control={control}
              render={({ field }) => (
                <Select {...field} value={selectedCatalogue || ''} onChange={handleChangeCatalogue}>
                  {catalogueOptions?.map((option: any) => (
                    <MenuItem key={option?.value} value={option?.value}>
                      {option?.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />

          ) : (
            catalogue_type === "2" ? "Drivers" : "Categories" || 'N/A'
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {' '}
          {editingRowId === row.id ? (
            <Controller
              name="display_order"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors?.display_order}
                  helperText={errors?.display_order ? errors?.display_order?.message : ''}
                  type="number"
                />
              )}
            />
          ) : (
            display_order || 'N/A'
          )}
        </TableCell>


        <TableCell>
          {editingRowId === row.id ? (
            <Controller
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
                (is_active === '1' && 'success') || (is_active === '0' && 'error') || 'default'
              }
            >
              {is_active === '0' ? 'In Active' : 'Active'}
            </Label>
          )}
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {editingRowId !== null ? (
            <LoadingButton
              sx={{ color: '#CF5A0D', borderColor: '#CF5A0D' }}
              type="submit"
              variant="outlined"
              loading={isSubmitting}
              onClick={onSubmit}
            >
              {'Save'}
            </LoadingButton>
          ) : (


            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

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
            router.push(paths.dashboard.homelisting.details(row?.id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            handleEditClick();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

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
      </CustomPopover>
    </>
  );
}
