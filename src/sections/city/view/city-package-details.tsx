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
} from '@mui/material';
import { useGetPackageCityList } from 'src';
import React from 'react';
import { createPackageCity, deletePackageCityById } from 'src/api/city';
import PackageCreateEditForm from '../package-create-update-form';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/Iconify';
import { useGetPackage } from 'src/api/package';

// ----------------------------------------------------------------------

export default function CityPackageDetails({ reload, packageDetails, city }) {
  const quickEdit = useBoolean();
  const confirm = useBoolean(); // State for confirmation dialog
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedPackage, setSelectedPackage] = React.useState(null); // State for selected package
  const { packageList, packageError } = useGetPackage(city.id);

  const handleDeletePackage = async (id) => {
    try {
      const response = await deletePackageCityById(id);
      console.log('Package deleted successfully:', response);
      reload();
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
      console.log('Package created successfully:', response);
      quickEdit.onFalse();
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const handleClick = (event, packageItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedPackage(packageItem); // Set the selected package
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedPackage(null);
  };

  const handleDeleteClick = () => {
    confirm.onTrue(); // Open confirmation dialog when the delete is clicked
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedPackage(null); // Set to null for adding a new package
          quickEdit.onTrue(); // Open the form
        }}
        sx={{
          marginBottom: '20px',
          backgroundColor: '#CF5A0D',
          color: 'white',
          '&:hover': {
            backgroundColor: '#FB8C00',
          },
        }}
      >
        Add Package
      </Button>
      <Grid container spacing={2} rowGap={1}>
        {Array.isArray(packageDetails) &&
          packageDetails.map((packageItem) => (
            <Grid item xs={12} sm={6} md={3} key={packageItem.id}>
              <Stack component={Card} direction="column" sx={{ marginBottom: '16px' }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 3, pt: 3, pb: 2, typography: 'body2' }}
                >
                  <Typography
                    variant="h8"
                    color="#CF5A0D"
                    sx={{ paddingRight: '14px', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {packageItem.package.package_translations.find((trans) => trans.locale === 'en')
                      ?.name || 'Unnamed Package'}
                  </Typography>
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
                <Stack spacing={2} sx={{ px: 3, pt: 3, pb: 2 }}>
                  <Typography variant="body2">
                    {packageItem.package.number_of_sessions} Sessions
                  </Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: '700' }}>
                    What's included
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:check-circle-linear" color="#CF5A0D" />
                    <Typography
                      component="span"
                      dangerouslySetInnerHTML={{
                        __html:
                          packageItem.package.package_translations[0].session_inclusions ||
                          'No inclusions available',
                      }}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          ))}
      </Grid>
      {/* Render form for editing or creating packages */}
      <PackageCreateEditForm
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onSubmit={handleCreatePackage}
        packageList={packageList}
        city_id={city.id} // Pass city_id if selectedPackage exists
      />
      {/* Menu for more options */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleDeleteClick(); // Trigger confirmation popup before deletion
            handleClose();
          }}
        >
          Delete Package
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirm.value} onClose={confirm.onFalse}>
        <DialogTitle>Delete Package</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this package?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm.onFalse} color="primary">
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => handleDeletePackage(city.id)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
