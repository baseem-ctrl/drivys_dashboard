import {
  Card,
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
} from '@mui/material';
import { useState } from 'react';
import { createPackageCity, deletePackageCityById } from 'src/api/city';
import PackageCreateEditForm from '../package-create-update-form';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
import { useTable } from 'src/components/table';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CityPackageDetails({ reload, packageDetails, city }) {
  const quickEdit = useBoolean();
  const confirm = useBoolean();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [editMode, setEditMode] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleDeletePackage = async (id) => {
    try {
      const response = await deletePackageCityById(id);
      reload();
      enqueueSnackbar('Package City Mapping Deleted successfully.');
      quickEdit.onFalse();
      confirm.onFalse();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const handleCreatePackage = async (newPackage) => {
    try {
      const response = await createPackageCity(newPackage);
      reload();
      enqueueSnackbar(response.message);
      quickEdit.onFalse();
      setEditMode('');
    } catch (error) {
      setEditMode('');
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  const handleEditPackage = (packageItem) => {
    setEditMode('Edit');
    setSelectedPackage(packageItem);
    quickEdit.onTrue();
    handleClose();
  };

  const handleClick = (event, packageItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedPackageId(packageItem.id);
    setSelectedPackage(packageItem);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (id) => {
    setSelectedPackageId(id);
    confirm.onTrue();
  };

  const handleAddPackageClick = () => {
    setEditMode('');
    setSelectedPackage(null);
    quickEdit.onTrue();
  };

  return (
    <Box>
      <Grid container justifyContent="flex-end" sx={{ marginBottom: '20px' }}>
        {Array.isArray(packageDetails) && packageDetails.length <= 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" align="left" sx={{ color: '#CF5A0D' }}>
              No packages available. Click Add Package to create a new one.
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddPackageClick}
            sx={{
              backgroundColor: '#CF5A0D',
              color: 'white',
              '&:hover': {
                backgroundColor: '#FB8C00',
              },
            }}
          >
            Add Package
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} rowGap={1}>
        {Array.isArray(packageDetails) &&
          packageDetails.map((packageItem) => (
            <Grid item xs={12} sm={6} md={3} key={packageItem.id}>
              <Stack
                component={Card}
                direction="column"
                key={packageItem?.id}
                sx={{
                  marginBottom: '16px',
                  height: '360px',
                  position: 'relative',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 3, pt: 3, pb: 2, typography: 'body2' }}
                >
                  <Box>
                    <Typography variant="h5" color="#CF5A0D">
                      {packageItem?.package?.package_translations
                        ? packageItem?.package?.package_translations[0]?.name.toUpperCase()
                        : 'NA' || 'UNNAMED PACKAGE'}
                    </Typography>
                    {packageItem?.package?.number_of_sessions ?? '0'} Sessions
                  </Box>

                  <IconButton onClick={(e) => handleClick(e, packageItem)}>
                    <Iconify icon="eva:more-vertical-outline" />
                  </IconButton>
                </Stack>
                <hr
                  style={{
                    width: '100%',
                    height: '0.5px',
                    border: 'none',
                    backgroundColor: '#CF5A0D',
                  }}
                />
                <Stack spacing={2} sx={{ px: 3, pt: 3, pb: 2, flexGrow: 1, overflow: 'auto' }}>
                  <Box display={'flex'}>
                    {/* <Typography variant="h6">{' AED'}</Typography> */}
                    <Typography variant="h6">
                      {packageItem?.min_price ? parseFloat(packageItem?.min_price) : '0'}
                      {'AED '}- {packageItem?.max_price ? parseFloat(packageItem?.max_price) : '0'}{' '}
                      {'AED '}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                    What's included
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* <Iconify icon="solar:check-circle-linear" color="#CF5A0D" /> */}
                    <Typography
                      component="span"
                      dangerouslySetInnerHTML={{
                        __html: packageItem?.package?.package_translations
                          ? packageItem?.package?.package_translations[0].session_inclusions
                          : 'NA' || 'No inclusions available',
                      }}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          ))}

        <Dialog open={confirm.value} onClose={confirm.onFalse}>
          <DialogTitle>Delete Package</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this package?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={confirm.onFalse} color="primary">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeletePackage(selectedPackageId)}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleEditPackage(selectedPackage);
          }}
        >
          Edit Package
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteClick(selectedPackage.id);
            handleClose();
          }}
        >
          Delete Package
        </MenuItem>
      </Menu>
      <PackageCreateEditForm
        editMode={editMode}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onSubmit={handleCreatePackage}
        selectedPackage={selectedPackage}
        city_id={city.id}
        setEditMode={setEditMode}
      />
    </Box>
  );
}
