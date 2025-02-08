import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'src/components/snackbar';

import Grid from '@mui/material/Grid';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { createOrUpdatePackageDocument } from 'src/api/packageDocument';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentDocument?: any;
  reload?: any;
  packageId?: any;
  sessionNumber?: any;
};

export default function PackageDocumentCreateUpdate({
  reload,
  open,
  onClose,
  currentDocument,
  packageId,
  sessionNumber,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const DocumentSchema = Yup.object().shape({
    title: Yup.string(),
    type: Yup.string(),
    status: Yup.string(),
    session_no: Yup.number()
      .max(sessionNumber, `Session number cannot exceed ${sessionNumber}.`)
      .required('Session number is required'),
  });

  // Default values (populate for update if `currentDocument` exists)
  const defaultValues = useMemo(
    () => ({
      package_id: packageId || '',
      title: currentDocument?.title || '',
      type: currentDocument?.type || 'image',
      status: currentDocument?.status || 'active',
      session: currentDocument?.session_no || '',
      icon: currentDocument?.icon || null,
    }),
    [currentDocument, packageId]
  );

  const methods = useForm({
    resolver: yupResolver(DocumentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  // Watch the type field
  const fileType = watch('type');
  let acceptedFileTypes = '';

  // Restrict the file type
  if (fileType === 'image') {
    acceptedFileTypes = '.jpg,.jpeg,.png';
  } else if (fileType === 'video') {
    acceptedFileTypes = '.mp4';
  } else if (fileType === 'pdf') {
    acceptedFileTypes = '.pdf';
  }

  const onSubmit = async (data: any) => {
    try {
      // Create a new FormData object
      const updatedDocument = new FormData();

      if (data.icon) {
        const icon = data.icon;
        updatedDocument.append('icon', icon);
      } else {
        console.warn('No icon selected');
      }

      if (data.file) {
        const file = data.file;
        updatedDocument.append('file', file);
      } else {
        console.warn('No file selected');
      }

      // Append other form data
      updatedDocument.append('package_id', packageId);
      updatedDocument.append('title', data.title || '');
      updatedDocument.append('session_no', data.session_no || '');
      updatedDocument.append('type', data.type || '');
      updatedDocument.append('status', data.status || '');
      updatedDocument.append('description', data.description || '');

      // Call the API to create/update the document
      const response = await createOrUpdatePackageDocument(updatedDocument);
      enqueueSnackbar(response?.message, { variant: 'success' });
      reload();
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting the form:', error);
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

  const handleClose = () => {
    reset();
    onClose();
  };

  // options for file type
  const typeOptions = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
  ];
  // options for status
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{currentDocument ? 'Update Document' : 'Create Document'}</DialogTitle>

        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField name="session_no" label="Session Number" type="number" fullWidth />
              </Grid>

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField name="title" label="Title" fullWidth />
              </Grid>
              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField name="description" label="Description" fullWidth />
              </Grid>
              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFSelect name="type" label="Type" fullWidth>
                  {typeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFSelect name="status" label="Status" fullWidth>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ fontWeight: 'bold', fontSize: '1.125rem', mb: 1, color: 'primary.main' }}
                >
                  Package Document Upload
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mb: 1 }}>
                <RHFFileUpload
                  name="file"
                  label="Upload Package Document"
                  helperText="Please upload a package document"
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ fontWeight: 'bold', fontSize: '1.125rem', mb: 1, color: 'primary.main' }}
                >
                  Package Icon Upload
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mb: 1 }}>
                <RHFFileUpload
                  name="icon"
                  label="Upload Icon"
                  helperText="Upload an icon image (optional)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentDocument ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
