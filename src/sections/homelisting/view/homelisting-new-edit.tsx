import { Key, useCallback, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import moment from 'moment';
import Iconify from 'src/components/iconify';
import { IconButton, InputAdornment } from '@mui/material';

import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormProvider, {
  RHFAutocomplete,
  RHFMultiSelectAuto,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUpload,
} from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import * as Yup from 'yup';
import { useGetProducts } from 'src/api/product';
import { AddSlider, EditSlider } from 'src/api/home-slider';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Typography,
  Select,
} from '@mui/material';
import { fData } from 'src/utils/format-number';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import ImagesSelectionForm from 'src/components/images-selection/select-images-dialog';
import ImagePreview from '../home-slider/image-preview';
import { useGetUsers } from 'src/api/users';
import { useGetAllLanguage } from 'src/api/language';
import { createHomeListing } from 'src/api/homelisting';

interface Props {
  title?: string;
  open: boolean;
  onClose: () => void;

  onReload: any;
}
const catalogueOptions = [
  { label: 'SLIDER', value: 'SLIDER' },
  { label: 'CATEGORY', value: 'CATEGORY' },
  { label: 'TRAINER', value: 'TRAINER' },
];

const displayTypeOptions = [
  { label: 'SLIDER', value: 'SLIDER' },
  { label: 'HORIZONTAL_SCROLL', value: 'HORIZONTAL_SCROLL' },
  { label: 'VERTICAL_SCROLL', value: 'VERTICAL_SCROLL' },
  { label: 'LIST', value: 'LIST' },
  { label: 'GRID', value: 'GRID' },
];
export default function HomeListingNewEdit({
  title = 'Create Home Listing',
  open,
  onClose,
  onReload,
}: Props) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedLanguage, setSelectedLanguage] = useState('En');
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [trainers, setTrainer] = useState<any>([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState(catalogueOptions[1]?.value ?? '');
  const [selectedDisplayType, setSelectedDisplayType] = useState(
    displayTypeOptions[0]?.value ?? ''
  );
  const { language } = useGetAllLanguage(0, 1000);
  const [translations, setTranslations] = useState({});

  // Handle locale selection change

  // Fetch categories and products data
  const { users } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
    is_verified: 1,
  });
  // const { products } = useGetProducts({ page: 0, limit: 1000 });

  // Validation schema
  const NewProductSchema = Yup.object().shape({
    translation: Yup.object().shape(
      Object.fromEntries(
        Object.keys(translations || {}).map((lang) => [
          lang,
          Yup.object().shape({
            title: Yup.string().required(t('Title is required')),
          }),
        ])
      )
    ),
    display_order: Yup.string().required(t('Display order is required')),
    // type: Yup.string(),
    published: Yup.boolean(),
    sliders: Yup.array().nullable(),
  });

  const handleChangeDisplayType = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedDisplayType(event.target.value);
  };
  // Default values based on updateValue or initial form values

  const methods = useForm({
    resolver: yupResolver(NewProductSchema) as any,
  });
  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { isSubmitting, errors },
  } = methods;
  const watchLocale = watch('locale');
  const { fields, remove, append } = useFieldArray({
    control,
    name: 'trainers', // Field array name for addons
  });
  const mapOptions = (items: any[], translationKey: string) =>
    items?.map((item) => ({
      label: item[translationKey]?.[0]?.name || 'No Name',
      value: item.id,
    }));

  const mapOptionsUser = (items: any[]) =>
    items?.map((item) => ({
      label: item?.name || 'No Name',
      value: item.id,
    }));

  useEffect(() => {
    reset();
    if (users) setUserOptions(mapOptionsUser(users));

    // if (products) setProductOptions(mapOptions(products, 'product_translations'));
  }, [users]);
  // Function to add more pairs
  const handleAddMore = () => {
    append({ id: '', display_order: '' });
    onReload();
  };

  // Function to remove a pair
  const handleRemove = (index: number) => {
    remove(index);
  };
  if (errors?.trainers) {
    enqueueSnackbar(errors?.trainers?.message, { variant: 'error' });
  }
  // Handle form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();

      formData.append('display_order', data.display_order || '');
      formData.append('display_type', selectedDisplayType || '');
      formData.append('catalogue_type', 'TRAINER' || '');
      formData.append('is_active', data.is_active ? 1 : 0);

      const currentTranslations = getValues('translation');
      Object.entries(currentTranslations)
        .filter(
          ([locale, values]) =>
            locale !== 'undefined' && locale.trim() !== '' && values?.title?.trim()
        )
        .forEach(([locale, values], index) => {
          formData.append(`translation[${index}][locale]`, locale);
          formData.append(`translation[${index}][title]`, values.title);
        });

      if (data?.trainers?.length > 0) {
        data.trainers.forEach((trainerItem, index) => {
          const userId = trainerItem?.id?.value;

          formData.append(`trainers[${index}][user_id]`, trainerItem.user_id.value);
          // Logs the appended form data
        });
      }

      // Send form data to API
      const response = await createHomeListing(formData);
      if (response) {
        enqueueSnackbar('Home Listing Created successfully', {
          variant: 'success',
        });

        reset();
        onClose();
        onReload();
      }
    } catch (error) {
      if (error.errors) {
        // Iterate over each error and enqueue them in the snackbar
        Object.values(error.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      }
    } finally {
      setValue('trainers', []);
      setValue('display_order', '');
      setValue('published', false);
      setValue('sliders', null);
      reset({
        translation: {},
        display_order: '',
        published: false,
        sliders: null,
        trainers: null,
      });

      reset();
    }
  });

  const handleClose = () => {
    onClose();

    reset();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle> {title}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid xs={12} md={8}>
            <Box
              mt={2}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Controller
                name="locale"
                control={control}
                defaultValue={selectedLanguage} // Ensure a default value is set
                render={({ field }) => (
                  <Select
                    {...field}
                    value={
                      language?.some((lang: any) => lang.language_culture === field.value)
                        ? field.value
                        : ''
                    }
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Locale
                    </MenuItem>
                    {language?.map((lang: any) => (
                      <MenuItem key={lang.id} value={lang.language_culture}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name={`translation.${watchLocale}.title`}
                control={control}
                defaultValue={translations?.[watchLocale]?.title || ''} // Ensure it dynamically picks the correct locale title
                rules={{ required: t('Title is required') }}
                render={({ field, fieldState }) => (
                  <RHFTextField
                    {...field}
                    label={t('Title')}
                    error={!!fieldState.error}
                    helperText={fieldState.error ? fieldState.error.message : ''}
                  />
                )}
              />

              {/* <RHFTextField name="title" label={t('Title')} /> */}
              <RHFTextField
                name="display_order"
                label={t('Display Order')}
                InputLabelProps={{ shrink: true }}
              />
              <RHFTextField
                name="catalogue_type"
                label={t('Catalogue Type')}
                value="TRAINER"
                disabled
              />
              <Controller
                name="display_type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={selectedDisplayType || ''}
                    onChange={handleChangeDisplayType}
                  >
                    {displayTypeOptions?.map((option: any) => (
                      <MenuItem key={option?.value} value={option?.value}>
                        {option?.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />

              <RHFSwitch name="is_active" label={t('Is Active')} />
            </Box>

            <h5>Trainers:</h5>
            {fields?.map((trainerItem: any, index: number) => (
              <Grid container item spacing={2} sx={{ mt: 2, mb: 2 }} key={trainerItem?.id}>
                <Grid item xs={12} md={5}>
                  <RHFAutocomplete
                    name={`trainers[${index}].user_id`} // Dynamic name for react-hook-form
                    label={`Trainer ${index + 1}`}
                    getOptionLabel={(option) => {
                      return option ? `${option?.label}` : '';
                    }}
                    options={userOptions}
                    renderOption={(props, option: any) => (
                      <li {...props} key={option?.value}>
                        {option?.label ?? 'Unknown'}
                      </li>
                    )}
                  />
                </Grid>

                {/* Delete Button */}
                <Grid item xs={12} md={2}>
                  <IconButton onClick={() => handleRemove(index)}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleAddMore}>
                Add Trainer
              </Button>
            </Grid>

            <Stack alignItems="flex-end" sx={{ mt: 3, mb: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {t('Create')}
              </LoadingButton>
            </Stack>
          </Grid>
          <ImagesSelectionForm
            open={imageDialogOpen}
            onClose={() => setImageDialogOpen(false)}
            setSelectedImageIds={setSelectedImageIds}
            selectedImageIds={selectedImageIds}
            apiCall={() => {}}
            isSubmitting={isSubmitting}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
