import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
// types
import { ILanguageItem } from 'src/types/language';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete, RHFUpload, RHFSwitch } from 'src/components/hook-form';
import { createImageSingle } from 'src/api/all-image';
import { createLanguage, updateLanguage } from 'src/api/language';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  currentLanguage?: ILanguageItem;
  reload: VoidFunction;
};

export default function LanguageCreateEditForm({ title, currentLanguage, open, onClose, reload }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [imageId, setImageId] = useState('')

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    language_culture: Yup.string().required('Language culture is required'),
    flag_id: Yup.string().required('Flag is required'),
    published: Yup.boolean(),
    display_order: Yup.string().required('Display order is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentLanguage?.name,
      language_culture: currentLanguage?.language_culture,
      flag_id: currentLanguage?.flag?.virtual_path,
      published: currentLanguage?.published === '1' ? true : false,
      display_order: currentLanguage?.display_order,
    }),
    [currentLanguage]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const flag_id = watch('flag_id');

  useEffect(() => {
    if (flag_id instanceof File) {
      handleImagesChange(flag_id);
    }
  }, [flag_id]); // The effect will run whenever `images` changes

  useEffect(() => {
    if (currentLanguage) {
      reset(defaultValues);
    }
  }, [currentLanguage, defaultValues, reset]);

  const handleImagesChange = async (flag_id: string | Blob) => {
    try {
      const formData = new FormData();
      if (flag_id instanceof File) {
        formData.append("picture", flag_id);
      }
      // Submit the form data
      const response = await createImageSingle(formData);
      setImageId(response?.data?.id)
      console.log(response?.data?.id, "response");
      // revalidateAllImages()
      enqueueSnackbar(response.message);
    } catch (error) {
      console.error(error);
      if (error.errors) {
        // Iterate over each error and enqueue them in the snackbar
        Object.values(error.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      // const formData = new FormData()
      // console.log(imageId, "imageId");

      // formData.append("flag_id", imageId === "" ? currentLanguage?.flag_id : imageId)
      // if (data.name) formData.append("name", data.name)
      // if (data.language_culture) formData.append("language_culture", data.language_culture)
      // formData.append("published", data.published ? true : false)
      // if (data.display_order) formData.append("display_order", data.display_order)

      const payload = {
        flag_id: imageId === "" ? currentLanguage?.flag_id : imageId,
        language_culture: data.language_culture,
        name: data.name,
        display_order: data.display_order,
        published: data.published ? true : false

      }
      let response;

      if (currentLanguage?.id) {
        response = await updateLanguage(payload, currentLanguage?.id)
      } else {
        response = await createLanguage(payload)
        reset();
      }

      if (response) {
        onClose();
        reload();
        enqueueSnackbar(response?.message ?? "Success");
      }

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



  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('flag_id', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );
  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <Stack sx={{ ml: 10, mr: 10, mt: 5, mb: 5 }}>
          <RHFUpload
            name="flag_id"
            maxSize={3145728}
            onDrop={handleDrop}
            sx={{ mb: 3 }}
          />
        </Stack>
        <DialogContent>


          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            sx={{ mt: 2 }}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >




            <RHFTextField name="name" label="Name" />
            <RHFTextField name="language_culture" label="Language culture" />
            <RHFSwitch name="published" label={'Published'} />


            <RHFTextField name="display_order" label="Display order" />

          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentLanguage?.id ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
