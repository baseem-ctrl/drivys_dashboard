import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { createUserDocument } from 'src/api/user-document';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentDocument?: any;
  reload?: any;
  user_id?: any;
};

export default function UserDocumentCreateUpdate({
  reload,
  open,
  onClose,
  currentDocument,
  user_id,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const DocumentSchema = Yup.object().shape({
    user_id: Yup.number(),
    doc_type: Yup.string(),
    doc_side: Yup.string(),
    expiry: Yup.date(),
  });
  const defaultValues = useMemo(
    () => ({
      user_id: '',
      doc_type: '',
      doc_side: '',
      expiry: '',
    }),
    []
  );
  const methods = useForm({
    resolver: yupResolver(DocumentSchema),
    defaultValues,
  });

  const { reset, setValue, watch } = methods;
  const handleCreateClick = async () => {
    try {
      const data = {
        user_id: user_id,
        doc_type: watch('doc_type'),
        doc_side: watch('doc_side'),
        doc_file: watch('doc_file'),
        expiry: watch('expiry'),
      };
      const response = await createUserDocument(data);
      if (response) {
        enqueueSnackbar('Document created successfully!', { variant: 'success' });
        reload();
        onClose();
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
        reset();
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      reset();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    reset();
  }, [reset]);
  return (
    <FormProvider methods={methods}>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle>{currentDocument ? 'Update Document' : 'Create Document'}</DialogTitle>

        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <RHFTextField
                  name="doc_type"
                  label="Doc Type"
                  type="text"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <RHFTextField
                  name="doc_side"
                  label="Doc Side"
                  type="text"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <RHFTextField
                  name="expiry"
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField
                  name="doc_file"
                  label="File URL"
                  fullWidth
                  placeholder="Enter the URL of the file"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton variant="contained" onClick={handleCreateClick}>
            {currentDocument ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
