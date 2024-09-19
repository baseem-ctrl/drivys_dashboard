/*  This component is used for both create and update Category

We use isCreateCategory to differentiate betweeen the two


API CALLS
1.ImageChangeApiCall is called only to create Pictures into a category
2.handleDelete is called to delete image
3.OnSubmit is called to update name and locale values
4.handleChangePublish is called only to change publish status
5.handleDeleteCategoryById is called to delete the entire category item


*/

// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useCallback } from 'react';
import * as Yup from 'yup';
import FormProvider from 'src/components/hook-form/form-provider';
import LoadingButton from '@mui/lab/LoadingButton';
import { CATEGORY_PUBLISH_OPTIONS } from 'src/_mock';
// types
import { IJobItem } from 'src/types/job';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';
import AllImagesForm from 'src/components/all-images-dialog/all-images-dialog';
import { SetStateAction, useState } from 'react';
import { createCategory, deleteCategory, deleteCategoryById } from 'src/api/category';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import Select from '@mui/material/Select';
import { Autocomplete, Grid } from '@mui/material';
import ImagesPerCategoryView from './get-images-dialog';
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetAllLanguage } from 'src/api/language';
// ----------------------------------------------------------------------

type Props = {
  category: IJobItem;
  onView: VoidFunction;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
  reload: any;
  setTableData: any;
  setAddOnlyOneCategory: boolean;
  parentCategoryValues: any;
  searchCategory: any;
};

export default function JobItem({
  category,
  onView,
  onEdit,
  onDelete,
  reload,
  setTableData,
  setAddOnlyOneCategory,
  parentCategoryValues,
  searchCategory,
}: Props) {
  const popover = usePopover();
  const allImages = useBoolean();
  const viewImages = useBoolean();
  const deletecustomer = useBoolean();

  const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
    useGetAllLanguage(0, 1000);

  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [localeOptions, setLocaleOptions] = useState([]);

  const [selectedLanguage, setSelectedLanguage] = useState(
    category?.category_translations[0]?.locale ?? ''
  );
  const [isSubmittingImage, setIsSubmitting] = useState(false);

  const isCreateCategory = category?.newCategory;
  useEffect(() => {
    if ((language && language?.length > 0) || category?.category_translations?.length > 0) {
      let initialLocaleOptions = [];
      if (Array.isArray(language)) {
        initialLocaleOptions = language?.map((item: any) => ({
          label: item.language_culture,
          value: item.language_culture,
        }));
      }
      const newLocales = category?.category_translations
        ?.map((category: any) => category.locale)
        .filter(
          (locale: any) => !initialLocaleOptions?.some((option: any) => option.value === locale)
        )
        .map((locale: any) => ({ label: locale, value: locale }));
      setLocaleOptions([...initialLocaleOptions, ...newLocales]);
    }
  }, [language, category]);
  const parentCategoryOptions = parentCategoryValues?.map((item) => {
    const translations = item?.category_translations;

    // Find the translation for both Arabic and English locales
    const englishTranslation = translations.find(
      (t) => t.locale.toLowerCase() === 'en' ?? t.locale.toLowerCase() === 'En'
    );
    const arabicTranslation = translations.find(
      (t) => t.locale.toLowerCase() === 'ar' || t.locale.toLowerCase() === 'Ar'
    );

    return {
      label: `${englishTranslation?.name || 'Unknown'} (${arabicTranslation?.name || 'Unknown'})`,
      value: item.id,
    };
  });

  // Handle change event
  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedLanguage(event.target.value);
  };

  const { id, title, company, createdAt, candidates, experience, employmentTypes, salary, role } =
    category;

  const selectedLocaleObject = category?.category_translations.find(
    (item: { locale: string }) => item.locale === selectedLanguage
  );

  const pictures = selectedLocaleObject ? selectedLocaleObject.pictures : [];

  const ImageChangeApiCall = async () => {
    setIsSubmitting(true);
    try {
      const { name, locale } = selectedLocaleObject;
      const payload = {
        category_translation: [
          {
            name: name,
            locale: locale,
            category_translations_picture_ids: selectedImageIds,
          },
        ],
        category_id: category?.id,
      };

      const response = await createCategory(payload);

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

  const handleDelete = async (id: string) => {
    try {
      // Call your delete API
      const response = await deleteCategory(selectedLocaleObject?.id, id);
      reload();
      // Update the UI or state after successful deletion
      enqueueSnackbar(response?.message);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleDeleteCategoryById = async () => {
    try {
      // Call your delete API
      const response = await deleteCategoryById(selectedLocaleObject?.category_id);
      reload();
      // Update the UI or state after successful deletion
      enqueueSnackbar(response?.message);
    } catch (error) {
      enqueueSnackbar('error deleting category', { variant: 'error' });
    }
  };

  const handleChangePublish = async (newValue: string) => {
    const { name, locale } = selectedLocaleObject;
    const payload = {
      category_translation: [
        {
          name: name,
          locale: locale,
          category_translations_picture_ids: selectedImageIds,
        },
      ],
      category_id: category?.id,
      published: newValue === 'published' ? '1' : '0',
    };

    try {
      const res = await createCategory(payload);
      enqueueSnackbar('Status update successfully', { variant: 'success' });
      reload();
    } catch (err) {
      enqueueSnackbar(err?.message, { variant: 'error' });
    }

    // setPublish(newValue);
  };

  const NewSchema = Yup.object().shape({
    name: Yup.string(),
    locale: Yup.mixed(),
    parent_id: Yup.mixed().nullable(),
  });
  const defaultValues = useMemo(
    () => ({
      name: selectedLocaleObject?.name || '',
      locale: selectedLocaleObject?.locale || '',
      parent_id: category?.parent_id
        ? parentCategoryOptions?.find((item: any) => item.value === category?.parent_id)
        : '',
    }),
    [selectedLocaleObject?.name, selectedLocaleObject?.locale]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema) as any,
    defaultValues,
  });
  const { reset, handleSubmit, formState, setValue } = methods;
  const { isSubmitting } = formState;
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (!isCreateCategory) {
      reset(defaultValues);
    }
  }, [selectedLocaleObject?.name, defaultValues, reset, selectedLanguage]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let payload = {
        category_translation: [
          {
            name: data?.name,
            locale: selectedLanguage,
          },
        ],
      };
      if (!isCreateCategory) {
        payload = {
          ...payload,
          category_id: category?.id,
        };
      } else {
        payload = {
          ...payload,
          published: false,
        };
      }

      if (data.parent_id) {
        payload = {
          ...payload,
          parent_id: data.parent_id?.value,
        };
      }

      const response = await createCategory(payload);
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
      setAddOnlyOneCategory(false);
    }
  });

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)', // On smaller screens, both take 100%
          sm: '75% 25% ', // On medium and larger screens, 30% for the select and 70% for the text field
        }}
      >
        <RHFTextField name="name" label="Name" borderRadius="0px" />

        <RHFSelect
          value={selectedLanguage}
          onChange={handleChange}
          name="locale"
          borderRadius="0px"
        >
          {localeOptions?.length > 0 &&
            localeOptions?.map((option: any) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </RHFSelect>
      </Box>
      {/* <RHFSelect name="parent_id" borderRadius="0px" sx={{ mt: 2 }} label="Parent Category">
        {parentCategoryOptions?.map((option: any) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </RHFSelect> */}
      <RHFAutocomplete
        name="parent_id"
        // borderRadius="0px"
        sx={{ mt: 2 }}
        label="Parent Category"
        options={parentCategoryOptions || []}
        onInputChange={(event, value) => {
          searchCategory(value);
        }}
      />
      <Box sx={{ mt: 2, display: 'flex', gap: '15px' }}>
        <LoadingButton
          sx={{ width: '100%', color: '#BC243A', borderColor: '#BC243A' }}
          type="submit"
          variant="outlined"
          loading={isSubmitting}
        >
          {isCreateCategory ? 'Create' : 'Save'}
        </LoadingButton>
        <LoadingButton
          onClick={() => {
            if (!isCreateCategory) {
              deletecustomer.onTrue();
            } else {
              setTableData((prevTableData: any) => prevTableData.slice(1));
              setAddOnlyOneCategory(false); // Properly update the state here
            }
          }}
          color="error"
          variant="outlined"
          sx={{ width: '100%' }}
        >
          {isCreateCategory ? 'Cancel' : 'Delete'}
        </LoadingButton>
      </Box>
    </FormProvider>
  );

  const handleCloseDelete = () => {
    deletecustomer.onFalse();
  };

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
        <Stack alignItems="flex-end">
          {!isCreateCategory && (
            <LoadingButton
              variant="outlined"
              loadingIndicator="Loading…"
              endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
              onClick={popover.onOpen}
              sx={{
                textTransform: 'capitalize',
                width: '120px',
                mr: 2,
                fontSize: '11px',
                mt: 2,
                color: category?.published ? '#BC243A' : 'inherit',
                borderColor: category?.published ? '#BC243A' : 'inherit', // Change border color too
                '&:hover': {
                  borderColor: category?.published ? '#BC243A' : 'inherit', // Ensure hover color is consistent
                },
              }}
            >
              {category?.published ? 'Published' : 'Un Published'}
            </LoadingButton>
          )}
        </Stack>
        {/* {!isCreateCategory && ( */}
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
          <Stack direction="row" spacing={1}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              wrap="nowrap"
              sx={{ overflowX: 'auto' }}
            >
              {pictures.slice(0, 2).map((item, index) => (
                <Grid item key={index}>
                  <Box sx={{ position: 'relative', width: 68, height: 68 }}>
                    {/* Image Avatar */}
                    <Avatar
                      alt={item?.description}
                      src={item?.virtual_path}
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
                      onClick={() => handleDelete(item.id)} // Trigger the delete action
                    >
                      <Iconify
                        color="#BC243A"
                        icon="solar:minus-circle-linear"
                        sx={{ width: '15px', height: '15px' }}
                      />
                    </IconButton>
                  </Box>
                </Grid>
              ))}

              {pictures?.length > 2 && (
                <Grid item xs={3}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: 68,
                      height: 68,
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
                    {pictures.slice(2, 6).map((item, index) => (
                      <Avatar
                        key={index}
                        alt={item?.description}
                        src={item?.virtual_path}
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
                      {`+ ${pictures?.length - 2} more`}
                    </Box>
                  </Box>
                </Grid>
              )}

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
                    border: '2px dashed #BC243A',
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
                    color="#BC243A"
                    sx={{ width: 28, height: 28 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
        {/* // )} */}

        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="top-right"
          sx={{ width: 140 }}
        >
          {CATEGORY_PUBLISH_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === category?.published}
              onClick={() => {
                popover.onClose();
                handleChangePublish(option.value);
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </CustomPopover>

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
      <ImagesPerCategoryView
        open={viewImages.value}
        onClose={viewImages.onFalse}
        allImages={pictures}
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
          handleDeleteCategoryById();
        }}
      />
    </>
  );
}
