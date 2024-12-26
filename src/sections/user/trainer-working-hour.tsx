import moment from 'moment';

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
  Chip,
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
  const workingHoursHeaders = [
    { key: 'day', label: 'Day' },
    { key: 'off_day', label: 'Off Day' },
    { key: 'shift_time', label: 'Available Time' },
    // Conditionally include start_time and end_time headers
    // ...(!workingHours?.some((hour) => hour.is_full_day)
    //   ? [
    //       { key: 'shift_time', label: 'Available Time' },
    //       { key: 'action', label: '' },
    //     ]
    //   : [
    //       // { key: 'full_day', label: 'Full Day' },
    //       // { key: 'action', label: '' },
    //     ]),
  ];

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
  const handleCreateWorkingHours = () => {
    setSelectedWorkingHour(null);
    quickEdit.onTrue();
  };
  const groupedWorkingHours = (workingHours || []).reduce(
    (acc, hour) => {
      const day = hour.day_of_week;
      const id = hour?.id;
      if (!acc[day]) acc[day] = [];
      acc[day].push(hour);
      return acc;
    },
    {} as Record<string, typeof workingHours>
  );
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          {!workingHours || workingHours.length === 0 ? (
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="body1" sx={{ color: '#CF5A0D' }}>
                No working hours available. You can add using 'Add Work Hours'.
              </Typography>
            </Box>
          ) : null}

          <Button
            sx={{ mb: 4, mt: 2 }}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => handleCreateWorkingHours()}
          >
            Add Work Hours
          </Button>
        </Box>

        {workingHours && workingHours.length > 0 && (
          <Card>
            <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {workingHoursHeaders.map((header) => (
                      <TableCell key={header.key}>
                        <Typography>{header.label}</Typography>
                      </TableCell>
                    ))}
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(groupedWorkingHours).map((day) => (
                    <TableRow key={day}>
                      <TableCell>
                        <Typography variant="body2">{day}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {groupedWorkingHours[day].some((hour) => hour.is_off_day) ? 'Yes' : 'No'}
                        </Typography>
                      </TableCell>

                      {/* Conditionally render shift time or full day */}
                      <TableCell>
                        {groupedWorkingHours[day][0]?.is_full_day ? (
                          <Chip label="Full Day" color="primary" />
                        ) : (
                          // <TableCell align="center">
                          groupedWorkingHours[day].map((hour, index) => (
                            <Box key={index} component="div">
                              <Typography variant="body2">
                                {moment(hour.start_time).utc().format('h:mm A')} -{' '}
                                {moment(hour.end_time).utc().format('h:mm A')}
                              </Typography>
                            </Box>
                          ))
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
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
        {/* <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem> */}
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
        currentWorkingHour={selectedWorkingHour}
        userId={userId}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={revalidateWorkingHours}
      />
    </Grid>
  );
}
