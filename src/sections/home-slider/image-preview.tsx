import {
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material'; // Delete icon from MUI
import { useGetAllImages } from 'src/api/all-image';
import { styled } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { deleteHomeSliderImage } from 'src/api/home-slider';
import { enqueueSnackbar } from 'src/components/snackbar';

type ImagePreviewProps = {
  selectedImageIds: number[];
  isUpdate: boolean;
  setSelectedImageIds: React.Dispatch<React.SetStateAction<number[]>>; // To manage the selected IDs
  reload?: any;
};

// Styled Box to position the delete icon at the top-right corner
const DeleteIconWrapper = styled(Box)({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '50%',
});

export default function ImagePreview({
  selectedImageIds,
  setSelectedImageIds,
  isUpdate,
  selectedImageArray,
  reload,
}: ImagePreviewProps) {
  const { allImages } = useGetAllImages(0, 1000);

  // Filter out the images that match the selectedImageIds
  const selectedImages = allImages?.filter((image) => selectedImageIds?.includes(image.id)) || [];

  // To delete the images that we get from getById api
  const handleDeleteUploadedImage = async (deleteId) => {
    try {

      const response = await deleteHomeSliderImage(deleteId);
      if (response) {
        enqueueSnackbar(response?.message, { variant: 'success' });
        reload();
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(selectedImages, selectedImageArray, 'selectedImages');

  // Function to handle the removal of an image ID from the selected list


  const handleRemoveImage = (id: number, index: number) => {
    const deleteId = selectedImageArray?.find(item => Number(item?.picture_id) === id)?.id
    console.log(selectedImageArray, id, deleteId, "deleteId");

    if (isUpdate && deleteId) {

      handleDeleteUploadedImage(deleteId)
    }
    setSelectedImageIds((prevSelected) => prevSelected.filter((imageId) => imageId !== id));
  };

  if (selectedImageIds?.length === 0 || selectedImages?.length === 0) {
    return <Typography>No images selected</Typography>;
  }
  console.log(selectedImages, "selectedImages");

  return (
    <Box mt={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Selected Images
      </Typography>
      <Grid container spacing={2}>
        {selectedImages?.map((image, index) => (
          <Grid item xs={12} sm={6} md={isUpdate ? 6 : 3} key={image.id}>
            <Card sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
              {/* Delete Icon with Tooltip */}
              <DeleteIconWrapper>
                <Tooltip title="Remove Image">
                  <IconButton onClick={() => handleRemoveImage(image.id, index)} size="small">
                    <Iconify icon="clarity:remove-line" />
                  </IconButton>
                </Tooltip>
              </DeleteIconWrapper>

              {/* Image Preview */}
              <CardMedia
                component="img"
                src={image?.virtual_path} // Assuming 'virtual_path' holds the URL of the image
                alt={`Image ${image?.id}`}
                sx={{
                  height: 200,
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />

              {/* Optional Image Info */}
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {image?.name || `Image ${image.id}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
