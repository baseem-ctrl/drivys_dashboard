import React from 'react';
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
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { Done, Close } from '@mui/icons-material'; // Import different icons
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';

import {
  rejectAcceptPendingRequest,
  useGetPendingVerificationRequest,
} from 'src/api/trainerPendingRequest';
import { ASSETS_API } from 'src/config-global';
import moment from 'moment';
import { useTable, TablePaginationCustom } from 'src/components/table';

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

export default function PendingRequests() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable({ defaultRowsPerPage: 2, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const {
    pendingRequests,
    pendingRequestsError,
    pendingRequestsLoading,
    totalPages,
    revalidatePendingRequests,
  } = useGetPendingVerificationRequest({ page: table?.page + 1, limit: table?.rowsPerPage });

  const handleClickUserDetails = (userId: string) => {
    router.push(paths.dashboard.user.details(userId));
  };

  const handleVerifyRequest = async (id: string, status) => {
    try {
      const response = await rejectAcceptPendingRequest(id, status);
      if (response) {
        if (status === 1) {
          enqueueSnackbar('Request accepted successfully!', {
            variant: 'success',
          });
        } else {
          enqueueSnackbar('Request rejected successfully!', {
            variant: 'error',
          });
        }
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
      revalidatePendingRequests();
    }
  };

  // Loading state
  if (pendingRequestsLoading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading pending requests...
        </Typography>
      </Container>
    );
  }

  // Error state
  if (pendingRequestsError) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">
          Something went wrong while fetching pending requests. Please try again.
        </Alert>
      </Container>
    );
  }

  // Empty state
  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Pending Requests
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No pending requests at the moment.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Pending Verification Requests
      </Typography>
      <Stack spacing={3}>
        {pendingRequests.map((request) => (
          <Box key={request.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              alt={request?.user?.name}
              src={request?.user?.photo_url || `${ASSETS_API}/assets/images/avatar/avatar_1.jpg`}
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
                onClick={() => handleClickUserDetails(request?.user?.id)}
              >
                {request?.user?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {request?.school_name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#CF5A0D' }}>
                {moment(request?.requested_time).format('MMMM D, YYYY, hh:mm A') || 'N/A'}
              </Typography>
            </Stack>
            <Box>
              <Button
                variant="text"
                color="success"
                onClick={() => handleVerifyRequest(request.id, 1)}
                startIcon={<Done sx={{ fontSize: '1.5rem' }} />}
                sx={{
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    opacity: 0.8,
                  },
                }}
              />

              <Button
                variant="text"
                color="error"
                onClick={() => handleVerifyRequest(request.id, 0)}
                startIcon={<Close sx={{ fontSize: '1.5rem' }} />}
                sx={{
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    opacity: 0.8,
                  },
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>

      <TablePaginationCustom
        count={totalPages}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
      />
    </Container>
  );
}
