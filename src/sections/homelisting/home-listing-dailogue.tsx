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
import { useGetAllCategory } from 'src/api/category';
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
  updateValue: any;
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
export default function HomeListingDialog({
  title = 'Update Home Listing',
  open,
  onClose,
  onReload,
  updateValue,
}: Props) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  console.log('updateValue', updateValue);

  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [selectedImageArray, setSelectedArrayIds] = useState<number[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [trainers, setTrainer] = useState<any>([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState(catalogueOptions[1]?.value ?? '');
  const [selectedDisplayType, setSelectedDisplayType] = useState(
    displayTypeOptions[0]?.value ?? ''
  );
  const { language } = useGetAllLanguage(0, 1000);

  // Fetch categories and products data
  const { category } = useGetAllCategory({ limit: 1000, page: 0 });
  const { users } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
  });

  // const { products } = useGetProducts({ page: 0, limit: 1000 });

  const today = moment().format('YYYY-MM-DD');

  // Validation schema
  const NewProductSchema = Yup.object().shape({
    title: Yup.string().required(t('title is required')),
    display_order: Yup.string(),
    // type: Yup.string(),
    published: Yup.boolean(),
    sliders: Yup.array().nullable(),
    trainers: Yup.array().of(
      Yup.object().shape({
        id: Yup.mixed().required('Trainer is required'), // Validate court add-on
        display_order: Yup.number()
          // .typeError("Number of Add Ons must be a number")
          .required('Display order is required'), // Validate the number of add-ons
      })
    ),
  });
  const handleChangeCatalogue = (event: { target: { value: SetStateAction<string> } }) => {
    console.log('event.target.value', event.target.value);
    setSelectedCatalogue(event.target.value);
  };
  const handleChangeDisplayType = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedDisplayType(event.target.value);
  };
  // Default values based on updateValue or initial form values
  const defaultValues = useMemo(
    () => ({
      title: updateValue?.title || '',
      display_order: updateValue?.display_order || '',
      category: updateValue?.categories?.[0]?.value || 21,
      // type: updateValue?.type || '',
      sliders: updateValue?.sliders[0] || [],
      published: updateValue?.published === '1',

      display_type: updateValue?.display_type || '',
      is_active: updateValue?.is_active || 1,
      catalogue_type: updateValue?.catalogue_type || '',
      // trainers: users ? updateValue?.trainers?.map((trainer: { id: any; display_order: any; trainer: any; }) => ({
      //   id: users?.length > 0 ? users?.find((option: { id: any; }) => option?.id === trainer?.trainer?.id) : '',
      //   display_order: trainer?.display_order || ''
      // })) : [],
      trainers: users
        ? updateValue?.trainers?.map((trainer) => {
            const user = users.find((option) => option.id === trainer?.trainer?.id);
            return {
              id: user ? { label: user?.name, value: user?.id } : '',
              display_order: trainer.display_order || '',
            };
          })
        : [],
      //  updateValue?.trainers
      // Category: updateValue?.categories || [],
      // Product:
      //   updateValue?.products?.map((product: any) => product?.product_translations[0]?.name) || [],
    }),
    [updateValue, today, users]
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
    console.log(
      updateValue?.pictures?.map((item: { picture_id: any }) => item?.picture_id),
      'updateValue?.pictures'
    );

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

    // selectedLanguage
    setSelectedArrayIds(updateValue?.pictures);

    setTrainer(updateValue?.trainers);
  }, [updateValue, reset, defaultValues, selectedLanguage]);

  useEffect(() => {
    if (updateValue?.pictures) {
      setSelectedLanguage(updateValue?.pictures[0]?.locale);
    }
  }, [updateValue]);
  console.log('default values', defaultValues);
  // Populate category and product options when data is available
  useEffect(() => {
    if (category) setCategoryOptions(mapOptions(category, 'category_translations'));
    if (users) setUserOptions(mapOptionsUser(users));

    // if (products) setProductOptions(mapOptions(products, 'product_translations'));
  }, [category, users]);

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
    console.log('data', data);
    try {
      console.log('datadatadatadatadata', data);
      console.log('selectedCatalogue', selectedCatalogue);

      const formData = new FormData();
      if (updateValue?.id) {
        formData.append('home_listing_id', updateValue?.id);
      }
      formData.append('title', data.title || '');
      formData.append('display_order', data.display_order || '');
      formData.append('display_type', selectedDisplayType || '');
      formData.append('catalogue_type', 'TRAINER' || '');
      formData.append('published', data.published ? '1' : '0');

      if (selectedImageIds && selectedImageIds.length > 0) {
        selectedImageIds.forEach((id, index) =>
          formData.append(`sliders[${index}]`, id.toString())
        );
      }
      //   if (selectedImageIds.length > 0) {
      //     selectedImageIds.forEach((id, index) =>
      //       formData.append(
      //         `picture_ids[${index}][locale]`,
      //         selectedLanguage?.language_culture ?? selectedLanguage
      //       )
      //     );
      //   }

      if (data?.trainers?.length > 0) {
        data?.trainers?.forEach((trainerItem, index) => {
          formData.append(`trainers[${index}][user_id]`, trainerItem?.id?.value);
          // Use nullish coalescing to handle cases where `value` might be 0
          formData.append(`trainers[${index}][category]`, trainerItem?.category ?? '');
        });
      }

      // Send form data to API
      // const response = await createHomeListing(formData);
      // if (response) {
      //   enqueueSnackbar(response.message ?? 'Slider Updated successfully', { variant: 'success' });
      //   onClose();
      //   onReload();
      // }
    } catch (error) {
      if (error.errors) {
        // Iterate over each error and enqueue them in the snackbar
        Object.values(error.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
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
      <DialogTitle>{title}</DialogTitle>
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
              <RHFTextField name="title" label={t('Title')} />

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

              {/* <RHFMultiSelectAuto
                name="Category"
                label="Category"
                options={categoryOptions}
                defaultValue={defaultValues.Category}
              /> */}

              <RHFSwitch name="published" label={t('Published')} />
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

                {/* Value Field */}
                <Grid item xs={12} md={5}>
                  <Select
                    style={{ width: '100%' }}
                    name={`trainers[${index}].category_id`}
                    labelId="category-label"
                    value={defaultValues.category || ''} // Ensure value is set to empty string if no category
                    onChange={(e) => {
                      // Log when category selection changes
                      console.log(`Category ${index + 1} selected:`, e.target.value);
                      console.log(`Updated value for category[${index}]:`, e.target.value);
                    }}
                    onOpen={() => {
                      // Log when the dropdown menu is opened
                      console.log(`Category ${index + 1} dropdown opened`);
                    }}
                    onClose={() => {
                      // Log when the dropdown menu is closed
                      console.log(`Category ${index + 1} dropdown closed`);
                    }}
                  >
                    {/* Log placeholder rendering */}
                    {defaultValues.category === '' || defaultValues.category === undefined
                      ? console.log(
                          `Category ${index + 1} has no default value, showing placeholder`
                        )
                      : console.log(
                          `Category ${index + 1} has default value:`,
                          defaultValues.category
                        )}

                    {/* Placeholder if no default value is selected */}
                    <MenuItem value="" disabled>
                      Select a Category
                    </MenuItem>

                    {/* Mapping through category options */}
                    {categoryOptions.map((option) => {
                      console.log(`Rendering category option:`, option); // Log each category option being rendered
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
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
            {/* <h5>Images:</h5> */}
            {/* <Box> */}
            {/* Button to open the image selection dialog */}
            {/* <Button variant="contained" onClick={() => setImageDialogOpen(true)}>
                Select Images
              </Button> */}

            {/* Image Preview Component */}
            {/* <ImagePreview
                selectedImageIds={selectedImageIds}
                setSelectedImageIds={setSelectedImageIds}
                isUpdate
                selectedImageArray={selectedImageArray}
                reload={onReload}
              /> */}
            {/* </Box> */}

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
