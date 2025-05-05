import { Key, useCallback, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import moment from 'moment';
import Iconify from 'src/components/iconify';
import { IconButton, InputAdornment } from '@mui/material';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { AddSlider, EditSlider } from 'src/api/home-slider';
import { Button, Dialog, DialogContent, DialogTitle, MenuItem, Typography } from '@mui/material';
import { fData } from 'src/utils/format-number';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import ImagesSelectionForm from 'src/components/images-selection/select-images-dialog';
import ImagePreview from './image-preview';
import { useGetUsers } from 'src/api/users';
import { useGetAllLanguage } from 'src/api/language';

interface Props {
  title?: string;
  open: boolean;
  onClose: () => void;
  updateValue: any;
  onReload: any;
}

export default function HomeSliderDialog({
  title = 'Upload Files',
  open,
  onClose,
  onReload,
  updateValue,
}: Props) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [selectedImageArray, setSelectedArrayIds] = useState<number[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('top');

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [trainers, setTrainer] = useState<any>([]);

  const { language } = useGetAllLanguage(0, 1000);

  // const { products } = useGetProducts({ page: 0, limit: 1000 });

  const today = moment().format('YYYY-MM-DD');

  // Validation schema
  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required(t('name is required')),
    display_order: Yup.string(),
    published: Yup.boolean(),
    Product: Yup.array().nullable(),
    picture_ids: Yup.array().nullable(),
    position: Yup.string(),
  });

  // Default values based on updateValue or initial form values
  const defaultValues = useMemo(
    () => ({
      name: updateValue?.name || '',
      display_order: updateValue?.display_order || '',
      picture_ids: updateValue?.picture_ids || [],
      published: !!updateValue?.published,
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
    setValue,
    control,
    formState: { isSubmitting },
  } = methods;

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
    if (updateValue) {
      reset(defaultValues);
    }

    const selectedLocale = selectedLanguage?.language_culture ?? selectedLanguage;

    // setSelectedImageIds(updateValue?.pictures?.map((item: { picture_id: any; }) => Number(item.picture_id)))
    setSelectedImageIds(
      updateValue?.pictures
        ?.filter((item) => item?.locale === selectedLocale)
        .map((item) => Number(item.picture_id))
    );
    setSelectedArrayIds(
      updateValue?.pictures?.filter((item) => item?.locale === selectedLocale) // Filter for locale "en"
    );
    setSelectedArrayIds(updateValue?.pictures);
  }, [updateValue, reset, defaultValues, selectedLanguage]);

  useEffect(() => {
    setSelectedPosition(updateValue?.is_hero === true ? 'top' : 'bottom');
    if (updateValue?.pictures) {
      setSelectedLanguage(updateValue?.pictures[0]?.locale);
    }
  }, [updateValue]);

  // Populate category and product options when data is available

  // Function to add more pairs
  const handleAddMore = () => {
    append({ id: '', display_order: '' });
    onReload();
    // setTrainer([...trainers, { id: '', display_order: '' }]);
  };

  // Function to remove a pair
  const handleRemove = (index: number) => {
    remove(index);
  };

  // Handle form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('slider_id', updateValue?.id);
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
          formData.append(`picture_ids[${index}][id]`, id.toString())
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

      // Send form data to API
      const response = await EditSlider(formData);
      if (response) {
        enqueueSnackbar(response.message ?? 'Slider Updated successfully', { variant: 'success' });
        onClose();
        onReload();
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

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>{t(title)}</DialogTitle>
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
              <RHFSelect
                name="position"
                label={t('Position')}
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)} // Update position state
              >
                <MenuItem value="top">Top</MenuItem>
                <MenuItem value="bottom">Bottom</MenuItem>
              </RHFSelect>
              <RHFTextField
                name="show_until"
                label={t('Show Until')}
                type="date"
                inputProps={{ min: today }}
              />
              <RHFSwitch name="published" label={t('Published')} />
            </Box>
            <h5>{t('Images')}:</h5>
            <Box>
              {/* Button to open the image selection dialog */}
              <Button variant="contained" onClick={() => setImageDialogOpen(true)}>
                {t('Select Images')}
              </Button>

              {/* Image Preview Component */}
              <ImagePreview
                selectedImageIds={selectedImageIds}
                setSelectedImageIds={setSelectedImageIds}
                isUpdate
                selectedImageArray={selectedImageArray}
                reload={onReload}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3, mb: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {updateValue?.id ? t('Save') : t('Create')}
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
