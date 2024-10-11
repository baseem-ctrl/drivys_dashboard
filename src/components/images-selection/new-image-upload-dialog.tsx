import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// types
import { ImageItem } from 'src/types/user';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUpload } from 'src/components/hook-form';
import { createImageSingle } from 'src/api/all-image';
import { Grid, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentImage: ImageItem;
  reload: any;
};

export default function NewImagesForm({ currentImage, open, onClose, reload }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    picture: Yup.mixed<any>().nullable().required('Cover is required'),
    picture_large: Yup.mixed<any>().nullable(),
    description: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      picture: currentImage?.virtual_path || '',
      picture_large: currentImage?.virtual_large_path || '',
      description: currentImage?.description || '',
    }),
    [currentImage]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [currentImage]);

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const onSubmitInner = handleSubmit(async (data) => {
    console.log('calling inner');

    try {
      const formData = new FormData();

      if (data.picture instanceof File) {
        formData.append('picture', data.picture);
      }
      if (data.picture_large instanceof File) {
        formData.append('picture_large', data.picture_large);
      }

      if (currentImage?.id) {
        formData.append('id', currentImage?.id);
      }

      formData.append('description', data.description);

      const response = await createImageSingle(formData);

      reload();
      reset();
      onClose();
      enqueueSnackbar(response.message);
      console.info('DATA', data);
    } catch (error) {
      if (error.errors) {
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
        setValue('picture', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('picture', null);
  }, [setValue]);

  const handleDrop2 = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('picture_large', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile2 = useCallback(() => {
    setValue('picture_large', null);
  }, [setValue]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          zIndex: 1301, // Ensure this modal is above other modals
        },
      }}
    >
      <FormProvider methods={methods}>
        <DialogTitle>Update images</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: '700' }}> Normal Image:</Typography>
              <RHFUpload
                name="picture"
                maxSize={3145728}
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: '700' }}> Large Image:</Typography>
              <RHFUpload
                name="picture_large"
                maxSize={3145728}
                onDrop={handleDrop2}
                onDelete={handleRemoveFile2}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: '700', mb: 2 }}> Description:</Typography>
              <RHFTextField name="description" label="Description" fullWidth />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton onClick={onSubmitInner} variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
