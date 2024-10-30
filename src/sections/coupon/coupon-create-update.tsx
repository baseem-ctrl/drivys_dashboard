import { useEffect, useMemo, useState } from 'react';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Unstable_Grid2';
import { Box } from '@mui/system';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
// import { AddCoupon, EditCoupon } from 'src/api/coupon';
import FormProvider, {
  RHFAutocomplete,
  RHFMultiSelectAuto,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import * as Yup from 'yup';
import MenuItem from '@mui/material/MenuItem';
import { createUpdateCoupon } from 'src/api/coupon';
import { useGetAllCategory } from 'src/api/category';
import { useGetProducts } from 'src/api/product';
interface Props extends DialogProps {
  title?: string;
  folderName?: string;
  open: boolean;
  onClose: VoidFunction;
  reload: VoidFunction;
  updateValue?: any;
}

const discountTypeOptions = [
  { label: 'ALL', value: '0' },
  { label: 'PRODUCT', value: '1' },
  { label: 'CATEGORY', value: '2' },
];
export default function CouponDialog({
  title = 'Upload Files',
  open,
  onClose,
  reload,
  id,
  updateValue,
  ...other
}: Props) {
  const { t } = useTranslation();

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  const { category } = useGetAllCategory(0, 1000);
  const { products } = useGetProducts({ page: 0, limit: 1000 });

  const getValidationSchema = () => {
    return Yup.object().shape({
      name: Yup.string().required(t('name is required')),
      coupon_code: Yup.string()
        .matches(/^[a-zA-Z0-9]+$/, t('Coupon code must not contain special characters'))
        .min(4, t('Coupon code must be at least 4 characters long'))
        .required(t('Coupon code is required')),

      value: Yup.number().test({
        name: 'conditional-validation',
        test: function (value) {
          const { use_percentage } = this.parent;

          if (use_percentage === true && (value === undefined || value === null)) {
            return this.createError({
              message: t('Discount Value is required and must be greater than 0'),
              path: 'value',
            });
          }

          if (use_percentage === true && (value <= 0 || value > 100)) {
            return this.createError({
              message: t('Discount Value must be between 1 and 100'),
              path: 'value',
            });
          }

          if (use_percentage === false && !value) {
            return this.createError({
              message: t('Discount Amount is required and must be greater than 0'),
              path: 'DiscountAmount',
            });
          }

          if (use_percentage === false && value <= 0) {
            return this.createError({
              message: t('Discount Amount must be greater than 0'),
              path: 'DiscountAmount',
            });
          }

          return true;
        },
      }),
      limitation_times: Yup.number()
        .required(t('Limitation Times is required'))
        .positive(t('Limitation Times must be greater than 0')),
      use_percentage: Yup.boolean(),
      is_active: Yup.boolean().nullable(),
      starting_date: Yup.date().required(t('starting_date is required')),
      ending_date: Yup.date().required(t('ending_date is required')),
      discount_type_id: Yup.string().required(t('Is required')),
      Category: Yup.mixed().nullable(),
      Product: Yup.mixed().nullable(),
    });
  };

  const NewProductSchema = getValidationSchema();
  // const mapCategories = (categories: any[], categoryOptions: any[]) => {
  //   return (
  //     categories?.map((category) => {
  //       // Find the corresponding item in categoryOptions
  //       const foundOption = categoryOptions?.find((item) => {
  //         return item.value === category.id; // Ensure you're returning the comparison result
  //       });
  //       return {
  //         label: foundOption?.label,
  //         value: category.id
  //       };
  //     })
  //   );
  // };

  const mapOptions = (items: any[], options: any[]) => {
    return items?.map((item) => {
      // Find the corresponding option in the provided options array
      const foundOption = options?.find((option) => option.value === item.id);

      return {
        label: foundOption?.label,
        value: item.id,
      };
    });
  };

  const defaultValues = useMemo(
    () => ({
      name: updateValue?.name || '',
      coupon_code: updateValue?.coupon_code || '',
      limitation_times: updateValue?.limitation_times || '',
      value: updateValue?.value || '',
      use_percentage: updateValue?.use_percentage === '1' ? true : false,
      is_active: updateValue?.is_active === '1' ? true : false,
      discount_type_id: updateValue?.discount_type_id || '',
      starting_date:
        moment(updateValue?.starting_date).format('YYYY-MM-DD') ||
        moment.utc().format('YYYY-MM-DD'),
      ending_date:
        moment(updateValue?.ending_date).format('YYYY-MM-DD') || moment.utc().format('YYYY-MM-DD'),
      Category: mapOptions(updateValue?.categories, categoryOptions),
      Product: mapOptions(updateValue?.products, productOptions),
    }),
    [
      updateValue?.name,
      updateValue?.use_percentage,
      updateValue?.is_active,
      updateValue?.value,
      updateValue?.discount_type_id,
      updateValue,
      categoryOptions,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema) as any,
    defaultValues,
  });
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const useOptionsEffect = (source: any, translationKey: string, setter: any) => {
    useEffect(() => {
      if (source) {
        const filteredOptions = source.map((item: { [key: string]: any[]; id: any }) => {
          // Access the translations dynamically based on the provided translation key
          const translations = item[translationKey];

          // Find the 'en' and 'ar' translations
          const enTranslation = translations.find((translation) => translation.locale === 'en');
          const arTranslation = translations.find((translation) => translation.locale === 'ar');

          // Create a label by concatenating the 'en' name with the 'ar' name inside brackets if both exist
          const label = `${enTranslation?.name || 'No Name'} (${arTranslation?.name || 'No Name'})`;

          return {
            label,
            value: item.id,
          };
        });

        setter(filteredOptions);
      }
    }, [source, translationKey, setter]);
  };

  // Using the combined effect for categories
  useOptionsEffect(category, 'category_translations', setCategoryOptions);

  // Using the combined effect for products
  useOptionsEffect(products, 'product_translations', setProductOptions);

  // useOptionsEffect(productOptions, setProductOptions);
  console.log('hagshag');
  useEffect(() => {
    if (updateValue) {
      // reset(defaultValues);
    }
  }, [updateValue?.name, defaultValues, reset, categoryOptions]);

  const { formState } = methods;
  const { enqueueSnackbar } = useSnackbar();
  const today = moment().format('YYYY-MM-DD');
  const onSubmit = handleSubmit(async (data) => {
    const startDate = moment(data.starting_date).format('YYYY-MM-DD');
    const endDate = moment(data.ending_date).format('YYYY-MM-DD');
    if (startDate > endDate) {
      enqueueSnackbar('End date is before start date', { variant: 'error' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', data.name || '');
      formData.append('coupon_code', data.coupon_code || '');
      formData.append('value', data.value);
      formData.append('limitation_times', data.limitation_times || '');

      data.Category.map((item: any, index: number) =>
        formData.append(`category_ids[${index}]`, item.value)
      );
      // data.Product.map((item: any, index: number) =>
      //   formData.append(`product_ids[${index}]`, item.value)
      // );
      formData.append('use_percentage', data.use_percentage === true ? 1 : 0);
      formData.append('is_active', data.is_active === true ? 1 : 0);

      formData.append('discount_type_id', data.discount_type_id || 0);
      formData.append(
        'starting_date',
        data.starting_date ? moment(data.starting_date).format('YYYY-MM-DD') : ''
      );
      formData.append(
        'ending_date',
        data.ending_date ? moment(data.ending_date).format('YYYY-MM-DD') : ''
      );
      if (updateValue?.id) {
        formData.append('discount_id', updateValue?.id);
      }

      const response = await createUpdateCoupon(formData);
      if (response) {
        reset();
        enqueueSnackbar(response.message ?? 'coupon created successfully', {
          variant: 'success',
        });
        onClose();
        // router.push(paths.dashboard.product.root);
      }
    } catch (error) {
      if (error?.errors?.starting_date) {
        enqueueSnackbar(error.message + ' ' + error?.errors?.starting_date, { variant: 'error' });
      } else if (error?.errors?.ending_date) {
        enqueueSnackbar(error.message + ' ' + error?.errors?.ending_date, { variant: 'error' });
      } else {
        if (error && error.errors) {
          Object.keys(error.errors).forEach((key) => {
            error.errors[key].forEach((message: string) => {
              enqueueSnackbar(message, { variant: 'error' });
            });
          });
        }
      }
    } finally {
      reload();
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}>
        {' '}
        {/* {!updateValue.name ? title : t('Update Coupon')}{' '} */}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
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

              <>
                <RHFTextField name="coupon_code" label={t('Coupon Code')} />
                <RHFTextField name="limitation_times" label={t('Limitation Times')} />
                <RHFSelect name="discount_type_id" label={t('Discount type')} multiline>
                  {discountTypeOptions?.map((option: any) => (
                    <MenuItem key={option.value} value={option?.value}>
                      {option?.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFSwitch name="use_percentage" label={t('Use Percentage')} />

                <RHFTextField name="value" label={t('Discount Value')} />

                <RHFTextField
                  name="starting_date"
                  label={t('Start Date')}
                  type="date"
                  inputProps={{ min: today }}
                />
                <RHFTextField name="ending_date" label="End Date " type="date" />
                <RHFMultiSelectAuto
                  name="Category"
                  label="Category"
                  options={categoryOptions}
                  // setSearchTerm={setSearchTermCategory}
                  defaultValue={defaultValues.Category}
                />
                {/* <RHFMultiSelectAuto
                  name="Product"
                  label="Product"
                  options={productOptions}
                  // setSearchTerm={setSearchTermCategory}
                  defaultValue={defaultValues.Product}
                /> */}
                <RHFSwitch name="is_active" label={t('Is active')} />
              </>
            </Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              spacing={2}
              sx={{ mt: 3, mb: 3 }}
            >
              <LoadingButton variant="contained" onClick={onClose}>
                {t('Cancel')}
              </LoadingButton>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {updateValue?.name ? t('Save') : t('Create')}
              </LoadingButton>
            </Stack>
          </Grid>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
