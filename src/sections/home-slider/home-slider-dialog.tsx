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
import { useGetAllCategory } from 'src/api/category';
import { useGetProducts } from 'src/api/product';
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

  console.log('updateValue', updateValue);

  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [selectedImageArray, setSelectedArrayIds] = useState<number[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [trainers, setTrainer] = useState<any>([
  ]);

  const { language } =
    useGetAllLanguage(0, 1000);

  // Fetch categories and products data
  const { category } = useGetAllCategory({ limit: 1000, page: 0 });
  const { users } = useGetUsers(
    {
      page: 0,
      limit: 1000,
      user_types: "TRAINER",
    }
  );


  // const { products } = useGetProducts({ page: 0, limit: 1000 });

  const today = moment().format('YYYY-MM-DD');


  // Validation schema
  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required(t('name is required')),
    display_order: Yup.string(),
    // type: Yup.string(),
    published: Yup.boolean(),
    Category: Yup.array().nullable(),
    Product: Yup.array().nullable(),
    picture_ids: Yup.array().nullable(),
    trainers: Yup.array().of(
      Yup.object().shape({
        id: Yup.mixed().required("Trainer is required"), // Validate court add-on
        display_order: Yup
          .number()
          // .typeError("Number of Add Ons must be a number")
          .required("Display order is required") // Validate the number of add-ons
      })
    ),
  });

  // Default values based on updateValue or initial form values
  const defaultValues = useMemo(
    () => ({
      name: updateValue?.name || '',
      display_order: updateValue?.display_order || '',
      // type: updateValue?.type || '',
      picture_ids: updateValue?.picture_ids || [],
      published: updateValue?.published === '1',
      show_until: moment(updateValue?.show_until).format('YYYY-MM-DD') || today,
      Category:
        updateValue?.categories?.map((category: any) => ({
          label: category?.category_translations[0]?.name,
          value: category?.id,
        })) || [],
      // trainers: users ? updateValue?.trainers?.map((trainer: { id: any; display_order: any; trainer: any; }) => ({
      //   id: users?.length > 0 ? users?.find((option: { id: any; }) => option?.id === trainer?.trainer?.id) : '',
      //   display_order: trainer?.display_order || ''
      // })) : [],
      trainers: users ? updateValue?.trainers?.map((trainer) => {
        const user = users.find((option) => option.id === trainer.trainer.id);
        return {
          id: user ? { label: user?.name, value: user?.id } : '',
          display_order: trainer.display_order || '',
        };
      }) : [],
      //  updateValue?.trainers
      // Category: updateValue?.categories || [],
      // Product:
      //   updateValue?.products?.map((product: any) => product?.product_translations[0]?.name) || [],

    }),
    [updateValue, today, users]
  );



  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
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

  const { fields, remove } = useFieldArray({
    control,
    name: 'trainers', // Field array name for addons
  })

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
    console.log(updateValue?.pictures?.map((item: { picture_id: any; }) => item?.picture_id), "updateValue?.pictures");

    const selectedLocale = selectedLanguage?.language_culture ?? selectedLanguage

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
    setSelectedArrayIds(updateValue?.pictures)

    setTrainer(updateValue?.trainers)


  }, [updateValue, reset, defaultValues, selectedLanguage]);

  useEffect(() => {
    if (updateValue?.pictures) {
      setSelectedLanguage(updateValue?.pictures[0]?.locale)
    }
  }, [updateValue])


  // Populate category and product options when data is available
  useEffect(() => {
    if (category) setCategoryOptions(mapOptions(category, 'category_translations'));
    if (users) setUserOptions(mapOptionsUser(users));

    // if (products) setProductOptions(mapOptions(products, 'product_translations'));
  }, [category, users]);

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


  // Handle form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('slider_id', updateValue?.id);
      formData.append('name', data.name || '');
      formData.append('display_order', data.display_order || '');
      // formData.append('type', selectedLanguage || '');

      // Append category or product IDs based on the selected type
      if (data.Category) {
        data.Category.forEach((item: { value: string | Blob; }, index: any) =>
          formData.append(`category_ids[${index}]`, item.value)
        );
      }
      if (data.Product) {
        data.Product.forEach((item: { value: string | Blob; }, index: any) => formData.append(`product_ids[${index}]`, item.value));
      }

      formData.append('published', data.published ? '1' : '0');
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
          formData.append(`picture_ids[${index}][locale]`, selectedLanguage?.language_culture ?? selectedLanguage)
        );
      }


      if (data?.trainers?.length > 0) {
        data?.trainers?.forEach((trainerItem, index) => {

          formData.append(`trainers[${index}][id]`, trainerItem?.id?.value);

          // Use nullish coalescing to handle cases where `value` might be 0
          formData.append(`trainers[${index}][display_order]`, trainerItem?.display_order ?? '');
        });
      }


      // Send form data to API
      const response = await EditSlider(formData);
      if (response) {
        enqueueSnackbar(response.message ?? 'Slider Updated successfully', { variant: 'success' });
        onClose();
        onReload();
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
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
              <RHFTextField name="name" label={t('Name')} />
              <RHFTextField name="display_order" label={t('Display Order')} />

              <RHFSelect
                name="language"
                label="Language"
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
                  <MenuItem disabled>No languages available</MenuItem> // Placeholder when no languages are available
                )}
              </RHFSelect>


              {/* <RHFSelect
                name="type"
                label="Type"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {['Product', 'Category'].map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </RHFSelect> */}

              {/* {selectedLanguage === 'Product' ? (
                <RHFMultiSelectAuto
                  name="Product"
                  label="Product"
                  options={productOptions}
                  defaultValue={defaultValues.Product}
                />
              ) : (
                <RHFMultiSelectAuto
                  name="Category"
                  label="Category"
                  options={categoryOptions}
                  defaultValue={defaultValues.Category}
                />
              )} */}
              <RHFMultiSelectAuto
                name="Category"
                label="Category"
                options={categoryOptions}
                defaultValue={defaultValues.Category}
              />


              <RHFTextField
                name="show_until"
                label={t('Show Until')}
                type="date"
                inputProps={{ min: today }}
              />
              <RHFSwitch name="published" label={t('Published')} />
            </Box>

            <h5>Trainers:</h5>
            {trainers?.map((trainerItem: any, index: Key | null | undefined) => (
              <Grid container item spacing={2} sx={{ mt: 2, mb: 2 }} key={index}>




                <Grid item xs={12} md={5} >
                  <RHFAutocomplete
                    name={`trainers[${index}].id`} // Dynamic name for react-hook-form
                    label={`Trainer ${index + 1}`}
                    getOptionLabel={(option) => {
                      return option ? `${option?.label}` : '';
                    }}
                    options={userOptions}
                    renderOption={(props, option: any) => (
                      <li {...props} key={option?.value}>
                        {option?.label ?? "Unknown"}
                      </li>
                    )}
                  />
                </Grid>

                {/* Value Field */}
                <Grid item xs={12} md={5} >
                  <RHFTextField name={`trainers[${index}].display_order`} // Dynamic name for react-hook-form
                    label={`Trainer ${index + 1} display order`} />


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
            <h5>Images:</h5>
            <Box >
              {/* Button to open the image selection dialog */}
              <Button variant="contained" onClick={() => setImageDialogOpen(true)}>
                Select Images
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
            apiCall={() => { }}
            isSubmitting={isSubmitting}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
