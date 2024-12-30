import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
// types
import { ImageItem } from 'src/types/user';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';
import { createImageMultiple, useGetAllImages } from 'src/api/all-image';
import { TablePaginationCustom, useTable } from '../table';
import { CircularProgress, Grid, TableCell } from '@mui/material';
import ImageTableRow from './image-table-row';
import { useBoolean } from 'src/hooks/use-boolean';
import NewImagesForm from './new-image-upload-dialog';
import { CustomFile } from '../upload';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentImage?: ImageItem;
  selectedImageIds?: any;
  setSelectedImageIds?: any;
  apiCall?: any;
  isSubmitting?: any;
};

export default function AllImagesForm({
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

  const {
    reset,
    handleSubmit,
    // formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const values = watch();

  const table = useTable({ defaultRowsPerPage: 5 });

  const { allImages, allImagesLoading, totalpages, revalidateAllImages, allImagesError } =
    useGetAllImages(table.page, table.rowsPerPage);

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (allImages?.length) {
      setTableData(allImages);
    } else {
      setTableData([]);
    }
  }, [allImages]);

  const onSubmit = handleSubmit(async (data) => {
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
  }, [images]); // The effect will run whenever `images` changes

  const handleImagesChange = async (images: string | any[] | CustomFile | null) => {
    try {
      const formData = new FormData();

      // Iterate over containers and append data to FormData
      images?.map((image: any, index: number) => {
        if (image) {
          formData.append(`pictures[${index}]`, image);
        }
      });

      // Submit the form data
      const response = await createImageMultiple(formData);

      // Reset the form and close the dialog
      reset();
      revalidateAllImages();
      enqueueSnackbar(response.message);
    } catch (error) {
      console.error(error);
      if (error.errors) {
        // Iterate over each error and enqueue them in the snackbar
        Object.values(error.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
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
      PaperProps={{
        sx: { maxWidth: 720, zIndex: 1300 }, // Ensure this modal is below the new image upload modal
      }}
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
                  noPreview={true}
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
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Create
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
