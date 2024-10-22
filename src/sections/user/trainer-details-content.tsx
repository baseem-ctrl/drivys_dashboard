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
  Grid,
  IconButton,
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
// ----------------------------------------------------------------------

type Props = {
  id: number | string;
};

export default function TrainerDetailsContent({ id }: Props) {
  const { details, detailsLoading, revalidateDetails } = useGetPackagesDetailsByTrainer(id);


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
                      label: 'Vendor Commission',
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


  console.log(Array.isArray(details), details, "details");


  return (
    <>
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
      ) : (

        details?.length > 0 ?
          <>
            <Grid container spacing={2} >

                {Array.isArray(details) && details.map((item: any) => (
                   <Grid item xs={12} sm={6} md={3}>
                  <Stack
                    component={Card}
                    direction="column"
                    key={item?.id}
                  >
                    <Stack sx={{ px: 3, pt: 3, pb: 2, typography: 'body2' }}>{item?.number_of_sessions} Sessions</Stack>
                    <hr style={{ width: "100%", height: "0.5px", border: "none", backgroundColor: "#CF5A0D" }} />

                    <Stack spacing={2} sx={{ px: 3, pt: 3, pb: 2 }}>
                      <Typography variant="h5" color="#CF5A0D" > {item?.package_translations[0]?.name} </Typography>
                      <Typography sx={{ fontSize: "12px", fontWeight: "700" }}> What's included </Typography>

                      <Stack direction="row" spacing={1}>
                        <Iconify icon="solar:check-circle-linear" color="#CF5A0D" /> <Typography>  {item?.package_translations[0]?.session_inclusions} </Typography>
                      </Stack>
                    </Stack>

                  </Stack>
                  </Grid>
                ))}





              {/* <Grid xs={12} md={4}>
            {renderCompany}
          </Grid> */}
            </Grid>
          </> : "No Packages"
      )
      }
    </>
  );
}
