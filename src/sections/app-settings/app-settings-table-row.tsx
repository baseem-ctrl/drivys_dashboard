// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { ILanguageItem } from 'src/types/language';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import LanguageCreateEditForm from './app-settings-update';
import { deleteLanguage } from 'src/api/language';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextField } from '@mui/material';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { updateValue } from 'src/api/app-settings';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  row: ILanguageItem;
  reload: VoidFunction;
};

export default function AppSettingTableRow({ row, reload }: Props) {
  const { key, value, id } = row;
  const { t } = useTranslation();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();
  const [editingRowId, setEditingRowId] = useState(null);
  const handleEditClick = () => {
    setEditingRowId(row.id);
  };
  const NewSchema = Yup.object().shape({
    value: Yup.mixed().test('valid-value', 'Only "true" or "false" are allowed.', (value) => {
      if (key === 'STRIPE_ENABLED' || key === 'CASH_ENABLED') {
        return value === 'true' || value === 'false'; // Only allow string "true" or "false"
      }
      return true; // Skip validation for other fields
    }),
  });
  const defaultValues = useMemo(
    () => ({
      value: value,
    }),
    [row]
  );
  const methods = useForm({
    resolver: yupResolver(NewSchema) as any,
    defaultValues,
  });
  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    control,
  } = methods;
  const values = watch();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (editingRowId !== null) {
      reset(defaultValues);
    }
  }, [editingRowId]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const body = {
        key: row?.key,
        value: data?.value,
        id: row?.id,
      };
      const response = await updateValue(body);
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
      reload();
      reset();
    }
  });
  return (
    <>
      <TableRow hover>
        <TableCell>{key}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {editingRowId === row.id ? (
            <Controller
              className="editor"
              name="value"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={Boolean(errors.value)}
                  helperText={
                    errors.value
                      ? errors.value.message
                      : key === 'STRIPE_ENABLED' || key === 'CASH_ENABLED'
                      ? 'Only "true" or "false" are allowed.'
                      : ''
                  }
                  placeholder={
                    key === 'STRIPE_ENABLED' || key === 'CASH_ENABLED'
                      ? 'Enter "true" or "false"'
                      : 'Enter value'
                  }
                />
              )}
            />
          ) : (
            String(value) || t('n/a')
          )}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {editingRowId !== null ? (
            <>
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
              <LoadingButton
                className="save-button"
                sx={{ color: '#CF5A0D', borderColor: '#CF5A0D', marginLeft: '10px' }}
                type="submit"
                variant="outlined"
                onClick={() => setEditingRowId(null)}
              >
                {'Cancel'}
              </LoadingButton>
            </>
          ) : (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={handleEditClick}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    </>
  );
}
