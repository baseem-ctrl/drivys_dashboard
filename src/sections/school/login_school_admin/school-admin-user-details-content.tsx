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
import TrainerDetailsContent from './school-admin-trainer-details-content';
import SchoolAdminTrainerDetailsContent from './school-admin-trainer-details-content';
import StudentDetailsContent from 'src/sections/user/student-details-content';
import moment from 'moment';
import { updateUserVerification } from 'src/api/school-admin';

// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload?: any;
};

export default function UserDetailsContentAdmin({ details, loading, reload }: Props) {
  const [currentTab, setCurrentTab] = useState('details');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const router = useRouter();
  const handleVerify = async (e: any, user_id: string) => {
    e.stopPropagation();
    const body = {
      trainer_id: details?.id,
      verify: 1,
    };
    const response = await updateUserVerification(body);
    if (response) {
      enqueueSnackbar(response?.message ?? 'Trainer Verified Successfully');
      reload();
    }
  };
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
        {/* <Iconify icon="solar:pen-bold" onClick={handleEditRow} sx={{ cursor: 'pointer' }} /> */}
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
                ...(details?.languages?.length
                  ? details?.languages.map((lang, index) => ({
                      label: `Language ${index + 1}`,
                      value: lang?.dialect?.id
                        ? `${lang?.dialect?.language_name} (${lang?.dialect?.dialect_name}) - ${lang?.fluency_level}`
                        : 'NA',
                    }))
                  : [{ label: 'Languages', value: 'N/A' }]),
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
                        label: 'Is Suspended',
                        value: !!details?.is_suspended ? (
                          <Chip label="Suspended" color="error" variant="soft" />
                        ) : (
                          'NA'
                        ),
                      },
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
                      {
                        label: 'Verified At',
                        value: !details?.school_verified_at ? (
                          <Box>
                            <Button variant="soft" onClick={handleVerify}>
                              {' '}
                              Verify
                            </Button>
                          </Box>
                        ) : (
                          moment.utc(details?.school_verified_at).format('lll')
                        ),
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

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {TRAINER_DETAILS_TABS.map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );

  return (
    <>
      {loading ? (
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
        <>
          {details?.user_type === 'TRAINER' && renderTabs}
          <Grid container spacing={1} rowGap={1}>
            <Grid xs={12} md={12}>
              {/* For all other user types */}
              {details?.user_type !== 'TRAINER' && renderContent}

              {/* For trainer user type with 3 tabs */}
              {currentTab === 'details' && details?.user_type === 'TRAINER' && renderContent}
              {currentTab === 'packages' && details?.user_type === 'TRAINER' && (
                <SchoolAdminTrainerDetailsContent trainerDetails={details} />
              )}
              {currentTab === 'students' && details?.user_type === 'TRAINER' && (
                <StudentDetailsContent id={details?.id} />
              )}

              {/* For trainer user type with 3 tabs */}
            </Grid>

            {/* <Grid xs={12} md={4}>
            {renderCompany}
          </Grid> */}
          </Grid>
        </>
      )}
    </>
  );
}
