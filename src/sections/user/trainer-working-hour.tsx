// @mui
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Typography,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import TableContainer from '@mui/material/TableContainer';
import { useBoolean } from 'src/hooks/use-boolean';
import Table from '@mui/material/Table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { enqueueSnackbar } from 'src/components/snackbar';
import { deleteWorkingHoursById, useGetWorkingHoursByUserId } from 'src/api/trainer-working-hours';
import Iconify from 'src/components/iconify';
import { useState } from 'react';
import WorkingHoursCreateEditForm from './trainer-working-hours-create-edit-form';

// ----------------------------------------------------------------------

type Props = {
  userId: number | string;
};

export default function TrainerWorkingHour({ userId }: Props) {
  const { workingHours, workingHoursLoading, workingHoursError, revalidateWorkingHours } =
    useGetWorkingHoursByUserId(userId);
  const [workingHourID, setWorkingHourID] = useState('');
  const [selectedWorkingHour, setSelectedWorkingHour] = useState('');

  const popover = usePopover();
  const confirm = useBoolean();
  const quickEdit = useBoolean();

  const handleDeleteWorkingHour = async (id: string) => {
    const response = await deleteWorkingHoursById(id);
    if (response) {
      enqueueSnackbar(response?.message ?? 'Success');
      revalidateWorkingHours();
    } else {
      console.error('Error deleting working hour:', response.statusText);
    }
  };
  function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);

    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${formattedDate} ${formattedTime}`;
  }

  if (workingHoursLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', margin: '10px' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (workingHoursError) {
    return (
      <Box sx={{ color: 'error.main', textAlign: 'center', mt: 2 }}>
        <Typography variant="body1">Failed to load working hours.</Typography>
      </Box>
    );
  }

  if (!workingHours || workingHours.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body1">No working hours available.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
            {' '}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">Day</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Start Time</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">End Time</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="h6">Full Day</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Off Day</Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workingHours.map((hour) => (
                  <TableRow key={hour.id}>
                    <TableCell>
                      <Typography variant="body2">{hour.day_of_week}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatTimestamp(hour.start_time)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatTimestamp(hour.end_time)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: hour.is_full_day ? 'green' : 'red' }}
                      >
                        {hour.is_full_day ? 'Yes' : 'No'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: hour.is_off_day ? 'green' : 'red' }}>
                        {hour.is_off_day ? 'Yes' : 'No'}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={() => {
                        setWorkingHourID(hour.id);
                        setSelectedWorkingHour(hour);
                      }}
                    >
                      <IconButton
                        color={popover.open ? 'inherit' : 'default'}
                        onClick={popover.onOpen}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        onConfirm={() => {
          confirm.onFalse();
          handleDeleteWorkingHour(workingHourID);
        }}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteWorkingHour(workingHourID)}
          >
            Delete
          </Button>
        }
      />
      <WorkingHoursCreateEditForm
        formatTimestamp={formatTimestamp}
        currentWorkingHour={selectedWorkingHour}
        userId={userId}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={revalidateWorkingHours}
      />
    </Grid>
  );
}
