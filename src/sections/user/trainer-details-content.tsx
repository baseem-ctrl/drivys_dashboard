// @mui
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Label from 'src/components/label';
import LoadingButton from '@mui/lab/LoadingButton';

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
  CircularProgress,
  Select,
  Switch,
  TextField,
} from '@mui/material';

import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// types
import { IJobItem } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
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
import { createPackageTrainer, deletePackageTrainerById } from 'src/api/package-trainer';
import TrainerPackageCreateEditForm from './trainer-package-create-edit-form';
import { useTranslation } from 'react-i18next';
// ----------------------------------------------------------------------

type Props = {
  Trainerdetails?: any;
};

export default function TrainerDetailsContent({ Trainerdetails }: Props) {
  const { details, detailsLoading, revalidateDetails } = useGetPackagesDetailsByTrainer(
    Trainerdetails?.id
  );
  const { t } = useTranslation();
  const quickEdit = useBoolean();
  const confirm = useBoolean();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [editMode, setEditMode] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [selectedLanguage, setSelectedLanguage] = useState(
  //   details?.vendor_translations?.length > 0 ? details?.vendor_translations[0]?.locale : ''
  // );

  // const [editMode, setEditMode] = useState(false);

  const [currentTab, setCurrentTab] = useState('details');

  const currentTrainer = details;

  // const { language, languageLoading, totalpages, revalidateLanguage, languageError } =
  //   useGetAllLanguage(0, 1000);
  // const { schoolAdminList, schoolAdminLoading } = useGetSchoolAdmin(1000, 1, '');

  // This useEffect sets the initial selectedLanguage value once details are available
  // useEffect(() => {
  //   if (details?.vendor_translations?.length > 0) {
  //     setSelectedLanguage(details?.vendor_translations[0]?.locale);
  //   }
  // }, [details]);

  const [localeOptions, setLocaleOptions] = useState([]);

  // useEffect(() => {
  //   if ((language && language?.length > 0) || details?.vendor_translations?.length > 0) {
  //     let initialLocaleOptions = [];
  //     if (Array.isArray(language)) {
  //       initialLocaleOptions = language?.map((item: any) => ({
  //         label: item?.language_culture,
  //         value: item?.language_culture,
  //       }));
  //     }

  //     setLocaleOptions([...initialLocaleOptions]);

  //   }
  // }, [language, details]);

  // Find the selectedLocaleObject whenever selectedLanguage or details change
  const router = useRouter();
  const handleEditRow = useCallback(() => {
    router.push(paths.dashboard.user.edit(details?.id));
  }, [router]);
  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 5 }}>
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
        spacing={3}
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
          sx={{ width: 300, height: 300, borderRadius: 2, ml: 2 }}
          variant="square"
        />
        {/* </Grid> */}
        <Grid item xs={12} sm={8} md={8}>
          <Scrollbar>
            <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2', pb: 2 }}>
              {[
                { label: 'Name', value: details?.name ?? 'N/A' },
                { label: 'Email', value: details?.email ?? 'NA' },
                {
                  label: 'Phone Number',
                  value: details?.country_code
                    ? `${details?.country_code}-${details?.phone}`
                    : details?.phone ?? 'NA',
                },
                { label: 'User Type', value: details?.user_type ?? 'NA' },

                { label: 'Preffered Language', value: details?.locale ?? 'NA' },
                { label: 'Wallet Balance', value: details?.wallet_balance ?? 'NA' },
                { label: 'Wallet Points', value: details?.wallet_points ?? 'NA' },

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
                        value: details?.max_cash_in_hand_allowed ?? 'N/A',
                      },
                      { label: 'Cash in Hand', value: details?.cash_in_hand ?? 'N/A' },
                      {
                        label: 'Cash Clearance Date',
                        value: details?.cash_clearance_date ?? 'N/A',
                      },
                      {
                        label: 'Last Booking At',
                        value: details?.last_booking_was ?? 'N/A',
                      },
                      {
                        label: 'School Commission',
                        value: details?.vendor_commission_in_percentage ?? 'N/A',
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
                    {item.value ?? 'N/A'}
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

  const handleEditPackage = (packageItem) => {
    setEditMode('Edit');
    setSelectedPackage(packageItem);
    quickEdit.onTrue();
    handleClose();
  };

  const handleClick = (event, packageItem, id) => {
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

  return (
    <>
      {details?.length < 1 && (
        <Grid item xs={12}>
          <Typography variant="body1" align="left" sx={{ color: '#CF5A0D' }}>
            {t('No packages available. Click Add Package to create a new one.')}
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
            {t('Add Package')}
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
      ) : details?.length ? (
        <>
          <Grid container spacing={2} rowGap={1}>
            {Array.isArray(details) &&
              details.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item?.id}>
                  <Stack
                    component={Card}
                    direction="column"
                    sx={{
                      marginBottom: '16px',
                      height: '310px',
                      position: 'relative',
                    }}
                  >
                    <Stack
                      sx={{ px: 3, pt: 3, pb: 2, typography: 'body2' }}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h5" color="#CF5A0D">
                          {item?.package?.package_translations
                            ? item?.package?.package_translations[0]?.name
                            : 'NA'}
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
                    {/* Scrollable content box */}
                    <Box sx={{ px: 3, pt: 3, pb: 2, maxHeight: '180px', overflowY: 'auto' }}>
                      <Box display={'flex'}>
                        <Typography variant="h6">
                          {' '}
                          <span className="dirham-symbol">&#x00EA;</span>
                        </Typography>
                        <Typography variant="h4">
                          {item?.price ? parseFloat(item?.price) : '0'}
                        </Typography>
                      </Box>

                      <Typography sx={{ fontSize: '16px', fontWeight: '700' }}>
                        {t("What's included")}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Typography
                          component="span"
                          dangerouslySetInnerHTML={{
                            __html:
                              item?.package?.package_translations?.[0]?.session_inclusions ||
                              t('No inclusions available'),
                          }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              ))}
          </Grid>
        </>
      ) : (
        ''
      )}
      <>
        <Dialog open={confirm.value} onClose={confirm.onFalse}>
          <DialogTitle>{t('Delete Package')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('Are you sure you want to delete this package?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={confirm.onFalse} color="primary">
              {t('Cancel')}
            </Button>

            <LoadingButton
              loading={isSubmitting}
              variant="contained"
              color="error"
              onClick={() => handleDeletePackage(selectedPackageId)}
            >
              {t('Delete')}
            </LoadingButton>
          </DialogActions>
        </Dialog>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem
            onClick={() => {
              handleEditPackage(selectedPackage);
            }}
          >
            {t('Edit Package')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeleteClick(selectedPackage.id);
              handleClose();
            }}
          >
            {t('Delete Package')}
          </MenuItem>
        </Menu>
        <TrainerPackageCreateEditForm
          editMode={editMode}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onSubmit={handleCreatePackage}
          selectedPackage={selectedPackage}
          trainer_details={Trainerdetails}
          setEditMode={setEditMode}
        />
      </>
    </>
  );
}
