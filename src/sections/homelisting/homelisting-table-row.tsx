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
import { Avatar, Link, ListItemText, Select, TextField, Typography } from '@mui/material';
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
import HomeSliderDialog from '../home-slider/home-slider-dialog';
import HomeListingDialog from './home-listing-dailogue';
import { useTranslation } from 'react-i18next';

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

const catalogueOptions = [
  { label: 'SLIDER', value: '1' },
  { label: 'CATEGORY', value: '2' },
  { label: 'TRAINER', value: '3' },
];

const displayTypeOptions = [
  { label: 'SLIDER', value: '1' },
  { label: 'HORIZONTAL_SCROLL', value: '2' },
  { label: 'VERTICAL_SCROLL', value: '3' },
  { label: 'LIST', value: '4' },
  { label: 'GRID', value: '5' },
];
export default function HomeListingTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  revalidateHomeListing,
  onViewRow,
}: Props) {
  const { t, i18n } = useTranslation();
  const { translations, catalogue_type, display_order, is_active, id, title, display_type } = row;
  const { language } = useGetAllLanguage(0, 1000);
  const [editingRowId, setEditingRowId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language ?? '');
  const [selectedCatalogue, setSelectedCatalogue] = useState(catalogueOptions[0]?.value ?? '');
  const [selectedDisplayType, setSelectedDisplayType] = useState(
    displayTypeOptions[0]?.value ?? ''
  );
  const [localeOptions, setLocaleOptions] = useState([]);

  const confirm = useBoolean();
  const handleEditClick = () => {
    setEditingRowId(row.id);
  };
  const popover = usePopover();

  const selectedLocaleObject = translations?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );
  const NewSchema = Yup.object().shape({
    title: Yup.string(),
    is_active: Yup.boolean(),
    catalogue_type: Yup.string(),
    display_order: Yup.string(),
    display_type: Yup.string(),
  });
  const defaultValues = useMemo(
    () => ({
      title: title || '',
      display_order: display_order || '',
      display_type: display_type || '',
      is_active: is_active || 1,
      catalogue_type: catalogue_type || '',
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
      setValue('title', selectedLocaleObject?.title); // Update name to match the locale
      setValue('description', selectedLocaleObject?.description); // Update name to match the description
    } else {
      setValue('title', '');
      setValue('description', '');
    }
  };

  const handleChangeCatalogue = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedCatalogue(event.target.value);
  };
  const handleChangeDisplayType = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedDisplayType(event.target.value);
  };
  const onSubmit = handleSubmit(async (data) => {
    try {
      const body = new FormData();
      // body.append('translation[0][locale]', selectedLanguage || translations?.locale);
      body.append('title', data?.title || title);
      // body.append('translation[0][description]', data?.description || translations?.description);
      body.append('display_order', data?.display_order || display_order);
      body.append('display_type', data?.display_type || display_type);
      body.append('catalogue_type', data?.catalogue_type || catalogue_type || selectedCatalogue);
      body.append('is_active', data?.is_active ? '1' : '0');
      body.append('home_listing_id', id ?? row?.id);

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
      <TableRow
        hover
        selected={selected}
        hover
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
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.translations.find(
            (t: any) => t.locale?.toLowerCase() === i18n.language.toLowerCase()
          )?.title ||
            row.translations[0]?.title ||
            t('n/a')}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.catalogue_type || t('n/a')}</TableCell>

        {/* <TableCell>
          <Avatar alt={row.name} src={row?.sliders?.virtual_path} sx={{ mr: 2 }} />
        </TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.display_type || t('n/a')}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{display_order || t('n/a')}</TableCell>
        <TableCell>
          <Label variant="soft" color={is_active === 1 ? 'success' : 'error'}>
            {is_active === 1 ? t('Active') : t('Not Active')}
          </Label>
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
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
        </TableCell>
      </TableRow>
      <HomeListingDialog
        open={editingRowId !== null}
        onClose={() => setEditingRowId(null)}
        // title={t('Update Home Slider')}
        updateValue={row}
        onReload={revalidateHomeListing}
      />
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
