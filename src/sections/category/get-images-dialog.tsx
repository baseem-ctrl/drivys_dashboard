
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CardContent from '@mui/material/CardContent';
import Iconify from 'src/components/iconify';
import { deleteCategory } from 'src/api/category';
import { enqueueSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  allImages?: any;
  deleteId?: any;
  reload?: any;
};

export default function ImagesPerCategoryView({ open, onClose, allImages, deleteId, reload }: Props) {

  const handleDelete = async (id: string) => {
    try {
      // Call your delete API
      const response = await deleteCategory(deleteId, id);
      enqueueSnackbar(response?.message)
      reload()
      // Update the UI or state after successful deletion
      console.log('Image deleted:', id);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };


  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >

      <DialogTitle>All Image View</DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ p: 2 }}>


          {allImages.map((row: any) => (
            <Grid item xs={12} sm={6} md={4} key={row.id}>
              <Box
                sx={{
                  position: 'relative',
                }}
              >

                <CardContent >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box sx={{ position: 'relative', width: '90%', height: '100%' }}>
                        {/* Image */}
                        <img
                          alt={row?.description}
                          src={row?.virtual_path}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            cursor: 'pointer',
                          }}
                        />

                        {/* Delete Icon */}
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -5,
                            left: -5,
                            backgroundColor: 'white',
                            '&:hover': {
                              backgroundColor: 'lightgrey',
                            },
                          }}
                          onClick={() => handleDelete(row.id)} // Trigger the delete action
                        >
                          <Iconify color="#7635dc" icon="solar:minus-circle-linear" sx={{ width: "15px", height: '15px' }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Box>
            </Grid>
          ))}
        </Grid>

      </DialogContent>

    </Dialog>
  );
}
