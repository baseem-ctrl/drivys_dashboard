import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useSnackbar } from 'src/components/snackbar';
import { RHFTextField } from 'src/components/hook-form';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';
import { Typography } from '@mui/material';
import { updateCertificateRequestStatus } from 'src/api/certificate';

// Validation schema
const validationSchema = Yup.object().shape({
  certificate_file: Yup.mixed(),
  comments: Yup.string(),
  status: Yup.string().required('Status is required'),
});

type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  currentCertificate?: any;
  reload: VoidFunction;
};

export default function CertificateStatusUpdateForm({
  title,
  open,
  onClose,
  reload,
  currentCertificate,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      certificate_request_id: currentCertificate?.id,
      status: currentCertificate?.status,
      comments: currentCertificate?.comments,
    },
  });

  const { handleSubmit, reset, setValue, watch } = methods;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (data.certificate_request_id)
        formData.append('certificate_request_id', data.certificate_request_id);
      if (data.status) formData.append('status', data.status);
      if (data.certificate_file) formData.append('certificate_file', data.certificate_file);
      if (data.comments) formData.append('comments', data.comments);

      const response = await updateCertificateRequestStatus(formData);
      enqueueSnackbar('Certificate updated successfully', { variant: 'success' });
      reload();
      onClose();
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      reload();
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      reset({
        certificate_request_id: currentCertificate?.id,
        status: currentCertificate?.status,
        // certificate_file: null,
        comments: currentCertificate?.comments,
      });
    }
  }, [open, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setValue('certificate_file', event.target.files[0]);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider {...methods}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RHFTextField name="comments" label="Comments" />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    name="status"
                    value={watch('status')}
                    onChange={(e) => setValue('status', e.target.value)}
                  >
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="REJECTED">REJECTED</MenuItem>
                    <MenuItem value="APPROVED">APPROVED</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                  Upload Certificate File
                </Typography>
                <RHFFileUpload name="certificate_file" label="Upload Certificate File" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
