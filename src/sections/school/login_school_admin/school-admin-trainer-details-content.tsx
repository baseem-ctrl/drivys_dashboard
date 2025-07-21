// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Label from 'src/components/label';

import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// types
import { IJobItem } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { createSchool, createUpdateSchoolAddress, useGetSchoolAdmin } from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import marker from 'react-map-gl/dist/esm/components/marker';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetAllLanguage } from 'src/api/language';
import { RHFTextField } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { TRAINER_DETAILS_TABS } from 'src/_mock/_trainer';
import { useGetPackagesDetailsByTrainer } from 'src/api/trainer';
import Divider from '@mui/material/Divider';
import { LoadingButton } from '@mui/lab';
import TrainerPackageCreateEditForm from 'src/sections/user/trainer-package-create-edit-form';
import { createPackageTrainer, deletePackageTrainerById } from 'src/api/package-trainer';
import { useTranslation } from 'react-i18next';
// ----------------------------------------------------------------------

type Props = {
  trainerDetails: any;
};

export default function SchoolAdminTrainerDetailsContent({ trainerDetails }: Props) {
  const { details, detailsLoading, revalidateDetails } = useGetPackagesDetailsByTrainer(
    trainerDetails?.id
  );
  const { t, i18n } = useTranslation();

  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [editMode, setEditMode] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [currentTab, setCurrentTab] = useState('details');

  const currentTrainer = details;

  const [localeOptions, setLocaleOptions] = useState([]);
  const router = useRouter();
  const handleEditRow = useCallback(() => {
    router.push(paths.dashboard.user.edit(details?.id));
  }, [router]);
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Stack
        alignItems="end"
        sx={{
          width: '-webkit-fill-available',
          cursor: 'pointer',
          position: 'absolute',
          // top: '1.5rem',
          right: '1rem',
        }}
      >
        <Iconify icon="solar:pen-bold" onClick={handleEditRow} sx={{ cursor: 'pointer' }} />
      </Stack>
      <Stack
        spacing={1}
        alignItems={{ xs: 'center', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          // pr: { xs: 2.5, md: 1 },
        }}
      >
        {/* <Grid item xs={12} sm={8} md={8}> */}
        <Avatar
          alt={details?.name}
          src={details?.photo_url}
          sx={{ width: 300, height: 300, borderRadius: 2, mb: 2 }}
          variant="square"
        />
        {/* </Grid> */}
        <Grid item xs={12} sm={8} md={8}>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                { label: 'Name', value: details?.name ?? t('n/a') },
                { label: 'Email', value: details?.email ?? t('n/a') },
                {
                  label: 'Phone Number',
                  value: details?.country_code
                    ? `${details?.country_code}-${details?.phone}`
                    : details?.phone ?? t('n/a'),
                },
                { label: 'User Type', value: details?.user_type ?? t('n/a') },

                { label: 'Preffered Language', value: details?.locale ?? t('n/a') },
                { label: 'Wallet Balance', value: details?.wallet_balance ?? t('n/a') },
                { label: 'Wallet Points', value: details?.wallet_points ?? t('n/a') },

                {
                  label: 'Is Active',
                  value:
                    details?.is_active === '1' ? (
                      <Chip label="Active" color="success" variant="soft" />
                    ) : (
                      <Chip label="In Active" color="error" variant="soft" />
                    ),
                },
                ...(details?.user_type === 'TRAINER'
                  ? [
                      {
                        label: 'Max Cash Allowded in Hand',
                        value: details?.max_cash_in_hand_allowed ?? t('n/a'),
                      },
                      { label: 'Cash in Hand', value: details?.cash_in_hand ?? t('n/a') },
                      {
                        label: 'Cash Clearance Date',
                        value: details?.cash_clearance_date ?? t('n/a'),
                      },
                      {
                        label: 'Last Booking At',
                        value: details?.last_booking_was ?? t('n/a'),
                      },
                      {
                        label: 'School Commission',
                        value: details?.vendor_commission_in_percentage ?? t('n/a'),
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                  <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                    {item.label}
                  </Box>
                  <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                    :
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {item.value ?? t('n/a')}
                  </Box>
                  {/* <Box component="span">{loading ? 'Loading...' : item.value}</Box> */}
                </Box>
              ))}
            </Stack>
          </Scrollbar>
        </Grid>
      </Stack>
    </Stack>
  );
  const quickEdit = useBoolean();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirm = useBoolean();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAddPackageClick = () => {
    setEditMode('');
    setSelectedPackage(null);
    quickEdit.onTrue();
  };
  const handleCreatePackage = async (newPackage) => {
    try {
      setIsSubmitting(true);
      const response = await createPackageTrainer(newPackage);
      revalidateDetails();
      enqueueSnackbar(response.message);
      setIsSubmitting(false);
      quickEdit.onFalse();
      setEditMode('');
    } catch (error) {
      setEditMode('');
      setIsSubmitting(false);
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
    }
  };
  const handleDeletePackage = async (id) => {
    try {
      setIsSubmitting(true);
      const response = await deletePackageTrainerById(id);
      revalidateDetails();
      enqueueSnackbar('Package City Mapping Deleted successfully.');
      setIsSubmitting(false);
      quickEdit.onFalse();
      confirm.onFalse();
    } catch (error) {
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
      setIsSubmitting(false);
      console.error('Error deleting package:', error);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleEditPackage = (packageItem) => {
    setEditMode('Edit');
    setSelectedPackage(packageItem);
    quickEdit.onTrue();
    handleClose();
  };
  const handleDeleteClick = (id) => {
    setSelectedPackageId(id);
    confirm.onTrue();
  };
  const handleClick = (event, packageItem, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedPackageId(packageItem.id);
    setSelectedPackage(packageItem);
  };

  return (
    <>
      {details?.length < 1 && (
        <Grid item xs={12}>
          <Typography variant="body1" align="left" sx={{ color: '#CF5A0D' }}>
            No packages available. Click Add Package to create a new one.
          </Typography>
        </Grid>
      )}

      <Grid container item xs={12} justifyContent="flex-start">
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddPackageClick}
            sx={{
              backgroundColor: '#CF5A0D',
              color: 'white',
              marginTop: '12px',
              marginBottom: '19px',
              '&:hover': {
                backgroundColor: '#FB8C00',
              },
            }}
          >
            Add Package
          </Button>
        </Grid>
      </Grid>
      {detailsLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '10px',
            alignSelf: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : details?.length > 0 ? (
        <>
          <Grid container spacing={2}>
            {Array.isArray(details) &&
              details.map((item: any) => (
                <Grid item xs={12} sm={6} md={3}>
                  <Stack component={Card} direction="column" key={item?.id}>
                    <Stack
                      sx={{ px: 3, pt: 3, pb: 2, typography: 'body2' }}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h5" color="#CF5A0D">
                          {item?.package?.package_translations?.find(
                            (pt) => pt?.locale?.toLowerCase() === i18n.language.toLowerCase()
                          )?.name ?? t('n/a')}
                        </Typography>
                        {item?.package?.number_of_sessions} Sessions
                      </Box>
                      <IconButton
                        onClick={(e) =>
                          handleClick(e, item, item?.package?.package_translations?.[0]?.id)
                        }
                      >
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
                      <Box display={'flex'}>
                        <Typography variant="h6">
                          {' '}
                          <span className="dirham-symbol">&#x00EA;</span>
                        </Typography>
                        <Typography variant="h4">{parseFloat(item?.price) ?? '0'} </Typography>
                      </Box>

                      <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                        {' '}
                        What's included{' '}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        {/* <Iconify icon="solar:check-circle-linear" color="#CF5A0D" />{' '} */}
                        <Typography
                          component="span"
                          dangerouslySetInnerHTML={{
                            __html:
                              item?.package?.package_translations?.[0]?.session_inclusions ||
                              'No inclusions available',
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
              ))}
          </Grid>
        </>
      ) : (
        'No Packages'
      )}
      <>
        <Dialog open={confirm.value} onClose={confirm.onFalse}>
          <DialogTitle>Delete Package</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this package?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={confirm.onFalse} color="primary">
              Cancel
            </Button>

            <LoadingButton
              loading={isSubmitting}
              variant="contained"
              color="error"
              onClick={() => handleDeletePackage(selectedPackageId)}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
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
        <TrainerPackageCreateEditForm
          editMode={editMode}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onSubmit={handleCreatePackage}
          selectedPackage={selectedPackage}
          trainer_details={trainerDetails}
          setEditMode={setEditMode}
        />
      </>
    </>
  );
}
