import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Button,
  IconButton,
  MenuItem,
} from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import { RHFTextField, RHFSelect } from 'src/components/hook-form';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import FormProvider from 'src/components/hook-form/form-provider';
import { useGetAllCity } from 'src/api/city';
import { createUpdatePackage } from 'src/api/package';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentCityData: any;
  handleRemoveCity: (index: number) => void;
};

export default function AddCityPackage({
  open,
  onClose,
  handleRemoveCity,
  currentCityData,
  id,
  reload,
}: Props) {

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { city, cityLoading } = useGetAllCity({
    limit: 100,
    page: 1,
    is_published: 1,
  });

  const methods = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        cities_ids: Yup.array().of(
          Yup.object().shape({
            id: Yup.mixed(),
            min_price: Yup.number().min(0, 'Price cannot be negative'),
            max_price: Yup.number().min(0, 'Price cannot be negative'),
          })
        ),
      })
    ),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    setValue,
  } = methods;

  const onSubmit = async (data: any) => {
    try {
      const nextIndex = currentCityData.length;

      const newCity = data.cities_ids[nextIndex];

      let formData = new FormData();
      formData.append('package_id', id);
      formData.append(`cities_ids[${nextIndex}][id]`, newCity.id.value);

      formData.append(`cities_ids[${nextIndex}][min_price]`, newCity.min_price || '');
      formData.append(`cities_ids[${nextIndex}][max_price]`, newCity.max_price || '');

      const response = await createUpdatePackage(formData);

      if (response) {
        reset();
        reload();
        onClose();
        enqueueSnackbar(response?.message, { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar(error?.message || 'An error occurred', { variant: 'error' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("Add City")} </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
            <Grid item xs={12}>
              <RHFAutocompleteSearch
                name={`cities_ids[${currentCityData?.length || 0}][id]`}
                label={t("Select City")}
                multiple={false}
                options={city?.map((option: any) => ({
                  value: option?.id,
                  label: option?.city_translations[0]?.name ?? 'Unknown',
                }))}
                loading={cityLoading}
              />
            </Grid>

            <Grid item xs={6}>
              <RHFTextField
                name={`cities_ids[${currentCityData?.length || 0}][min_price]`}
                label={t("City Min Price")}
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={6}>
              <RHFTextField
                name={`cities_ids[${currentCityData?.length || 0}][max_price]`}
                label={t("City Max Price")}
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t("Cancel")}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t("Submit")}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
