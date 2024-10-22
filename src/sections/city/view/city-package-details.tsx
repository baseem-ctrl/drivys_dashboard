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
import { useState } from 'react';
import { createPackageCity, deletePackageCityById } from 'src/api/city';
import PackageCreateEditForm from '../package-create-update-form';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/Iconify';
import { useSnackbar } from 'src/components/snackbar';

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
      console.error('Error creating package:', error);
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
                sx={{
                  marginBottom: '16px',
                  height: '260px',
                  position: 'relative',
                }}
              >
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
                    {packageItem.package.package_translations[0]?.name.toUpperCase() ||
                      'UNNAMED PACKAGE'}
                  </Typography>

                  <IconButton onClick={(e) => handleClick(e, packageItem)}>
                    <Iconify icon="eva:more-vertical-outline" />
                  </IconButton>
                </Stack>

                <Stack spacing={2} sx={{ px: 3, pt: 3, pb: 2, flexGrow: 1, overflow: 'auto' }}>
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

                <hr
                  style={{
                    width: '100%',
                    height: '0.5px',
                    border: 'none',
                    backgroundColor: '#CF5A0D',
                    position: 'absolute',
                    top: '70px',
                    left: '0',
                  }}
                />
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
