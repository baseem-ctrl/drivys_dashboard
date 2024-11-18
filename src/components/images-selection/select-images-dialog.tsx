import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { CircularProgress, Grid } from '@mui/material';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload } from 'src/components/hook-form';
import { createImageMultiple, useGetAllImages } from 'src/api/all-image';
import { TablePaginationCustom, useTable } from '../table';
import ImageTableRow from './image-table-row';
import { CustomFile } from '../upload';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentImage?: any;
  selectedImageIds: number[];
  setSelectedImageIds: React.Dispatch<React.SetStateAction<number[]>>;
  apiCall: () => void;
  isSubmitting: boolean;
};

export default function ImagesSelectionForm({
  currentImage,
  open,
  onClose,
  setSelectedImageIds,
  selectedImageIds,
  apiCall,
  isSubmitting,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    images: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      images: currentImage?.coverUrl || null,
    }),
    [currentImage]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });

  const { reset, handleSubmit, setValue, watch } = methods;
  const values = watch();
  const table = useTable({ defaultRowsPerPage: 5 });

  const { allImages, allImagesLoading, totalpages, revalidateAllImages } = useGetAllImages(
    table.page,
    table.rowsPerPage
  );

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (allImages?.length) {
      setTableData(allImages);
    } else {
      setTableData([]);
    }
  }, [allImages]);

  const onSubmit = handleSubmit(async () => {
    try {
      apiCall();
      setSelectedImageIds([]);
    } catch (error) {
      console.error(error);
    }
  });

  const images = watch('images');

  useEffect(() => {
    if (images?.length > 0) {
      handleImagesChange(images);
    }
  }, [images]);

  const handleImagesChange = async (images: CustomFile[] | null) => {
    try {
      const formData = new FormData();

      images?.forEach((image, index) => {
        formData.append(`pictures[${index}]`, image);
      });

      const response = await createImageMultiple(formData);

      reset();
      revalidateAllImages();
      enqueueSnackbar(response.message);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const files = values.images || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 720, zIndex: 1300 } }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Select images</DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ p: 2 }}>
            <Grid item xs={12}>
              <Stack spacing={1.5}>
                <RHFUpload
                  multiple
                  thumbnail
                  name="images"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  onUpload={() => console.info('ON UPLOAD')}
                  noPreview
                />
              </Stack>
            </Grid>

            {allImagesLoading && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'center', margin: '10px' }}>
                  <CircularProgress />
                </Box>
              </Grid>
            )}

            {tableData.map((row: any) => (
              <Grid item xs={12} sm={6} md={4} key={row.id}>
                <ImageTableRow
                  row={row}
                  setSelectedImageIds={setSelectedImageIds}
                  selectedImageIds={selectedImageIds}
                  reload={revalidateAllImages}
                />
              </Grid>
            ))}
          </Grid>
          <TablePaginationCustom
            count={totalpages}
            page={table.page ?? 0}
            rowsPerPage={table?.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </DialogContent>

        <DialogActions>
          {/* <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button> */}

          <LoadingButton onClick={onClose} variant="contained" loading={isSubmitting}>
            Done
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
