// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, SetStateAction, useState } from 'react';
import * as Yup from 'yup';
import FormProvider from 'src/components/hook-form/form-provider';
import LoadingButton from '@mui/lab/LoadingButton';

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';
import AllImagesForm from 'src/components/all-images-dialog/all-images-dialog';
import { enqueueSnackbar } from 'src/components/snackbar';
import Select from '@mui/material/Select';
import { Grid } from '@mui/material';
import {
  RHFCheckbox,
  RHFMultiSelect,
  RHFMultiSelectAuto,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { IProduct } from 'src/types/product';
import { createProduct, deleteProduct, deleteProductById, updateProduct } from 'src/api/product';
import { useGetAllLanguage } from 'src/api/language';
import { useGetAllCategory } from 'src/api/category';
import ImagesPerProductView from './images-dialog';
import { useTranslation } from 'react-i18next';
// ----------------------------------------------------------------------

type Props = {
  product: IProduct;
  onView: VoidFunction;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
  setAddOneProduct: boolean;
  setTableData: any;
  reload: any;
};

export const LOCAL_OPTIONS = [
  { value: 'aa', label: 'aa' },
  { value: 'ddd', label: 'ddd' },
  { value: 'en', label: 'en' },
  { value: 'ar', label: 'ar' },
];
export default function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
  reload,
  setTableData,
  setAddOneProduct,
}: Props) {
  const popover = usePopover();
  const allImages = useBoolean();
  const viewImages = useBoolean();
  const deletecustomer = useBoolean();

  const { language } = useGetAllLanguage(0, 1000);
  const { i18n } = useTranslation();

  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(
    Array.isArray(product?.product_translations) && product?.product_translations.length > 0
      ? product.product_translations[0].locale
      : ''
  );

  const [isSubmittingImage, setIsSubmitting] = useState(false);

  const isCreateProduct = product?.newProduct;

  const localeOptionsFromApi = language?.map((item) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

  const localeOptions = product?.product_translations?.map((item) => ({
    label: item.locale,
    value: item.locale,
  }));

  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedLanguage(event.target.value);
  };

  const [categoryOptions, setCategoryOptions] = useState([]);

  const { category } = useGetAllCategory({
    limit: 1000,
    page: 1,
  });

  useEffect(() => {
    const filteredOptions = category?.map((item) => {
      const translations = item.category_translations;

      // Find the translation for both Arabic and English locales
      const englishTranslation = translations.find((t) => t.locale.toLowerCase() === 'en');
      const arabicTranslation = translations.find((t) => t.locale.toLowerCase() === 'ar');

      return {
        label: `${englishTranslation?.name || 'Unknown'} (${arabicTranslation?.name || 'Unknown'})`,
        value: item.id,
      };
    });

    setCategoryOptions(filteredOptions);
  }, [category]);

  const {
    id,
    price,
    discount_price,
    cost_price,
    weight,
    weight_unit,
    discount_end,
    max_quantity_per_customer,
    ability_to_write_note,
    in_stock,
    sku,
    mpn,
    gtin,
    product_translations,
    product_pictures: productPictures,
    categroy_ids,
  } = product;

  const selectedLocaleObject = Array.isArray(product_translations)
    ? product_translations.find((item: any) => item?.locale === selectedLanguage)
    : undefined;

  const mapOptions = (items: Item[], options: Option[]) =>
    items?.map((item) => {
      const categoryId = parseInt(item.category_id);

      // Ensure category_id is valid
      if (isNaN(categoryId)) {
        console.error(`Invalid category_id: ${item.category_id}`);
        return {
          label: 'Unknown', // Fallback for invalid category_id
          value: item.id,
        };
      }

      // Find the corresponding option based on the parsed category_id
      const foundOption = options?.find((option) => option.value === categoryId);

      // Log if no corresponding option is found
      if (!foundOption) {
        console.warn(`No option found for category_id: ${categoryId}`);
      }

      return {
        label: foundOption?.label || 'Unknown',
        value: item.id,
      };
    });
  const ImageChangeApiCall = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        product_id: id,
        product_picture_ids: selectedImageIds.map((imageId, index) => ({
          id: imageId,
          order: index + 1,
        })),
      };

      const response = await updateProduct(payload);

      reload();
      allImages.onFalse();
      enqueueSnackbar(response.message);
      setIsSubmitting(false);
    } catch (error) {
      if (error.errors) {
        // Iterate over each error and enqueue them in the snackbar
        Object.values(error.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
      setIsSubmitting(false);
    }
  };

  const handleDeletePicture = async (pictureId: string) => {
    try {
      // Call your delete API
      const response = await deleteProduct(pictureId);

      reload();

      enqueueSnackbar(response?.message);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleDeleteProductById = async () => {
    try {
      // Call your delete API
      const response = await deleteProductById(id);
      if (response) {
        reload();
        enqueueSnackbar(response?.message);
      }
      // Update the UI or state after successful deletion
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
    name: isCreateProduct ? Yup.string().required('name is required') : Yup.string(),

    subtitle: isCreateProduct ? Yup.string().required('subtitle is required') : Yup.string(),

    promotional_title: isCreateProduct
      ? Yup.string().required('promotional title is required')
      : Yup.string(),

    product_page_description: isCreateProduct
      ? Yup.string().required('product page description is required')
      : Yup.string(),

    locale: isCreateProduct ? Yup.mixed().required('locale is required') : Yup.mixed(),

    price: isCreateProduct ? Yup.number().required('price is required') : Yup.number(),

    discount_price: isCreateProduct
      ? Yup.number().required('discount price is required')
      : Yup.number(),

    cost_price: isCreateProduct ? Yup.number().required('cost price is required') : Yup.number(),

    weight: isCreateProduct ? Yup.number().required('weight is required') : Yup.number(),

    weight_unit: isCreateProduct ? Yup.mixed().required('weight unit is required') : Yup.mixed(),

    max_quantity_per_customer: isCreateProduct
      ? Yup.number().required('max quantity per customer is required')
      : Yup.number(),

    ability_to_write_note: isCreateProduct
      ? Yup.boolean().required('ability to write note is required')
      : Yup.boolean(),

    in_stock: isCreateProduct ? Yup.boolean().required('in stock is required') : Yup.boolean(),

    sku: isCreateProduct ? Yup.string().required('sku is required') : Yup.string(),

    mpn: isCreateProduct ? Yup.string().required('mpn is required') : Yup.string(),

    gtin: isCreateProduct ? Yup.string().required('gtin is required') : Yup.string(),

    Product: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: selectedLocaleObject?.name || '',
      subtitle: selectedLocaleObject?.subtitle || '',
      promotional_title: selectedLocaleObject?.promotional_title || '',
      product_page_description: selectedLocaleObject?.product_page_description || '',
      locale: selectedLocaleObject?.locale || '',
      price: price || '',
      discount_price: discount_price || '',
      cost_price: cost_price || '',
      weight: weight || '',
      weight_unit: weight_unit || '',
      max_quantity_per_customer: max_quantity_per_customer || '',
      ability_to_write_note,
      in_stock,
      sku: sku || '',
      mpn: mpn || '',
      gtin: gtin || '',
      Category: mapOptions(categroy_ids, categoryOptions),
    }),
    [
      selectedLocaleObject?.name,
      selectedLocaleObject?.subtitle,
      selectedLocaleObject?.promotional_title,
      selectedLocaleObject?.product_page_description,
      selectedLocaleObject?.locale,
      price,
      discount_price,
      cost_price,
      weight,
      weight_unit,
      max_quantity_per_customer,
      ability_to_write_note,
      in_stock,
      sku,
      mpn,
      gtin,
      categroy_ids,
      categoryOptions,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema) as any,
    defaultValues,
  });
  const { reset, handleSubmit, formState, setValue } = methods;
  const { isSubmitting } = formState;

  useEffect(() => {
    if (!isCreateProduct) {
      reset(defaultValues);
    }
  }, [selectedLocaleObject, defaultValues, reset, isCreateProduct]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let payload = {
        product_translation: [
          {
            name: data?.name,

            subtitle: data?.subtitle,
            promotional_title: data?.promotional_title,
            product_page_description: data?.product_page_description,
            locale: selectedLanguage,
          },
        ],
        price: data?.price,
        discount_price: data?.discount_price,
        cost_price: data?.cost_price,
        weight: data?.weight,
        weight_unit: data?.weight_unit,
        max_quantity_per_customer: data?.max_quantity_per_customer,
        ability_to_write_note: data?.ability_to_write_note,
        in_stock: data?.in_stock,
        sku: data?.sku,
        mpn: data?.mpn,
        gtin: data?.gtin,
      };
      if (!isCreateProduct) {
        payload = {
          ...payload,
          product_id: id,
        };
      }

      if (data.Category) {
        const valuesArray = data?.Category?.map((item) => item.value);
        payload = { ...payload, category_ids: valuesArray };
      }

      const response = await createProduct(payload);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
      }
    } catch (error) {
      if (error?.errors) {
        // Iterate over each error and enqueue them in the snackbar
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      reload();
    }
  });
  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: '75% 25% ',
        }}
      >
        <RHFTextField name="name" label="Name" borderRadius="0px" />

        <RHFSelect
          value={selectedLanguage}
          onChange={handleChange}
          name="locale"
          borderRadius="0px"
        >
          {localeOptionsFromApi?.map((option: any) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </RHFSelect>
      </Box>
      <Box sx={{ margin: '15px 0' }}>
        <RHFTextField name="subtitle" label="Subtitle" borderRadius="0px" />
      </Box>
      <Box sx={{ margin: '15px 0' }}>
        <RHFTextField name="promotional_title" label="Promotional Title" borderRadius="0px" />
      </Box>
      <Box sx={{ margin: '15px 0' }}>
        <RHFTextField name="discount_price" label="Discount price" borderRadius="0px" />
      </Box>

      <Box sx={{ margin: '15px 0' }}>
        <RHFTextField
          name="product_page_description"
          label="Product Page Description"
          borderRadius="0px"
        />
      </Box>
      {categoryOptions?.length > 0 && (
        <Box sx={{ margin: '15px 0' }}>
          <RHFMultiSelectAuto
            name="Category"
            label="Parent Category"
            options={categoryOptions}
            // setSearchTerm={setSearchTermCategory}
            defaultValue={defaultValues.Category}
            borderRadius="0px"
          />
        </Box>
      )}

      <Box sx={{ margin: '15px 0' }} display="flex" gap={2}>
        <RHFTextField name="price" label="Price" borderRadius="0px" />
        <RHFTextField name="discount_price" label="Discount" borderRadius="0px" />
        <RHFTextField name="cost_price" label="Cost Price" borderRadius="0px" />
      </Box>
      <Box sx={{ margin: '15px 0' }} display="flex" gap={2}>
        <RHFTextField name="weight" label="Weight" borderRadius="0px" />
        <RHFTextField name="weight_unit" label="Weight unit" borderRadius="0px" />
      </Box>
      <Box sx={{ margin: '15px 0' }} display="flex" gap={2}>
        <RHFTextField
          name="max_quantity_per_customer"
          label="Max Quantity"
          sx={{ width: '130px' }}
        />
        <RHFCheckbox name="ability_to_write_note" label="write note" />
        <RHFCheckbox name="in_stock" label="in stock" />
      </Box>
      <Box sx={{ margin: '15px 0' }} display="flex" gap={2}>
        <RHFTextField name="sku" label="sku" />
        <RHFTextField name="mpn" label="mpn" />
        <RHFTextField name="gtin" label="gtin" />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: '15px' }}>
        <LoadingButton
          sx={{ width: '100%', color: '#CF5A0D', borderColor: '#CF5A0D' }}
          type="submit"
          variant="outlined"
          loading={isSubmitting}
        >
          {isCreateProduct ? 'Create' : 'Save'}
        </LoadingButton>
        <LoadingButton
          onClick={() => {
            if (!isCreateProduct) {
              deletecustomer.onTrue();
            } else {
              setTableData((prevTableData: any) => prevTableData.slice(1));
              setAddOneProduct(false);
            }
          }}
          color="error"
          variant="outlined"
          sx={{ width: '100%' }}
        >
          {isCreateProduct ? 'Cancel' : 'Delete'}
        </LoadingButton>
      </Box>
    </FormProvider>
  );

  const handleCloseDelete = () => {
    deletecustomer.onFalse();
  };
  return (
    <>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
          // minWidth: '400px',
        }}
      >
        <Stack
          sx={{
            p: 3,
            pb: 2,
            mt: 2,
            flexGrow: 1,
            bgcolor: 'rgba(224,224,224,0.2)',
            borderRadius: '8px',
          }}
        >
          {/* Image Container */}
          <Grid container spacing={2} alignItems="center" wrap="nowrap" sx={{ overflowX: 'auto' }}>
            {/* Render first two images */}
            {productPictures?.slice(0, 2)?.map((item, index) => (
              <Grid item key={index} xs={3}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 68,
                    height: 68,
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: 1,
                  }}
                >
                  <Avatar
                    alt={item?.picture?.description}
                    src={item?.picture?.virtual_path}
                    variant="square"
                    sx={{ width: '100%', height: '100%' }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'white',
                      boxShadow: 1,
                      '&:hover': {
                        backgroundColor: 'lightgrey',
                      },
                    }}
                    onClick={() => handleDeletePicture(item.id)}
                  >
                    <Iconify
                      icon="solar:minus-circle-linear"
                      sx={{ color: '#CF5A0D', width: 18, height: 18 }}
                    />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            {/* Collapsed images section */}
            {productPictures?.length > 2 && (
              <Grid item>
                <Box
                  sx={{
                    position: 'relative',
                    width: 68,
                    height: 68,
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: 0.5,
                    boxShadow: 1,
                    '&:hover .overlay': {
                      display: 'flex',
                    },
                  }}
                >
                  {productPictures.slice(2, 6).map((item, index) => (
                    <Avatar
                      key={index}
                      alt={item?.picture?.description}
                      src={item?.picture?.virtual_path}
                      variant="square"
                      sx={{ width: 32, height: 32, objectFit: 'cover' }}
                    />
                  ))}
                  <Box
                    className="overlay"
                    onClick={() => viewImages.onTrue()}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                  >
                    {`+ ${productPictures.length - 2} more`}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Add new image button */}
            <Grid item>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  bgcolor: 'rgba(188, 36, 58, 0.1)',
                  border: '2px dashed #CF5A0D',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(188, 36, 58, 0.2)',
                  },
                }}
                onClick={() => allImages.onTrue()}
              >
                <Iconify
                  icon="icon-park-outline:add-picture"
                  color="#CF5A0D"
                  sx={{ width: 28, height: 28 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

        <Box sx={{ mt: 'auto', p: 2 }}>{renderForm}</Box>
      </Card>

      <AllImagesForm
        open={allImages.value}
        onClose={allImages.onFalse}
        setSelectedImageIds={setSelectedImageIds}
        selectedImageIds={selectedImageIds}
        apiCall={ImageChangeApiCall}
        isSubmitting={isSubmittingImage}
      />
      <ImagesPerProductView
        open={viewImages.value}
        onClose={viewImages.onFalse}
        allImages={productPictures}
        deleteId={selectedLocaleObject?.id}
        reload={reload}
      />
      <ConfirmDialog
        open={deletecustomer.value}
        onClose={handleCloseDelete}
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={() => {
          deletecustomer.onFalse();
          handleDeleteProductById();
        }}
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      />
    </>
  );
}
