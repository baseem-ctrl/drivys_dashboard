// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import FormProvider from 'src/components/hook-form/form-provider';
import LoadingButton from '@mui/lab/LoadingButton';
import { Controller } from 'react-hook-form';
import { FormControlLabel, Switch, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// types
import { IJobItem } from 'src/types/job';

// components
import { useBoolean } from 'src/hooks/use-boolean';
import { SetStateAction, useState } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import Select from '@mui/material/Select';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetAllLanguage } from 'src/api/language';
import { createOrUpdateLoyaltyProgram, deleteLoyaltyProgramById } from 'src/api/loyality';
import { paths } from 'src/routes/paths';
// ----------------------------------------------------------------------

type Props = {
  category: IJobItem;
  onView: VoidFunction;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
  reload: any;
  setTableData: any;
  setAddOnlyOneCategory: any;
  parentCategoryValues: any;
  searchCategory: any;
  setSearchValue: any;
};

export default function LoyalityProgramItem({
  category,

  reload,
  setTableData,
  setAddOnlyOneCategory,
  parentCategoryValues,
  searchCategory,
  setSearchValue,
}: Props) {
  const deletecustomer = useBoolean();

  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);

  const [localeOptions, setLocaleOptions] = useState([]);

  //To set english as the 1st display language if present or the first available lang
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const translations = category?.trainer_reward_translation || [];
    return translations?.find((trans) => trans.locale.toLowerCase() === 'en')?.locale;
  });

  const isCreateCategory = category?.newCategory;

  useEffect(() => {
    if ((language && language?.length > 0) || category?.category_translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item.language_culture,
          value: item.language_culture,
        }));
      }

      // Ensure newLocales is an array
      const newLocales = Array.isArray(category?.trainer_reward_translation)
        ? category?.trainer_reward_translation
            ?.map((category: any) => category.locale)
            ?.filter(
              (locale: any) => !initialLocaleOptions?.some((option: any) => option.value === locale)
            )
            ?.map((locale: any) => ({ label: locale, value: locale }))
        : [];

      setLocaleOptions([...initialLocaleOptions, ...newLocales]);
    }
  }, [language, category]);

  // Handle change event
  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedLanguage(event.target.value);
  };

  const selectedLocaleObject = category?.trainer_reward_translation?.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );

  const handleDeleteLoyalityProgramById = async () => {
    try {
      const response = await deleteLoyaltyProgramById(category?.id);
      reload();
      enqueueSnackbar(response?.message);
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const NewSchema = Yup.object().shape({
    name: Yup.string(),
    locale: Yup.mixed(),
    parent_id: Yup.mixed().nullable(),
  });
  const periodOptions = [
    { value: '', label: 'Select Period', disabled: true },
    { value: 0, label: 'WEEKLY', disabled: false },
    { value: 1, label: 'MONTHLY', disabled: false },
    { value: 2, label: 'YEARLY', disabled: false },
  ];
  const periodMap = {
    WEEKLY: 0,
    MONTHLY: 1,
    YEARLY: 2,
  };
  const defaultValues = useMemo(
    () => ({
      name: selectedLocaleObject?.name || '',
      locale: selectedLocaleObject?.locale || '',
      no_of_sessions_required: category?.no_of_sessions_required || '',
      reward_amount: category?.reward_amount || '',

      start_date: category?.start_date ? category.start_date : null,
      end_date: category?.end_date ? category.end_date : null,
      is_periodic: category?.is_periodic || 0,
      period: periodMap[category?.period] ?? '',
    }),
    [selectedLocaleObject?.name, selectedLocaleObject?.locale, category]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema) as any,
    defaultValues,
  });
  const { reset, handleSubmit, formState, setValue, watch } = methods;
  const { isSubmitting } = formState;
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (!isCreateCategory) {
      reset(defaultValues);
    }
  }, [selectedLocaleObject?.name, defaultValues, reset, selectedLanguage]);

  useEffect(() => {
    // if (isCreateCategory) {
    searchCategory('');
    // }
  }, [isCreateCategory]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let payload = {
        translation: [
          {
            name: data?.name,
            locale: selectedLanguage,
          },
        ],
        no_of_sessions_required:
          data?.no_of_sessions_required || category?.no_of_sessions_required || '',
        is_periodic: data?.is_periodic,
        reward_amount: data?.reward_amount || category?.reward_amount || '',
      };
      // Add period only if is_periodic is true
      if (payload.is_periodic) {
        payload.period = data?.period;
      } else {
        delete payload.period;
      }

      // Conditionally add start_date and end_date if is_periodic is false
      if (!data?.is_periodic) {
        payload.start_date = data?.start_date || category?.start_date || '';
        payload.end_date = data?.end_date || category?.end_date || '';
      }

      if (!isCreateCategory) {
        payload = {
          ...payload,
          trainer_reward_id: category?.id,
        };
      } else {
        payload = {
          ...payload,
        };
      }
      const response = await createOrUpdateLoyaltyProgram(payload);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
        setSearchValue('');
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      reload();
      setAddOnlyOneCategory(false);
    }
  });

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: '75% 25%',
        }}
        sx={{ mb: 2 }}
      >
        <RHFTextField name="name" label="Name" borderRadius="0px" />

        <RHFSelect
          value={selectedLanguage}
          onChange={handleChange}
          name="locale"
          borderRadius="0px"
        >
          {localeOptions?.length > 0 &&
            localeOptions?.map((option: any) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </RHFSelect>
      </Box>

      <RHFTextField
        name="no_of_sessions_required"
        label="Number of Sessions Required"
        borderRadius="0px"
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {!watch('is_periodic') && (
          <>
            <Controller
              name="start_date"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    {...field}
                    label="Start Date"
                    format="yyyy-MM-dd"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => {
                      if (date) {
                        field.onChange(date.toISOString().split('T')[0]);
                      } else {
                        field.onChange('');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!error}
                        helperText={error ? error.message : ''}
                        fullWidth
                      />
                    )}
                  />
                </Box>
              )}
            />

            <Controller
              name="end_date"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    {...field}
                    label="End Date"
                    format="yyyy-MM-dd"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => {
                      // Check if date is valid before calling toISOString
                      if (date) {
                        field.onChange(date.toISOString().split('T')[0]); // Convert to ISO string (yyyy-MM-dd)
                      } else {
                        field.onChange(''); // Handle invalid date (null or undefined)
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!error}
                        helperText={error ? error.message : ''}
                        fullWidth
                      />
                    )}
                  />
                </Box>
              )}
            />
          </>
        )}
      </Box>

      <RHFTextField
        name="reward_amount"
        label="Reward Amount"
        borderRadius="0px"
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Controller
        name="is_periodic"
        control={methods.control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
              />
            }
            label="Is Periodic"
            sx={{ mb: 2 }}
          />
        )}
      />

      {methods.watch('is_periodic') === 1 && (
        <Controller
          name="period"
          control={methods.control}
          defaultValue=""
          rules={{
            required: 'Period is required when Is Periodic is enabled.',
          }}
          render={({ field, fieldState: { error } }) => (
            <Box sx={{ mb: 2 }}>
              <Select {...field} fullWidth displayEmpty>
                {periodOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        />
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: '15px' }}>
        <LoadingButton
          sx={{ width: '100%', color: '#CF5A0D', borderColor: '#CF5A0D' }}
          type="submit"
          variant="outlined"
          loading={isSubmitting}
        >
          {isCreateCategory ? 'Create' : 'Save'}
        </LoadingButton>
        <LoadingButton
          onClick={() => {
            if (!isCreateCategory) {
              deletecustomer.onTrue();
            } else {
              setTableData((prevTableData: any) => prevTableData.slice(1));
              setAddOnlyOneCategory(false);
            }
          }}
          color="error"
          variant="outlined"
          sx={{ width: '100%' }}
        >
          {isCreateCategory ? 'Cancel' : 'Delete'}
        </LoadingButton>
      </Box>
    </FormProvider>
  );

  const handleCloseDelete = () => {
    deletecustomer.onFalse();
  };

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
        {/* Divider with no margin */}
        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

        {/* Ensure the delete button is aligned to the bottom */}
        <Box sx={{ mt: 'auto', p: 2 }}>{renderForm}</Box>
      </Card>

      <ConfirmDialog
        open={deletecustomer.value}
        onClose={handleCloseDelete}
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={() => {
          deletecustomer.onFalse();
          handleDeleteLoyalityProgramById();
        }}
      />
    </>
  );
}
