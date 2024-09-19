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
import { RHFCheckbox, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { IProduct } from 'src/types/product';
import { createProduct, deleteProduct, deleteProductById, updateProduct } from 'src/api/product';
import { useGetAllLanguage } from 'src/api/language';
import ImagesPerProductView from './images-dialog';
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
    console.log(event.target.value);

    setSelectedLanguage(event.target.value);
  };

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
  } = product;

  const selectedLocaleObject = Array.isArray(product?.product_translations)
    ? product.product_translations.find(
        (item: { locale: string }) => item?.locale === selectedLanguage
      )
    : undefined;

  console.log('selectedLocaleObject', selectedLocaleObject);

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
      enqueueSnackbar('error deleting category', { variant: 'error' });
    }
  };

  const NewSchema = Yup.object().shape({
    product_translations: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required('Name is required'),
          subtitle: Yup.string().required('subtitle is required'),
          promotional_title: Yup.string().required('promotional_title is required'),
          product_page_description: Yup.string().required('product_page_description is required'),
          locale: Yup.string().required('Locale is required'),
        })
      )
      .min(1, 'At least one translation is required'),

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
  });

  const defaultValues = useMemo(
    () => ({
      product_translations: product_translations.map(
        ({ name, subtitle, promotional_title, product_page_description, locale }) => ({
          name,
          subtitle,
          promotional_title,
          product_page_description,
          locale,
        })
      ) || [
        {
          name: '',
          subtitle: '',
          promotional_title: '',
          product_page_description: '',

          locale: '',
        },
      ],

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
    }),
    [
      product_translations,
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
    const formData = new FormData();

    // Conditionally append fields required if new product
    if (isCreateProduct) {
      formData.append('price', data?.price);
      formData.append('discount_price', data?.discount_price ?? '');
      formData.append('discount_end', data?.discount_end ?? '');
      formData.append('cost_price', data?.cost_price);
      formData.append('weight', data?.weight);
      formData.append('weight_unit', data?.weight_unit);
      formData.append('max_quantity_per_customer', data?.max_quantity_per_customer);
      formData.append('ability_to_write_note', data?.ability_to_write_note);
      formData.append('in_stock', data?.in_stock);
      formData.append('sku', data?.sku);
      formData.append('mpn', data?.mpn);
      formData.append('gtin', data?.gtin);
    }

    // Append product_id only if updating an existing product
    if (!isCreateProduct) {
      formData.append('product_id', id);
    }

    // Handle product_picture_ids
    if (data?.product_picture_ids && data?.product_picture_ids.length > 0) {
      data.product_picture_ids.forEach((pic, index) => {
        formData.append(`product_picture_ids[${index}][id]`, pic.id);
        formData.append(`product_picture_ids[${index}][order]`, pic.order);
      });
    }

    // Handle product_translation
    if (data?.product_translation && data?.product_translation.length > 0) {
      data.product_translation.forEach((translation, index) => {
        formData.append(`product_translation[${index}][locale]`, translation.locale);
        formData.append(`product_translation[${index}][name]`, translation.name);
        formData.append(`product_translation[${index}][subtitle]`, translation.subtitle ?? '');
        formData.append(
          `product_translation[${index}][promotional_title]`,
          translation.promotional_title ?? ''
        );
        formData.append(
          `product_translation[${index}][product_page_description]`,
          translation.product_page_description ?? ''
        );
      });
    }

    try {
      const response = await createProduct(formData);
      if (response) {
        enqueueSnackbar(response.message, {
          variant: 'success',
        });
      }
    } catch (error) {
      if (error?.errors) {
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
          {/* {isCreateProduct
            ? localeOptions.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )) 
            : */}

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
        <RHFTextField
          name="product_page_description"
          label="Product Page Description"
          borderRadius="0px"
        />
      </Box>
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
          minWidth: '400px',
        }}
      >
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Stack sx={{ p: 3, pb: 2, mt: 2, flexGrow: 1 }}>
          <Stack direction="row" spacing={1}>
            <Grid container spacing={2}>
              {productPictures?.slice(0, 2)?.map((item, index) => (
                <Grid item xs={3} key={index}>
                  <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                    {/* Image Avatar */}
                    <Avatar
                      alt={item?.picture?.description}
                      src={item?.picture?.virtual_path}
                      variant="rounded"
                      sx={{ width: '100%', height: '100%', mb: 2 }}
                    />

                    {/* Delete Icon */}
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        backgroundColor: 'white',
                        '&:hover': {
                          backgroundColor: 'lightgrey',
                        },
                      }}
                      onClick={() => handleDeletePicture(item.id)} // Trigger the delete action
                    >
                      <Iconify
                        color="#CF5A0D"
                        icon="solar:minus-circle-linear"
                        sx={{ width: '15px', height: '15px' }}
                      />
                    </IconButton>
                  </Box>
                </Grid>
              ))}

              {productPictures?.length > 2 && (
                <Grid item xs={3}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: 48,
                      height: 48,
                      mb: 2,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gridTemplateRows: 'repeat(2, 1fr)',
                      gap: '2px',
                      '&:hover .overlay': {
                        display: 'flex',
                      },
                    }}
                  >
                    {productPictures
                      ?.slice(2, 6)
                      .map((item, index) => (
                        <Avatar
                          key={index}
                          alt={item?.picture?.description}
                          src={item?.picture?.virtual_path}
                          variant="round"
                          sx={{ width: 24, height: 24 }}
                        />
                      ))}
                    <Box
                      className="overlay"
                      onClick={() => viewImages.onTrue()}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '50px',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      {`+ ${productPictures?.length - 2} more`}
                    </Box>
                  </Box>
                </Grid>
              )}

              <Grid item xs={3}>
                <Iconify
                  icon="icon-park-outline:add-picture"
                  color="#CF5A0D"
                  onClick={() => allImages.onTrue()}
                  sx={{ width: '50px', height: '50px', cursor: 'pointer' }}
                />
              </Grid>
            </Grid>
          </Stack>
        </Stack>

        {/* Divider with no margin */}
        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

        {/* Ensure the delete button is aligned to the bottom */}
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

          // deleteProduct(Id);
        }}
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            popover.onClose();
            onView();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            popover.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}
