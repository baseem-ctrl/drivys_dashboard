import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { IconButton, InputAdornment, MenuItem } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box } from '@mui/system';
import Iconify from 'src/components/iconify';
import moment from 'moment';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormProvider, {
  RHFAutocomplete,
  RHFMultiSelectAuto,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import * as Yup from 'yup';
// import { useGetProducts } from 'src/api/product';
import { AddSlider } from 'src/api/home-slider';
import { Typography, Button } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import ImagePreview from './image-preview';
import { useGetAllLanguage } from 'src/api/language';
const ImagesSelectionForm = React.lazy(
  () => import('src/components/images-selection/select-images-dialog')
);

type Props = {
  updateValue?: any;
};

export default function HomeSliderForm({ updateValue }: Props) {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]); // state for image IDs
  const [imageDialogOpen, setImageDialogOpen] = useState(false); // state for image dialog visibility
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [selectedPosition, setSelectedPosition] = useState('top');

  const { language } = useGetAllLanguage(0, 1000);

  // const { products } = useGetProducts({ page: 0, limit: 1000 });

  const today = moment().format('YYYY-MM-DD');

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required(t('Name is required')),
    display_order: Yup.string().required(t('Display order is required')),
    // type: Yup.string(),
    published: Yup.boolean(),
    Product: Yup.array().nullable(),
    picture_ids: Yup.array().nullable(),
    position: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      name: updateValue?.name || '',
      display_order: updateValue?.display_order || '',
      // type: updateValue?.type || 'Product',
      picture_ids: updateValue?.picture_ids || [],
      published: updateValue?.published === '1',
      show_until: moment(updateValue?.show_until).format('YYYY-MM-DD') || today,
      position: updateValue?.is_hero === true ? 'top' : 'bottom',
    }),
    [updateValue, today]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const { fields, remove } = useFieldArray({
    control,
    name: 'trainers', // Field array name for addons
  });
  const [trainers, setTrainer] = useState<any>([]);
  // Function to add more pairs
  const handleAddMore = () => {
    setTrainer([...trainers, { id: '', display_order: '' }]);
  };

  // Function to remove a pair
  const handleRemove = (index: number) => {
    const trainer = [...trainers];
    trainer.splice(index, 1); // Remove the pair at the specified index
    setTrainer(trainer);
    remove(index);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name || '');
      formData.append('display_order', data.display_order || '');
      formData.append('published', data.published ? '1' : '0');
      formData.append('is_hero', selectedPosition === 'top' ? 1 : 0);

      formData.append(
        'show_until',
        data.show_until ? moment(data.show_until).format('YYYY-MM-DD') : ''
      );

      if (selectedImageIds.length > 0) {
        selectedImageIds.forEach((id, index) =>
          formData.append(`picture_ids[${index}][id]`, id?.toString())
        );
      }
      if (selectedImageIds.length > 0) {
        selectedImageIds.forEach((id, index) =>
          formData.append(
            `picture_ids[${index}][locale]`,
            selectedLanguage?.language_culture ?? selectedLanguage
          )
        );
      }

      const response = await AddSlider(formData);
      if (response) {
        enqueueSnackbar(response.message ?? 'Slider created successfully', { variant: 'success' });
        router.push(paths.dashboard.slider.root);
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
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid xs={12} md={8}>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <RHFTextField name="name" label={t('Name')} />
          <RHFTextField name="display_order" label={t('Display Order')} />

          <RHFSelect
            name="language"
            label={t('Language')}
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {language && language.length > 0 ? (
              language.map((option, index) => (
                <MenuItem key={index} value={option?.language_culture}>
                  {option?.language_culture}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>{t('No languages available')}</MenuItem> // Placeholder when no languages are available
            )}
          </RHFSelect>

          {/* <RHFMultiSelectAuto
              name="Trainer"
              label="Category"
              options={userOptions}
              defaultValue={defaultValues.Category}
            /> */}

          <RHFTextField
            name="show_until"
            label={t('Show Until')}
            type="date"
            inputProps={{ min: today }}
          />
          <RHFSwitch name="published" label={t('Published')} />
          <RHFSelect
            name="position"
            label={t('Position')}
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)} // Update position state
          >
            <MenuItem value="top">Top</MenuItem>
            <MenuItem value="bottom">Bottom</MenuItem>
          </RHFSelect>
        </Box>

        <Box pt={3}>
          {/* Button to open the image selection dialog */}
          <Button variant="contained" onClick={() => setImageDialogOpen(true)}>
            {t('Select Images')}
          </Button>

          {/* Image Preview Component */}
          <ImagePreview
            selectedImageIds={selectedImageIds}
            setSelectedImageIds={setSelectedImageIds}
            isUpdate={false}
          />
        </Box>

        <Stack alignItems="flex-end" sx={{ mt: 3, mb: 3 }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {updateValue?.name ? t('Save') : t('Create')}
          </LoadingButton>
        </Stack>
      </Grid>

      {/* Image Selection Dialog */}
      <ImagesSelectionForm
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        setSelectedImageIds={setSelectedImageIds}
        selectedImageIds={selectedImageIds}
        apiCall={() => {}}
        isSubmitting={isSubmitting}
      />
    </FormProvider>
  );
}
