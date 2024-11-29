import React from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetPendingVerificationRequest } from 'src/api/trainerPendingRequest';
import { ASSETS_API } from 'src/config-global';
import moment from 'moment';
import { useTable, TablePaginationCustom } from 'src/components/table';
const PendingRequests = () => {
  const router = useRouter();

  const table = useTable({ defaultRowsPerPage: 5, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const { pendingRequests, pendingRequestsError, pendingRequestsLoading, totalPages } =
    useGetPendingVerificationRequest({ page: table?.page + 1, limit: table?.rowsPerPage });
  const handleClickUserDetails = (userId) => {
    router.push(paths.dashboard.user.details(userId));
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
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ borderRadius: 2, padding: 2 }}>
          Pending Driver Verifications Requests
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>School Name</strong>
              </TableCell>
              <TableCell>
                <strong>User</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Requested Time</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingRequests.map((request, index) => (
              <TableRow key={index}>
                <TableCell>{request?.school_name || 'N/A'}</TableCell>
                <TableCell
                  sx={{ display: 'flex', alignItems: 'center' }}
                  style={{
                    textDecoration: 'none',
                    color: 'grey',
                    transition: 'text-decoration 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')} // Add underline on hover
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                  onClick={() => handleClickUserDetails(request?.user?.id)}
                >
                  <Avatar
                    alt="user"
                    src={
                      request?.user?.photo_url || `${ASSETS_API}/assets/images/avatar/avatar_1.jpg`
                    }
                    sx={{ mr: 2 }}
                  />
                  {request?.user?.name || 'N/A'}
                </TableCell>

                <TableCell>
                  {request.verified_at ? (
                    <Chip
                      label="Verified"
                      color="success"
                      variant="outlined"
                      sx={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        borderColor: '#28a745',
                      }}
                    />
                  ) : (
                    <Chip
                      label="Not Verified"
                      color="error"
                      variant="outlined"
                      sx={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderColor: '#dc3545',
                      }}
                    />
                  )}
                </TableCell>

                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {request.requested_time ? moment(request?.requested_time).fromNow() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
};

export default PendingRequests;
