// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Iconify from 'src/components/iconify';
import { Box, Button, TextField, Menu, MenuItem } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { createOrUpdatePackageDocument, deletePackageDocumentById } from 'src/api/packageDocument';

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

export default function PackageDocumentDetails({
  documents,
  loading,
  reload,
  sessionNumber,
}: Props) {
  const [editMode, setEditMode] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [docID, setDocID] = useState<number | null>(null);
  const [filePreviewURL, setFilePreviewURL] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  // Function to handle image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setFilePreviewURL(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };
  const handleClickFileUpload = () => {
    const inputElement = document.getElementById('iconUpload');
    if (inputElement) {
      inputElement.click();
      inputElement.onchange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
          setUploadedFile(file);
        }
      };
    }
  };

  const [confirm, setConfirm] = useState({
    value: false,
    onFalse: () => setConfirm({ ...confirm, value: false }),
  });
  const DocumentSchema = Yup.object().shape({
    title: Yup.string(),
    description: Yup.string(),
    file: Yup.mixed(),
    session: Yup.number()
      .max(sessionNumber, `Session number cannot exceed ${sessionNumber}.`)
      .required('Session number is required'),
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
      setValue('title', document.title || '');
      setValue('description', document.description || '');
      setValue('status', document.status || '');
      setValue('type', document.type || '');
      setValue('file', document.file || '');
      setValue('session', document.session_no || '');
      setValue('file', document.file || '');
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
  const handleClickEditPackageDocument = async (formData: any, document: any) => {
    try {
      const updatedDocument = new FormData();
      if (filePreviewURL) {
        updatedDocument.append('file', filePreviewURL);
      }
      if (uploadedFile) {
        updatedDocument.append('icon', uploadedFile);
      }
      console.log('formData', formData);
      updatedDocument.append('doc_id', document.id);
      updatedDocument.append('title', formData.title || document.title);
      updatedDocument.append('session_no', formData.session || document.session_no);
      updatedDocument.append('description', formData.description || document.description);
      updatedDocument.append('type', formData.type || document.type);
      updatedDocument.append('status', formData.status || document.status);

      // Now pass this `updatedDocument` to the API
      const response = await createOrUpdatePackageDocument(updatedDocument);

      if (response) {
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
      const response = await deletePackageDocumentById(id);

      if (response) {
        enqueueSnackbar('Document deleted successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to delete document!', { variant: 'error' });
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'An error occurred while deleting.', { variant: 'error' });
    } finally {
      reload();
      setSelectedImage(null);
    }
  };
  const openDeleteDialog = (id: number) => {
    setConfirm({ value: true, id });
  };

  // Handle menu open
  const handleClick = (event: React.MouseEvent<HTMLElement>, index: number, docId: number) => {
    setAnchorEl(event.currentTarget);
    setEditIndex(index);
    setDocID(docId);
  };
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];
  const typeOptions = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
  ];
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
    setEditMode(null);
  };
  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Scrollbar>
          {documents && documents.length > 0 ? (
            <Grid container>
              {documents.map((doc, index) => (
                <Grid item xs={12} sm={6} key={doc.id}>
                  <Stack
                    component={Card}
                    spacing={3}
                    sx={{
                      mb: 3,

                      p: 5,
                      borderRadius: '10px',
                      position: 'relative',
                      height: 'auto',
                      ml: 1,
                      mt: 1,
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
                          height: '690px',
                        }}
                      >
                        <Stack
                          spacing={2}
                          alignItems="center"
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 2,
                            width: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              width: 140,
                              height: 140,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '2px solid #ccc',
                            }}
                            // onClick={() => document.getElementById('imageUpload')?.click()} // Triggers file input on click
                          >
                            {doc.file && doc.type === 'image' ? (
                              <img
                                src={doc.file}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : doc.type === 'image' ? (
                              <span
                                style={{
                                  fontSize: '16px',
                                  color: '#999',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                }}
                              >
                                No Image
                              </span>
                            ) : (
                              <span
                                style={{
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: '#999',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                }}
                                onClick={() => handleFileClick(doc.file)}
                              >
                                Click to open
                              </span>
                            )}
                          </Box>

                          <input
                            id="imageUpload"
                            type="file"
                            accept={acceptedFileTypes}
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                          />
                          {doc.type === 'pdf' ||
                            (doc.type === 'video' && (
                              <Typography
                                sx={{
                                  mt: 3,
                                  fontSize: '14px',
                                  mx: 'auto',
                                  display: 'block',
                                  textAlign: 'center',
                                  color: 'text.disabled',
                                }}
                              >
                                Preview unavailable for videos and PDFs. Click here to view the
                                uploaded file
                              </Typography>
                            ))}
                        </Stack>

                        <Stack
                          spacing={2}
                          alignItems="flex-start"
                          sx={{ typography: 'body2', padding: 2, width: '100%' }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              padding: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              Title
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
                              {doc.title ?? 'N/A'}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              padding: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              Description
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
                              {doc.description ?? 'N/A'}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              padding: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              File Name
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
                                {doc?.file
                                  ? `${doc.file.slice(0, 8)}...${doc.file.slice(-13)}`
                                  : doc?.file ?? 'N/A'}
                              </Typography>
                            </Tooltip>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              padding: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              Icon
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Typography
                              sx={{
                                textAlign: 'left',
                                marginLeft: 2,
                                fontSize: 15,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                              onClick={() => window.open(doc?.icon?.virtual_path, '_blank')}
                            >
                              {doc?.icon?.virtual_path
                                ? doc.icon.virtual_path.length > 10
                                  ? `${doc.icon.virtual_path.slice(
                                      0,
                                      8
                                    )}...${doc.icon.virtual_path.slice(-14)}`
                                  : doc.icon.virtual_path
                                : 'N/A'}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              padding: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              Type
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
                                {doc?.type ? doc.type : 'N/A'}
                              </Typography>
                            </Tooltip>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              padding: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              Status
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
                              {doc.status ?? 'N/A'}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              borderRadius: 1,
                              padding: 1,
                              backgroundColor: 'background.default',
                            }}
                          >
                            <Typography
                              sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                            >
                              Session No.
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
                              {doc.session_no ?? 'N/A'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack
                        component="form"
                        spacing={3}
                        onSubmit={handleSubmit((data) => handleClickEditPackageDocument(data, doc))} // Pass form data to the handleClickEditPackageDocument function
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          marginTop: '20px',
                          height: '720px',
                          width: '100%',
                        }}
                      >
                        <Stack
                          spacing={2}
                          alignItems="center"
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 2,
                            width: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              width: 140,
                              height: 140,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '2px solid #ccc',
                              cursor: 'pointer',
                              '&:hover .overlay': {
                                display: 'flex', // Show overlay on hover
                              },
                            }}
                            onClick={() => document.getElementById('imageUpload')?.click()} // Triggers file input on click
                          >
                            {selectedImage || (doc.file && doc.type === 'image') ? (
                              <img
                                src={selectedImage || doc.file}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span
                                style={{
                                  fontSize: '16px',
                                  color: '#999',
                                  display: 'flex',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                }}
                              >
                                No Image
                              </span>
                            )}

                            <Box
                              className="overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(22, 28, 36, 0.64);',
                                display: 'none',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                lineHeight: 1.5,
                                fontSize: '0.75rem',
                                fontFamily: 'Public Sans, sans-serif',
                              }}
                            >
                              Update photo
                            </Box>
                          </Box>

                          <input
                            id="imageUpload"
                            type="file"
                            accept={acceptedFileTypes}
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                          />
                        </Stack>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            borderRadius: 1,
                            padding: 1,
                            backgroundColor: 'background.default',
                          }}
                          onClick={handleClickFileUpload}
                        >
                          <Typography sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}>
                            Icon
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                          >
                            :
                          </Typography>
                          <Typography
                            sx={{
                              textAlign: 'left',
                              marginLeft: 2,
                              fontSize: 15,
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            {uploadedFile
                              ? uploadedFile.name
                              : `${doc.icon.virtual_path.slice(
                                  0,
                                  8
                                )}...${doc.icon.virtual_path.slice(-14)}`}
                          </Typography>
                        </Box>
                        <input
                          id="iconUpload"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleClickFileUpload}
                        />

                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Title"
                              variant="outlined"
                              error={Boolean(errors.title)}
                              helperText={errors.title?.message}
                            />
                          )}
                        />
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Description"
                              variant="outlined"
                              error={Boolean(errors.description)}
                              helperText={errors.description?.message}
                            />
                          )}
                        />
                        <Controller
                          name="status"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <TextField
                              {...field}
                              select
                              label="Status"
                              variant="outlined"
                              fullWidth
                              error={Boolean(errors.status)}
                              helperText={errors.status?.message}
                            >
                              {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                        <Controller
                          name="type"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <TextField
                              {...field}
                              select
                              label="Type"
                              variant="outlined"
                              fullWidth
                              error={Boolean(errors.type)}
                              helperText={errors.type?.message}
                            >
                              {typeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                        <Controller
                          name="session"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Session"
                              variant="outlined"
                              error={Boolean(errors.session)}
                              helperText={errors.session?.message}
                            />
                          )}
                        />

                        <Stack direction="row" justifyContent="flex-end" spacing={2} marginTop={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={isSubmitting}
                          >
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
            <Typography variant="h6" align="center">
              No documents available.
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
    </>
  );
}
