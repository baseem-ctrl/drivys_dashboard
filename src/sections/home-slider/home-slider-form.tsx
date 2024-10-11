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
import { useGetAllCategory } from 'src/api/category';
// import { useGetProducts } from 'src/api/product';
import { AddSlider } from 'src/api/home-slider';
import { Typography, Button } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import ImagePreview from './image-preview';
import { useGetUsers } from 'src/api/users';
const ImagesSelectionForm = React.lazy(
  () => import('src/components/images-selection/select-images-dialog')
);

type Props = {
  updateValue?: any;
};

export default function HomeSliderForm({ updateValue }: Props) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // const [selectedType, setSelectedType] = useState('Product');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]); // state for image IDs
  const [imageDialogOpen, setImageDialogOpen] = useState(false); // state for image dialog visibility


  const { category } = useGetAllCategory({ limit: 1000, page: 0 });
  // const { products } = useGetProducts({ page: 0, limit: 1000 });
  const { users } = useGetUsers(
    {
      page: 0,
      limit: 1000,
      user_types: "TRAINER",
    }
  );

  const today = moment().format('YYYY-MM-DD');

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

  const defaultValues = useMemo(
    () => ({
      name: updateValue?.name || '',
      display_order: updateValue?.display_order || '',
      // type: updateValue?.type || 'Product',
      picture_ids: updateValue?.picture_ids || [],
      published: updateValue?.published === '1',
      show_until: moment(updateValue?.show_until).format('YYYY-MM-DD') || today,
      Category: updateValue?.categories || [],
      // Product: updateValue?.products || [],
      trainers: []
    }),
    [updateValue, today]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
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
    if (category) setCategoryOptions(mapOptions(category, 'category_translations'));
    // if (products) setProductOptions(mapOptions(products, 'product_translations'));
    if (users) setUserOptions(mapOptionsUser(users));

  }, [category, users]);

  const [trainers, setTrainer] = useState<any>([
  ]);
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
      // formData.append('type', selectedType || '');

      if (data.Category) {
        data.Category.forEach((item: { value: string | Blob; }, index: any) =>
          formData.append(`category_ids[${index}]`, item.value)
        );
      }
      // if (data.Product) {
      //   data.Product.forEach((item, index) => formData.append(`product_ids[${index}]`, item.value));
      // }

      formData.append('published', data.published ? '1' : '0');
      formData.append(
        'show_until',
        data.show_until ? moment(data.show_until).format('YYYY-MM-DD') : ''
      );
      console.log(data?.trainers, "data?.trainers");

      if (data?.trainers?.length > 0) {
        data?.trainers?.forEach((trainerItem, index) => {

          formData.append(`trainers[${index}][id]`, trainerItem?.id?.value);

          // Use nullish coalescing to handle cases where `value` might be 0
          formData.append(`trainers[${index}][display_order]`, trainerItem?.display_order ?? '');
        });
      }

      if (selectedImageIds.length > 0) {
        selectedImageIds.forEach((id, index) =>
          formData.append(`picture_ids[${index}][id]`, id?.toString())
        );
      }
      if (selectedImageIds.length > 0) {
        selectedImageIds.forEach((id, index) =>
          formData.append(`picture_ids[${index}][locale]`, 'en')
        );
      }

      const response = await AddSlider(formData);
      if (response) {
        enqueueSnackbar(response.message ?? 'Slider created successfully', { variant: 'success' });
        router.push(paths.dashboard.slider.root);
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
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

          {/* <RHFSelect
            name="type"
            label="Type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {['Product', 'Category'].map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </RHFSelect> */}

          {/* {selectedType === 'Product' ? (
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
        </Box>

        {trainers?.map((trainerItem: any, index: React.Key | null | undefined) => (
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

        <Box pt={3}>
          {/* Button to open the image selection dialog */}
          <Button variant="contained" onClick={() => setImageDialogOpen(true)}>
            Select Images
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
        apiCall={() => { }}
        isSubmitting={isSubmitting}
      />
    </FormProvider>
  );
}
