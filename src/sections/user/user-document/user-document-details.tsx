// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Iconify from 'src/components/iconify';
import {
  Box,
  Button,
  TextField,
  Menu,
  MenuItem,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { Select, FormControl, InputLabel } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import moment from 'moment';
import { createOrUpdatePackageDocument, deletePackageDocumentById } from 'src/api/packageDocument';
import Switch from '@mui/material/Switch';
import { approveUserDoc, createUserDocument, deleteUserDocumentById } from 'src/api/user-document';
import UserDocumentCreateUpdate from './user-document-create-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';

type Document = {
  doc_type: string;
  doc_side: string;
  doc_file: string;
  expiry: string;
  is_approved: string;
  doc_id: string;
};

type Props = {
  documents: Document[];
  loading?: boolean;
  reload: VoidFunction;
};
const docTypeOptions = [
  { value: 'ID', label: 'ID' },
  { value: 'PASSPORT', label: 'PASSPORT' },
  { value: 'CARD', label: 'CARD' },
  { value: 'LICENCE', label: 'LICENCE' },
  { value: 'IBAN', label: 'IBAN' },
  { value: 'OTHER', label: 'OTHER' },
];
const docSideOptions = [
  { value: 'FRONT', label: 'FRONT' },
  { value: 'BACK', label: 'BACK' },
];
export default function UserDocumentDetails({ id, documents, reload }: Props) {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [docID, setDocID] = useState<number | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const [filePreviewURL, setFilePreviewURL] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Function to handle image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setFilePreviewURL(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };
  const [confirm, setConfirm] = useState({
    value: false,
    onFalse: () => setConfirm({ ...confirm, value: false }),
  });
  const DocumentSchema = Yup.object().shape({
    doc_type: Yup.string(),
    doc_side: Yup.string(),
    doc_file: Yup.mixed(),
    expiry: Yup.date(),
    is_approved: Yup.string(),
    doc_id: Yup.string(),
    file_type: Yup.string(),
  });
  const defaultDocumentValues = (details: any | null) => ({
    doc_type: details?.doc_type ? details.doc_type.toUpperCase() : '' || '',
    doc_side: details?.doc_side || '',
    doc_file: details?.doc_file || '' || [],
    expiry: details?.expiry || '',
    is_approved: details?.is_approved || '',
    doc_id: details?.id || '',
    file_type: 'url' || '',
  });
  const methods = useForm({
    resolver: yupResolver(DocumentSchema) as any,
    defaultValues: editMode !== null ? defaultDocumentValues(documents[editMode]) : null,
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
  useEffect(() => {
    if (editMode !== null) {
      reset(defaultDocumentValues(documents[editMode]));
    } else {
      reset(defaultDocumentValues(null));
    }
  }, [editMode, reset]);
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
  const handleFileClick = (file) => {
    window.open(file, '_blank'); // Open file in a new tab
  };

  const handleCancel = () => {
    reset();
    setEditMode(null);
  };
  const handleClickEdit = () => {
    setEditMode(editIndex);
    setAnchorEl(null);
  };

  const onSubmit = handleSubmit(async (formData: any) => {
    try {
      const updatedDocument = new FormData();
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        updatedDocument.append('doc_file', fileInput.files[0]); // Get the file
      } else {
        if (formData.doc_file) {
          updatedDocument.append('doc_file', formData.doc_file);
        }
      }
      if (formData.doc_type) {
        updatedDocument.append('doc_type', formData.doc_type);
      }
      if (formData.doc_side) {
        updatedDocument.append('doc_side', formData.doc_side);
      }

      if (formData.expiry) {
        const expiryDate = new Date(formData.expiry);
        const formattedExpiry = expiryDate.toISOString().split('T')[0];
        updatedDocument.append('expiry', formattedExpiry);
      }

      const is_approved = isApproved ? 1 : 0;

      updatedDocument.append('is_approved', is_approved);

      updatedDocument.append('doc_id', formData.doc_id);

      // Now pass this `updatedDocument` to the API
      const response = await createUserDocument(updatedDocument);

      if (response) {
        reload();
        enqueueSnackbar('Document updated successfully!', { variant: 'success' });
        setEditMode(null);
      } else {
        reset();
        enqueueSnackbar('Failed to update document!', { variant: 'error' });
      }
    } catch (error: any) {
      reset();
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
    } finally {
      setSelectedImage(null);

      reload();
    }
  });
  // Handle delete document
  const handleDelete = async (id: number) => {
    setAnchorEl(null);
    try {
      const response = await deleteUserDocumentById(id);

      if (response) {
        enqueueSnackbar(t('Document deleted successfully!'), { variant: 'success' });
      } else {
        enqueueSnackbar(t('Failed to delete document!'), { variant: 'error' });
      }
    } catch (error: any) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      reload();
      setSelectedImage(null);
      reset();
    }
  };
  const handleOpenFile = (fileUrl) => {
    // Open the file in a new tab
    window.open(fileUrl, '_blank');
  };
  const openDeleteDialog = (id: number) => {
    setConfirm({ value: true, id });
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  // Handle menu open
  const handleClick = (event: React.MouseEvent<HTMLElement>, index: number, docId: number) => {
    setAnchorEl(event.currentTarget);
    setEditIndex(index);
    setDocID(docId);
  };

  const handleSwitchChange = (event) => {
    setIsApproved(event.target.checked);
  };
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
    setEditMode(null);
  };
  const handleApprovalToggle = async (
    event: React.ChangeEvent<HTMLInputElement>,
    docId: string
  ) => {
    const isChecked = event.target.checked;
    const body = {
      doc_id: docId,
      is_approved: isChecked ? 1 : 0,
    };
    try {
      const response = await approveUserDoc(body);
      if (response) {
        enqueueSnackbar(response?.message);
        reload();
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenDialog}
        >
          {t("Add user document")}
        </Button>
      </Box>

      <Stack spacing={1} sx={{ p: 3 }}>
        <Scrollbar>
          {documents &&
            documents[0]?.user?.user_docs &&
            documents[0]?.user?.user_docs.length > 0 ? (
            <Grid spacing={3} container>
              {documents[0].user.user_docs.map((doc, index) => (
                <Grid item xs={12} sm={6} key={doc.id} sx={{ fontSize: '12px' }}>
                  <Stack
                    component={Card}
                    spacing={2}
                    sx={{
                      //   mb: 3,
                      border: '1px solid #ccc',
                      p: 2,
                      borderRadius: '4px',
                      position: 'relative',
                      height: 'auto',
                      // width: 'auto',
                      overflowX: 'auto', // Enable horizontal scrolling
                      whiteSpace: 'nowrap', // Prevent content from wrapping
                    }}
                  >
                    {editMode !== index && (
                      <Iconify
                        icon="eva:more-vertical-fill"
                        onClick={(event) => handleClick(event, index, doc.id)}
                        sx={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          cursor: 'pointer',
                        }}
                      />
                    )}

                    {editMode !== index ? (
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: 2,
                          width: '100%',
                          //   height: '590px',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '18px',
                            alignSelf: 'flex-start',
                          }}
                        >
                          {t("Document Details:")}
                        </Typography>
                        <Stack
                          spacing={2}
                          alignItems="flex-start"
                          sx={{ typography: 'body2', width: '100%' }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              {t("Approved at")}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                            >
                              {doc.approved_at ?? 'N/A'}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              {t("Approved by")}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Tooltip title={doc?.approved_by_user?.user_type ?? 'N/A'} arrow>
                              <Typography
                                sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 15 }}
                              >
                                {doc?.approved_by_user?.name ?? 'N/A'}
                              </Typography>
                            </Tooltip>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              {t("Created at")}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                            >
                              {doc?.created_at
                                ? moment(doc.created_at).format('YYYY-MM-DD HH:mm:ss')
                                : 'N/A'}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              {t("Document File")}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>

                            <Tooltip title={doc.doc_file} arrow>
                              <Typography
                                onClick={() => handleOpenFile(doc.doc_file)}
                                sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                              >
                                {doc?.doc_file
                                  ? `${doc.doc_file.slice(0, 8)}...${doc.doc_file.slice(-6)}`
                                  : 'N/A'}
                              </Typography>
                            </Tooltip>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              {t("Document Side")}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                            >
                              {doc.doc_side ?? 'N/A'}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              {t("Document Type")}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                            >
                              {doc.doc_type ?? 'N/A'}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              {t("Approved")}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Stack direction="row" alignItems="center">
                              <Switch
                                checked={doc.is_approved === 1}
                                color="primary"
                                name="is_approved"
                                onChange={(event) => handleApprovalToggle(event, doc.id)}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack
                        spacing={3}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          marginTop: '20px',
                          // height: '570px',
                          width: '100%',
                          padding: '2',
                        }}
                      >
                        <FormProvider methods={methods} onSubmit={onSubmit}>
                          <Stack
                            spacing={4}
                            alignItems="flex-start"
                            sx={{ typography: 'body2', width: '100%' }}
                          >
                            <Grid container spacing={4}>
                              <Grid item xs={6}>
                                <RHFSelect
                                  name="doc_type"
                                  label={t("Select Documnet Type")}
                                  fullWidth
                                  disabled
                                >
                                  {docTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </RHFSelect>
                              </Grid>
                              <Grid item xs={6}>
                                <RHFSelect name="doc_side" label={t("Select Doc Side")} fullWidth>
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
                                  label={t("Expiry Date")}
                                  type="date"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                              <Grid item xs={6} sx={{ mb: 1 }}>
                                <RHFTextField
                                  name="doc_file"
                                  label={t("File")}
                                  fullWidth
                                  type={values.file_type === 'file' ? 'file' : 'url'}
                                  InputLabelProps={{ shrink: true }}
                                  inputRef={fileInputRef}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Switch
                                          size="small"
                                          checked={values.file_type === 'file'}
                                          onChange={(event) => {
                                            setValue('doc_file', '');
                                            setValue(
                                              'file_type',
                                              event.target.checked ? 'file' : 'url'
                                            );
                                          }}
                                          color="primary"
                                        />
                                        <Typography sx={{ ml: 1 }}>
                                          {values.file_type === 'file' ? t('File') : t('URL')}
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="flex-end"
                            sx={{ mt: 2 }}
                          >
                            <Button variant="outlined" onClick={handleClose}>
                              {t("Cancel")}
                            </Button>
                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                              {t("Update")}
                            </LoadingButton>
                          </Stack>
                        </FormProvider>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="h8" sx={{ textAlign: 'teft', ml: 2, color: '#CF5A0D' }}>
              {t("No documents found for this user. You can add a document by clicking on Add Document.")}
            </Typography>
          )}
        </Scrollbar>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClickEdit}>{t("Edit")}</MenuItem>
        <MenuItem onClick={() => openDeleteDialog(docID)}>{t("Delete")}</MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => setConfirm({ ...confirm, value: false })}
        title={t("Delete")}
        content={t("Are you sure you want to delete?")}
        onConfirm={() => {
          handleDelete(confirm.id);
          setConfirm({ ...confirm, value: false });
        }}
        action={
          <Button variant="contained" color="error" onClick={() => handleDelete(confirm.id)}>
            {t("Delete")}
          </Button>
        }
      />
      <UserDocumentCreateUpdate
        reload={reload}
        open={openDialog}
        onClose={handleCloseDialog}
        user_id={id}
      />
    </>
  );
}
