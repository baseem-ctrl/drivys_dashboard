// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Iconify from 'src/components/iconify';
import { Box, Button, TextField, Menu, MenuItem, FormControlLabel } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { Select, FormControl, InputLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { createOrUpdatePackageDocument, deletePackageDocumentById } from 'src/api/packageDocument';
import Switch from '@mui/material/Switch';
import { createUserDocument, deleteUserDocumentById } from 'src/api/user-document';
import UserDocumentCreateUpdate from './user-document-create-form';

type Document = {
  id: number;
  package_id: string;
  title: string;
  description?: string;
  file: File | null;
  type: string;
  status: string;
  session_no: string;
};

type Props = {
  documents: Document[];
  loading?: boolean;
  reload: VoidFunction;
};

export default function UserDocumentDetails({ id, documents, reload }: Props) {
  const [editMode, setEditMode] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [docID, setDocID] = useState<number | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const [filePreviewURL, setFilePreviewURL] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  //   console.log('documents', documents[0]);

  // Function to handle image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setFilePreviewURL(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };
  console.log('documentsdocumentsdocuments', documents);
  const [confirm, setConfirm] = useState({
    value: false,
    onFalse: () => setConfirm({ ...confirm, value: false }),
  });
  const DocumentSchema = Yup.object().shape({
    title: Yup.string(),
    description: Yup.string(),
    file: Yup.mixed(),
  });

  const defaultDocumentValues = (details: Document) => ({
    title: details.title || '',
    description: details.description || '',
    file: null,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(DocumentSchema) as any,
    defaultValues: editMode !== null ? defaultDocumentValues(documents[editMode]) : {},
  });
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
  useEffect(() => {
    if (editMode !== null && documents[editMode]) {
      const document = documents[editMode];
      setValue('doc', document.title || '');
      setValue('status', document.status || '');
      setValue('type', document.type || '');
      setValue('file', document.file || '');
      setValue('session', document.session_no || '');
      setValue('file', document.file || '');
      setIsApproved(document.is_approved === 0 ? false : true);
      // setFilePreviewURL(document.file || '');
    }
  }, [documents, editMode]);
  const handleCancel = () => {
    reset();
    setEditMode(null);
  };
  const handleClickEdit = () => {
    setEditMode(editIndex);
    setAnchorEl(null);
  };
  function convertToCustomFormat(dateString) {
    const date = new Date(dateString);

    // Get day, month, year, hours, and minutes
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    const hours = String(date.getHours()).padStart(2, '0'); // Ensure two digits
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Ensure two digits

    // Return formatted string
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  const handleClickEditPackageDocument = async (formData: any, document: any) => {
    try {
      const updatedDocument = new FormData();
      // if (filePreviewURL) {
      //   updatedDocument.append('file', filePreviewURL);
      // }
      console.log('document.doc_id', document.doc_id);
      console.log('formData', formData);
      // updatedDocument.append('user_id', id);
      if (formData.doc_type) {
        updatedDocument.append('doc_type', formData.doc_type);
      }
      if (formData.doc_side) {
        updatedDocument.append('doc_side', formData.doc_side);
      }
      if (formData.doc_file) {
        updatedDocument.append('doc_file', formData.doc_file);
      }
      if (formData.expiry) {
        updatedDocument.append('expiry', formData.expiry);
      }
      const is_approved = isApproved ? 1 : 0;

      updatedDocument.append('is_approved', is_approved);

      updatedDocument.append('doc_id', document.id);

      // Now pass this `updatedDocument` to the API
      const response = await createUserDocument(updatedDocument);

      if (response) {
        reload();
        enqueueSnackbar('Document updated successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to update document!', { variant: 'error' });
      }
    } catch (error: any) {
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
      setEditMode(null);
      reload();
    }
  };
  // Handle delete document
  const handleDelete = async (id: number) => {
    setAnchorEl(null);
    try {
      const response = await deleteUserDocumentById(id);

      if (response) {
        enqueueSnackbar('Document deleted successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to delete document!', { variant: 'error' });
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
  const docTypeOptions = [
    { value: 'Card', label: 'Card' },
    { value: 'ID', label: 'ID' },
    { value: 'Passport', label: 'Passport' },
    { value: 'License', label: 'License' },
  ];

  const docSideOptions = [
    { value: 'Front', label: 'Front' },
    { value: 'Back', label: 'Back' },
  ];

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 7,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenDialog}
        >
          Add user document
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
                            fontSize: '16px',
                            alignSelf: 'flex-start',
                          }}
                        >
                          Document Details:
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
                              Approved at
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 15 }}
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
                              Approved by
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Tooltip title={doc?.file ?? 'N/A'} arrow>
                              <Typography
                                sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 15 }}
                              >
                                {doc?.approved_by ?? 'N/A'}
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
                              Created at
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Tooltip title={doc?.file ?? 'N/A'} arrow>
                              <Typography
                                sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 15 }}
                              >
                                {doc?.created_at ? convertToCustomFormat(doc.created_at) : 'N/A'}
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
                              Document File
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
                                sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 15 }}
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
                              Document Side
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 15 }}
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
                              Document Type
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 15 }}
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
                              Approved
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
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack
                        component="form"
                        spacing={3}
                        onSubmit={handleSubmit((data) => handleClickEditPackageDocument(data, doc))}
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
                        <Stack
                          spacing={4}
                          alignItems="flex-start"
                          sx={{ typography: 'body2', width: '100%' }}
                        >
                          <Controller
                            name="doc_type"
                            control={control}
                            defaultValue={doc.doc_type}
                            render={({ field }) => (
                              <FormControl variant="outlined" sx={{ width: '100%' }}>
                                <InputLabel>Document Type</InputLabel>
                                <Select {...field} label="Document Type">
                                  {docTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          />
                          <Controller
                            name="doc_side"
                            control={control}
                            defaultValue={doc.doc_side}
                            render={({ field }) => (
                              <FormControl variant="outlined" sx={{ width: '100%' }}>
                                <InputLabel>Document Side</InputLabel>
                                <Select {...field} label="Document Side">
                                  {docSideOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          />
                          <Controller
                            name="doc_file"
                            control={control}
                            defaultValue={doc.doc_file}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Document File"
                                variant="outlined"
                                sx={{ width: '100%' }}
                              />
                            )}
                          />
                          <Controller
                            name="expiry"
                            control={control}
                            defaultValue={doc.expiry}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Expiry"
                                type="date"
                                variant="outlined"
                                sx={{ width: '100%' }}
                                InputLabelProps={{ shrink: true }}
                              />
                            )}
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={isApproved}
                                color="primary"
                                onChange={handleSwitchChange}
                              />
                            }
                            label="Approved"
                          />
                        </Stack>
                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                          <Button variant="contained" type="submit">
                            Save
                          </Button>
                          <Button variant="outlined" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="h8" sx={{ textAlign: 'teft', ml: 2, color: '#CF5A0D' }}>
              No documents found for this user. You can add a document by clicking on Add Document.
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
        <MenuItem onClick={handleClickEdit}>Edit</MenuItem>
        <MenuItem onClick={() => openDeleteDialog(docID)}>Delete</MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => setConfirm({ ...confirm, value: false })}
        title="Delete"
        content="Are you sure you want to delete?"
        onConfirm={() => {
          handleDelete(confirm.id);
          setConfirm({ ...confirm, value: false });
        }}
        action={
          <Button variant="contained" color="error" onClick={() => handleDelete(confirm.id)}>
            Delete
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
