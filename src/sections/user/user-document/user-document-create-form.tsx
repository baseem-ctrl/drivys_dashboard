import * as Yup from 'yup';
import { useEffect, useMemo, useRef } from 'react';
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
import moment from 'moment';

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
    doc_type: Yup.string(),
    doc_side: Yup.string(),
    expiry: Yup.date(),
    file_type: Yup.string(),
    doc_file: Yup.mixed(),
  });
  const defaultValues = useMemo(
    () => ({
      doc_type: '',
      doc_side: '',
      expiry: '',
      file_type: '',
      doc_file: [],
    }),
    []
  );
  const methods = useForm({
    resolver: yupResolver(DocumentSchema) as any,
    defaultValues,
  });

  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const values = watch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const body = new FormData();
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        body.append('doc_file', fileInput.files[0]); // Get the file
      }
      // body.append('doc_file', data?.doc_file);
      body.append('doc_type', data?.doc_type);
      body.append('doc_side', data?.doc_side);
      body.append('expiry', moment(data?.expiry).format('YYYY-MM-DD'));
      body.append('user_id', user_id);

      const response = await createUserDocument(body);
      if (response) {
        enqueueSnackbar('Document created successfully!', { variant: 'success' });
        reload();
        onClose();
        reset();
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
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };
  const docSideOptions = [
    { value: 'Front', label: 'Front' },
    { value: 'Back', label: 'Back' },
  ];
  const fileOptions = [
    { value: 'file', label: 'File' },
    { value: 'url', label: 'URL' },
  ];
  const docTypeOptions = [
    { value: 'ID', label: 'ID' },
    { value: 'PASSPORT', label: 'PASSPORT' },
    { value: 'CARD', label: 'CARD' },
    { value: 'LICENCE', label: 'LICENCE' },
    { value: 'IBAN', label: 'IBAN' },
    { value: 'OTHER', label: 'OTHER' },
  ];
  useEffect(() => {
    reset();
  }, [reset]);
  useEffect(() => {
    if (values?.doc_type === 'OTHER' || values?.doc_type === 'IBAN') {
      setValue('file_type', 'text');
    }
  });
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentDocument ? 'Update Document' : 'Create Document'}</DialogTitle>

        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <RHFSelect name="doc_type" label="Select Documnet Type" fullWidth>
                  {docTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
              <Grid item xs={6}>
                <RHFSelect name="doc_side" label="Select Doc Side" fullWidth>
                  {docSideOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
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
              {!(values?.doc_type === 'OTHER' || values?.doc_type === 'IBAN') && (
                <Grid item xs={6}>
                  <RHFSelect name="file_type" label="Select File Type" fullWidth>
                    {fileOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>
              )}

              <Grid item xs={6} sx={{ mb: 1 }}>
                <RHFTextField
                  name="doc_file"
                  label="File"
                  fullWidth
                  type={values?.file_type}
                  InputLabelProps={{ shrink: true }}
                  inputRef={fileInputRef}
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
