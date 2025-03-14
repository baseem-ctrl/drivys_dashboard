import React, { useCallback, useState } from 'react';
import { useLocales } from 'src/locales';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  Stack,
  Avatar,
  Chip,
  Paper,
  Card,
  Tooltip,
  Popover,
  TextField,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { Done, Close } from '@mui/icons-material'; // Import different icons
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';

import {
  rejectAcceptPendingRequest,
  updateUserVerificationAdmin,
  updateUserVerificationSchool,
  useGetPendingVerificationRequest,
} from 'src/api/trainerPendingRequest';
import { ASSETS_API } from 'src/config-global';
import moment from 'moment';
import { useTable, TablePaginationCustom } from 'src/components/table';
import { useAuthContext } from 'src/auth/hooks';
import { updateUserVerification } from 'src/api/school-admin';
import Scrollbar from 'src/components/scrollbar';
import { IUserTableFilterValue } from 'src/types/city';
import TodoListSearch from 'src/sections/todo/todo-pending-request-filter';

// Type Definitions
type ItemProps = {
  id: string;
  school_name: string;
  user: {
    id: string;
    name: string;
    photo_url: string;
  };
  verified_at: string | null;
  requested_time: string;
};
const defaultFilters = {
  customerName: '',
  status: '',
  bookingType: 'all',
  paymentStatus: '',
  vendor: '',
};
export default function PendingRequests({
  height,
  searchValue,
  setSearchValue,
  filters,
  setFilters,
}: any) {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { t } = useLocales();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryError, setExpiryError] = useState(false);

  const {
    pendingRequests,
    pendingRequestsError,
    pendingRequestsLoading,
    totalPages,
    revalidatePendingRequests,
  } = useGetPendingVerificationRequest({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    search: searchValue,
  });

  const handleClickUserDetails = (userId: string) => {
    router.push(paths.dashboard.user.details(userId));
  };
  const handleClickSchoolDetails = (userId: string) => {
    router.push(paths.dashboard.school.details(userId));
  };

  const handleAcceptClick = (event, request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
    setExpiryDate('');
    setExpiryError(false);
  };

  const handleConfirmAccept = () => {
    if (selectedRequest) {
      handleVerifyRequest({ ...selectedRequest, expiryDate }, 1);
      handleClose();
    }
  };
  const handleVerifyRequest = async (request: any, status: any) => {
    const action = status === 1 ? 'accept' : 'reject';

    // Set loading state for the specific request and action
    setLoadingStates((prev) => ({ ...prev, [`${request.id}-${action}`]: true }));
    try {
      let response;

      if (user?.user?.user_type === 'SCHOOL_ADMIN') {
        const body = {
          trainer_id: request?.user_id,
          verify: status,
        };
        response = await updateUserVerification(body);
      } else {
        const body = {
          mapping_id: request?.id,
          verify: status,
          certificate_expiry_date: expiryDate,
        };
        response = await updateUserVerificationAdmin(body);
      }
      if (response) {
        enqueueSnackbar(response?.message ?? 'Trainer Verified Successfully');
      }
    } catch (error) {
      if (error?.errors) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`${request.id}-${action}`]: false }));
      revalidatePendingRequests();
    }
  };
  // Loading state
  if (pendingRequestsLoading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t('loading_pending_requests')}
        </Typography>
      </Container>
    );
  }

  // Error state
  if (pendingRequestsError) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">{t('error_fetching_pending_requests')}</Alert>
      </Container>
    );
  }

  // Empty state
  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('pending_requests')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('no_pending_requests')}
        </Typography>
      </Container>
    );
  }
  return (
    <Card>
      {' '}
      <Container maxWidth="lg">
        <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 2 }}>
          {t('pending_verification_requests')}
        </Typography>

        <Scrollbar>
          <Stack
            spacing={3}
            // sx={{ p: 3, minWidth: 360 }}
            height={height ? height : ''}
            overflow={'auto'}
          >
            <Stack spacing={3}>
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  sx={{
                    mb: 1,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: 3,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar
                      alt={request?.user?.name}
                      src={
                        request?.user?.photo_url ||
                        `${ASSETS_API}/assets/images/avatar/avatar_1.jpg`
                      }
                      sx={{ width: 48, height: 48, mr: 2 }}
                    />
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                        onClick={() =>
                          request?.user?.id ? handleClickUserDetails(request?.user?.id) : ''
                        }
                      >
                        {request?.user?.name || 'N/A'}
                      </Typography>
                      <Tooltip title={t('school_name')} arrow>
                        {' '}
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',

                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() =>
                            request?.vendor?.vendor_translations[0]?.vendor_id
                              ? handleClickSchoolDetails(
                                  request?.vendor?.vendor_translations[0]?.vendor_id
                                )
                              : ''
                          }
                        >
                          {request?.vendor?.vendor_translations[0]?.name || 'N/A'}
                        </Typography>
                      </Tooltip>

                      <Tooltip title={t('requested_time')} arrow>
                        <Typography variant="body2" sx={{ color: '#CF5A0D', cursor: 'default' }}>
                          {moment(request?.requested_time).format('MMMM D, YYYY, hh:mm A') || 'N/A'}
                        </Typography>
                      </Tooltip>
                      <Typography
                        variant="body2"
                        sx={{ cursor: 'default', color: 'text.secondary' }}
                      >
                        Trainer from{' '}
                        {request?.user?.user_preference?.city?.city_translations[0]?.name ||
                          'N / A'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ cursor: 'default', color: 'text.secondary' }}
                      >
                        {request?.user?.user_preference?.vehicle_type?.category_translations[0]
                          ?.name || 'N / A'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ display: 'flex', width: '90%', mt: 2 }}>
                    <Button
                      fullWidth
                      sx={{ flex: 1, mr: 1 }}
                      variant="contained"
                      color="error"
                      onClick={() => handleVerifyRequest(request, 0)}
                      disabled={loadingStates[`${request.id}-reject`]}
                    >
                      {loadingStates[`${request.id}-reject`] ? (
                        <CircularProgress size={24} />
                      ) : (
                        t('reject')
                      )}
                    </Button>
                    <Button
                      fullWidth
                      sx={{ flex: 1, ml: 1 }}
                      variant="contained"
                      color="success"
                      onClick={(e) => handleAcceptClick(e, request)}
                      disabled={loadingStates[`${request.id}-accept`]}
                    >
                      {loadingStates[`${request.id}-accept`] ? (
                        <CircularProgress size={24} />
                      ) : (
                        t('accept')
                      )}
                    </Button>
                  </Box>
                </Card>
              ))}
            </Stack>

            <TablePaginationCustom
              count={totalPages}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              // rowsPerPageOptions={[]}
            />
          </Stack>
        </Scrollbar>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1">{t('Enter Certificate Expiry Date')}</Typography>
            <TextField
              type="date"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                setExpiryError(false);
              }}
              InputLabelProps={{ shrink: true }}
              error={expiryError}
              helperText={expiryError ? 'Expiry date is required!' : ''}
            />
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmAccept}
              disabled={!expiryDate}
            >
              {t('Confirm')}
            </Button>
          </Box>
        </Popover>
      </Container>
    </Card>
  );
}
