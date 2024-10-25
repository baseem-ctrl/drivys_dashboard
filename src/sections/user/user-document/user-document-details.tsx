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
import Switch from '@mui/material/Switch';

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

export default function UserDocumentDetails({ documents, reload }: Props) {
  const [editMode, setEditMode] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [docID, setDocID] = useState<number | null>(null);
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
      setValue('title', document.title || '');
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
      console.log('formData', formData);
      updatedDocument.append('doc_id', document.id);
      updatedDocument.append('title', formData.title || document.title);
      updatedDocument.append('session_no', formData.session || document.session_no);
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
      enqueueSnackbar(error.message || 'An error occurred while updating.', { variant: 'error' });
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
      <Stack component={Card} spacing={1} sx={{ p: 3 }}>
        <Scrollbar>
          {documents &&
          documents[0]?.user?.user_docs &&
          documents[0]?.user?.user_docs.length > 0 ? (
            <Grid spacing={1}>
              {documents[0].user.user_docs.map((doc, index) => (
                <Grid item xs={12} sm={6} key={doc.id} sx={{ fontSize: '12px' }}>
                  <Stack
                    component={Card}
                    spacing={1}
                    sx={{
                      //   mb: 3,
                      border: '1px solid #ccc',
                      p: 2,
                      borderRadius: '4px',
                      position: 'relative',
                      height: 'auto',
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
                          //   padding: 2,
                          width: '100%',
                          //   height: '590px',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            marginRight: 2,
                            fontSize: '16px',
                            alignSelf: 'flex-start',
                            marginBottom: 3,
                          }}
                        >
                          Document Details:
                        </Typography>
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
                              padding: 1,
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
                              padding: 1,
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
                                {doc?.created_at ? doc.created_at : 'N/A'}
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
                              Document File
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
                              {doc.doc_file ?? 'N/A'}
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
                              padding: 1,
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
                              padding: 1,
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
                              <Switch checked={doc.is_approved === 1} color="primary" />
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
                          height: '570px',
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
                                display: 'flex',
                              },
                            }}
                            onClick={() => document.getElementById('imageUpload')?.click()}
                          >
                            <input
                              id="imageUpload"
                              type="file"
                              accept={acceptedFileTypes}
                              style={{ display: 'none' }}
                              onChange={handleImageUpload}
                            />
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
                            <div
                              className="overlay"
                              style={{
                                display: 'none',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: '#fff',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="body2">Click to upload new image</Typography>
                            </div>
                          </Box>
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
                          <Controller
                            name="title"
                            control={control}
                            defaultValue={doc.title}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Title"
                                variant="outlined"
                                required
                                sx={{ width: '100%' }}
                              />
                            )}
                          />
                          <Controller
                            name="file"
                            control={control}
                            defaultValue={doc.file}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="File Name"
                                variant="outlined"
                                required
                                sx={{ width: '100%' }}
                                disabled
                              />
                            )}
                          />
                          <Controller
                            name="type"
                            control={control}
                            defaultValue={doc.type}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Type"
                                variant="outlined"
                                required
                                sx={{ width: '100%' }}
                                disabled
                              />
                            )}
                          />
                          <Controller
                            name="status"
                            control={control}
                            defaultValue={doc.status}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Status"
                                variant="outlined"
                                required
                                sx={{ width: '100%' }}
                              />
                            )}
                          />
                          <Controller
                            name="session_no"
                            control={control}
                            defaultValue={doc.session_no}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Session No."
                                variant="outlined"
                                required
                                sx={{ width: '100%' }}
                              />
                            )}
                          />
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="space-between"
                          sx={{ mt: 2 }}
                        >
                          <Button variant="contained" type="submit">
                            Save
                          </Button>
                          <Button variant="outlined" onClick={() => setEditMode(-1)}>
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
            <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.disabled' }}>
              No documents found.
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
