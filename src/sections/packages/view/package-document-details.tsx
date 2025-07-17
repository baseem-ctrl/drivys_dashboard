// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Iconify from 'src/components/iconify';
import { Box, Button, TextField, Menu, MenuItem } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'src/components/snackbar';
import { useGetAllLanguage } from 'src/api/language';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { createOrUpdatePackageDocument, deletePackageDocumentById } from 'src/api/packageDocument';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [docID, setDocID] = useState<number | null>(null);
  const [filePreviewURL, setFilePreviewURL] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const { language } = useGetAllLanguage(0, 1000);
  const [selectedLocale, setSelectedLocale] = useState<string | null>('en');

  const localeOptions = language?.map((item: any) => ({
    label: item.language_culture,
    value: item.language_culture,
  }));

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
    translations: Yup.array()
      .of(
        Yup.object().shape({
          locale: Yup.string().required('Locale is required'),
          title: Yup.string().default(t('n/a')).required('Title is required'),
          description: Yup.string().default(t('n/a')).required('Description is required'),
        })
      )
      .min(1),
    type: Yup.string(),
    status: Yup.string(),
    session_no: Yup.number().when([], {
      is: () => sessionNumber === -1,
      then: (schema) => schema.required('Session number is required'),
      otherwise: (schema) =>
        schema
          .max(sessionNumber, `Session number cannot exceed ${sessionNumber}.`)
          .required('Session number is required'),
    }),
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
      setValue('session_no', document.session_no || '');
      setValue('file', document.file || '');
      if (document.package_doc_translations && document.package_doc_translations.length > 0) {
        setValue('locale', document.package_doc_translations[0].locale || 'En');
      }

      // setFilePreviewURL(document.file || '');
    }
  }, [documents, editMode]);
  const handleCancel = () => {
    reset();
    setEditMode(null);
  };
  const selectedLang = watch('locale');

  useEffect(() => {
    if (selectedLang) {
      const translation = documents[0].package_doc_translations.find(
        (translation) => translation.locale.toLowerCase() === selectedLang.toLowerCase()
      );
      if (translation) {
        setValue('title', translation.title || '');
        setValue('description', translation.description || '');
      } else {
        setValue('title', '');
        setValue('description', '');
      }
    }
  }, [selectedLang, documents, setValue, editMode]);
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

      // Basic document fields
      updatedDocument.append('doc_id', document.id);
      updatedDocument.append('package_id', document.package_id);
      updatedDocument.append('session_no', formData.session_no || document.session_no);
      updatedDocument.append('type', formData.type || document.type);
      updatedDocument.append('status', formData.status || document.status);

      const existingTranslations = document.package_doc_translations || [];
      const formLocale = formData.locale;

      const existingIndex = existingTranslations.findIndex((t: any) => t.locale === formLocale);
      if (existingIndex !== -1) {
        updatedDocument.append(`translations[${existingIndex}][locale]`, formLocale);
        updatedDocument.append(`translations[${existingIndex}][title]`, formData.title);
        updatedDocument.append(`translations[${existingIndex}][description]`, formData.description);
      } else {
        // If locale is not there then add at next available index
        const newIndex = existingTranslations.length;
        updatedDocument.append(`translations[${newIndex}][locale]`, formLocale);
        updatedDocument.append(`translations[${newIndex}][title]`, formData.title);
        updatedDocument.append(`translations[${newIndex}][description]`, formData.description);
      }

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
      <Stack spacing={3} sx={{ p: 0 }}>
        <Scrollbar>
          {documents && documents.length > 0 ? (
            <Grid container>
              {documents.map((doc, index) => (
                <Grid item xs={12} lg={6} key={doc.id}>
                  <Stack
                    component={Card}
                    spacing={3}
                    sx={{
                      mb: 3,

                      p: 2,
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
                          overflowY: 'auto',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          '&::-webkit-scrollbar': {
                            display: 'none',
                          },
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
                                  fontSize: '18px',
                                  color: '#999',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                }}
                              >
                                {t('No Image')}
                              </span>
                            ) : (
                              <span
                                style={{
                                  cursor: 'pointer',
                                  fontSize: '16px',
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
                                {t('Click to open')}
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
                                  fontSize: '16px',
                                  mx: 'auto',
                                  display: 'block',
                                  textAlign: 'center',
                                  color: 'text.disabled',
                                }}
                              >
                                {t(
                                  'Preview unavailable for videos and PDFs. Click here to view the uploaded file'
                                )}
                              </Typography>
                            ))}
                        </Stack>

                        <Stack
                          spacing={2}
                          alignItems="flex-start"
                          sx={{ typography: 'body2', padding: 2, width: '100%' }}
                        >
                          {doc.package_doc_translations?.length > 0 ? (
                            doc.package_doc_translations.map((translation) => (
                              <React.Fragment key={translation.locale}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    borderRadius: 1,
                                    padding: 1,
                                    backgroundColor: 'background.default',
                                    mb: 1,
                                  }}
                                >
                                  <Typography
                                    sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                                  >
                                    {t('Title')} ({translation.locale})
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                                  >
                                    :
                                  </Typography>
                                  <Typography
                                    sx={{
                                      flex: '1',
                                      textAlign: 'left',
                                      marginLeft: 2,
                                      fontSize: 17,
                                    }}
                                  >
                                    {translation.title || t('n/a')}
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
                                    mb: 2,
                                  }}
                                >
                                  <Typography
                                    sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                                  >
                                    {t('Description')} ({translation.locale})
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                                  >
                                    :
                                  </Typography>
                                  <Typography
                                    sx={{
                                      flex: '1',
                                      textAlign: 'left',
                                      marginLeft: 2,
                                      fontSize: 17,
                                    }}
                                  >
                                    {translation.description || t('n/a')}
                                  </Typography>
                                </Box>
                              </React.Fragment>
                            ))
                          ) : (
                            <>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  width: '100%',
                                  borderRadius: 1,
                                  padding: 1,
                                  backgroundColor: 'background.default',
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                                >
                                  {t('Title')}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 'bold', flex: '0 0 5%', marginRight: 2 }}
                                >
                                  :
                                </Typography>
                                <Typography
                                  sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                                >
                                  {doc.title || t('n/a')}
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
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  sx={{ fontWeight: 'bold', flex: '0 0 30%', marginRight: 2 }}
                                >
                                  {t('Description')}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 'bold', flex: '0 0 5%', marginRight: 2 }}
                                >
                                  :
                                </Typography>
                                <Typography
                                  sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                                >
                                  {doc.description || t('n/a')}
                                </Typography>
                              </Box>
                            </>
                          )}
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
                              {t('File Name')}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Tooltip title={doc?.file ?? t('n/a')} arrow>
                              <Typography
                                sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                              >
                                {doc?.file
                                  ? `${doc.file.slice(0, 8)}...${doc.file.slice(-13)}`
                                  : doc?.file ?? t('n/a')}
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
                              {t('Icon')}
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
                                fontSize: 17,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                              onClick={() => window.open(doc?.icon?.virtual_path, '_blank')}
                            >
                              {doc?.icon?.virtual_path
                                ? doc?.icon?.virtual_path.length > 10
                                  ? `${doc?.icon?.virtual_path.slice(
                                      0,
                                      8
                                    )}...${doc?.icon?.virtual_path.slice(-14)}`
                                  : doc?.icon?.virtual_path
                                : t('n/a')}
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
                              {t('Type')}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', flex: '0 0 20%', marginRight: 2 }}
                            >
                              :
                            </Typography>
                            <Tooltip title={doc?.file ?? t('n/a')} arrow>
                              <Typography
                                sx={{ flex: '1', textAlign: 'left', marginLeft: 2, fontSize: 17 }}
                              >
                                {doc?.type ? doc.type : t('n/a')}
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
                              {t('Status')}
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
                              {doc.status ?? t('n/a')}
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
                              {t('Session No.')}
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
                              {doc.session_no ?? t('n/a')}
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
                          overflowY: 'auto',
                          scrollbarWidth: 'none',
                          '&::-webkit-scrollbar': {
                            display: 'none',
                          },
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
                                  fontSize: '18px',
                                  color: '#999',
                                  display: 'flex',

                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                }}
                              >
                                {t('No Image')}
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
                                fontSize: '0.875rem',
                                fontFamily: 'Public Sans, sans-serif',
                              }}
                            >
                              {t('Update photo')}
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
                            {t('Icon')}
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
                              fontSize: 17,
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            <Typography
                              sx={{
                                textAlign: 'left',
                                marginLeft: 2,
                                fontSize: 17,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                color: 'blue',
                              }}
                            >
                              {uploadedFile
                                ? uploadedFile.name
                                : doc?.icon?.virtual_path
                                ? `${doc.icon.virtual_path.slice(
                                    0,
                                    8
                                  )}...${doc.icon.virtual_path.slice(-14)}`
                                : 'Upload From Here'}
                            </Typography>
                          </Typography>
                        </Box>
                        <input
                          id="iconUpload"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleClickFileUpload}
                        />
                        <Controller
                          name="locale"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              select
                              label={t('Locale')}
                              variant="outlined"
                              fullWidth
                              value={field.value || 'En'}
                              error={Boolean(errors.translations?.[0]?.locale)}
                              helperText={errors.translations?.[0]?.locale?.message}
                            >
                              {localeOptions?.map((option: any) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />

                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('Title')}
                              variant="outlined"
                              error={Boolean(errors.title)}
                              helperText={errors.title?.message}
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        />

                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('Description')}
                              variant="outlined"
                              error={Boolean(errors.description)}
                              helperText={errors.description?.message}
                              InputLabelProps={{ shrink: true }}
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
                              label={t('Status')}
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
                              label={t('Type')}
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
                          name="session_no"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('Session')}
                              variant="outlined"
                              error={Boolean(errors.session_no)}
                              helperText={errors.session_no?.message}
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
                            {t('Save')}
                          </Button>
                          <Button variant="outlined" onClick={handleCancel}>
                            {t('Cancel')}
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
              {t('No documents available.')}
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
        <MenuItem onClick={handleClickEdit}>{t('Edit')}</MenuItem>
        <MenuItem onClick={() => openDeleteDialog(docID)}>{t('Delete')}</MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => setConfirm({ ...confirm, value: false })}
        title={t('Delete')}
        content={t('Are you sure you want to delete?')}
        onConfirm={() => {
          handleDelete(confirm.id);
          setConfirm({ ...confirm, value: false });
        }}
        action={
          <Button variant="contained" color="error" onClick={() => handleDelete(confirm.id)}>
            {t('Delete')}
          </Button>
        }
      />
    </>
  );
}
