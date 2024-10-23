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
  const [confirm, setConfirm] = useState({
    value: false,
    onFalse: () => setConfirm({ ...confirm, value: false }),
  });
  console.log('sessionNumber', sessionNumber);
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
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(DocumentSchema) as any,
    defaultValues: editMode !== null ? defaultDocumentValues(documents[editMode]) : {},
  });

  useEffect(() => {
    if (editMode !== null && documents[editMode]) {
      const document = documents[editMode];
      setValue('title', document.title || '');
      setValue('status', document.status || '');
      setValue('file', document.file || '');
      setValue('session', document.session_no || '');
      //   setValue('file', document.file || '');
      setFilePreviewURL(document.file || '');
      console.log('document.file', document.file);
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
      console.log('formData', formData);

      const updatedDocument = new FormData();
      if (formData.file) {
        updatedDocument.append('file', formData.file);
      }

      updatedDocument.append('doc_id', document.id);
      updatedDocument.append('title', formData.title || document.title);
      updatedDocument.append('session_no', formData.session || document.session_no);
      updatedDocument.append('type', document.type);
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
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
    setEditMode(null);
  };
  console.log('documents', documents);
  return (
    <>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        <Scrollbar>
          {documents && documents.length > 0 ? (
            <Grid container spacing={3}>
              {documents.map((doc, index) => (
                <Grid item xs={12} sm={6} key={doc.id}>
                  <Stack
                    component={Card}
                    spacing={3}
                    sx={{
                      mb: 3,
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
                          padding: 2,
                          width: '100%',
                          height: '360px',
                        }}
                      >
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
                              File
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
                          height: '340px',
                          width: '100%',
                        }}
                      >
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
                        <Controller
                          name="file"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const fileURL = URL.createObjectURL(file);
                                  setFilePreviewURL(fileURL);
                                  field.onChange(file);
                                }
                              }}
                              accept=".jpg,.jpeg,.png,.pdf,.mp4"
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
