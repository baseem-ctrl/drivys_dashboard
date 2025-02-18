import { Grid, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { ILanguageItem } from 'src/types/language';
// components
import { useSnackbar } from 'src/components/snackbar';
import { updateValue } from 'src/api/app-settings';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState, useMemo } from 'react';

// ----------------------------------------------------------------------

type Props = {
  row: ILanguageItem;
  reload: VoidFunction;
};

export default function AppSettingForm({ row, reload }: Props) {
  const { key, value, id } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();

  const [editingRowId, setEditingRowId] = useState<boolean | null>(null);

  const NewSchema = Yup.object().shape({
    value: Yup.mixed().test('valid-value', 'Only "true" or "false" are allowed.', (value) => {
      if (key === 'STRIPE_ENABLED' || key === 'CASH_ENABLED') {
        return value === 'true' || value === 'false'; // Only allow string "true" or "false"
      }
      return true; // Skip validation for other fields
    }),
    value2: Yup.string().required('Second field is required'), // Example validation for value2
  });

  const defaultValues = useMemo(
    () => ({
      value: value,
      value2: '', // Add value2 with an initial empty string or default value
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
  const { enqueueSnackbar } = useSnackbar();
  const values = watch();

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
      setEditingRowId(false); // Set to false instead of null
      reload();
      reset();
    }
  });
  console.log('row', row);
  return (
    <Grid
      container
      spacing={2}
      sx={{ display: 'flex', flexWrap: 'wrap', maxWidth: '100%', padding: 2 }}
    >
      {Object.entries(row)
        .filter(([key]) => key.startsWith('value'))
        .map(([key, fieldValue]) => (
          <Grid item xs={12} sm={6} md={4} key={key} sx={{ flexGrow: 1 }}>
            <Controller
              name={key}
              control={control}
              defaultValue={fieldValue}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label={row.key}
                  {...field}
                  error={Boolean(errors[key])}
                  helperText={errors[key] ? errors[key].message : ''}
                  placeholder="Enter value"
                />
              )}
            />
          </Grid>
        ))}
    </Grid>
  );
}
