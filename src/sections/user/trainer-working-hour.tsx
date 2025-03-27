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
import {
  deleteShiftById,
  deleteWorkingHoursById,
  useGetLeaveDatesByTrainerId,
  useGetShiftsByTrainerId,
  useGetWorkingHoursByUserId,
} from 'src/api/trainer-working-hours';
import Iconify from 'src/components/iconify';
import { useState } from 'react';
import WorkingHoursCreateEditForm from './trainer-working-hours-create-edit-form';
import CreateTrainerShiftForm from './trainer-create-shift';
import { TablePaginationCustom, useTable } from 'src/components/table';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  userId: number | string;
  details: any;
};

export default function TrainerWorkingHour({ userId, details }: Props) {
  const table = useTable({ defaultRowsPerPage: 15 });
  const { t } = useTranslation();
  const { workingHours, workingHoursLoading, workingHoursError, revalidateWorkingHours } =
    useGetWorkingHoursByUserId(userId);
  const { shifts, shiftsLoading, shiftsError, revalidateShifts } = useGetShiftsByTrainerId(userId);
  const { leaveDates, totalLeaveDates, leaveDatesLoading } = useGetLeaveDatesByTrainerId(
    userId,
    table.page + 1,
    table.rowsPerPage
  );
  console.log('workingHours', workingHours);
  const [workingHourID, setWorkingHourID] = useState('');
  const [selectedWorkingHour, setSelectedWorkingHour] = useState('');
  const deletePopover = usePopover();
  const [selectedShift, setSelectedShift] = useState(null);

  const popover = usePopover();
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const createShift = useBoolean();

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
  const handleDeleteShift = async (id: string) => {
    try {
      await deleteShiftById(id);
      enqueueSnackbar('Shift deleted successfully', { variant: 'success' });
      revalidateShifts();
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage: any) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      deletePopover.onClose();
    }
  };
  const handleCreateWorkingHours = () => {
    setSelectedWorkingHour(null);
    quickEdit.onTrue();
  };
  const handleCreateShift = () => {
    createShift.onTrue();
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
  const formattedLeaveDates = leaveDates?.map((leave) => {
    if (leave.is_full_day_off) {
      return {
        label: 'Full Day Leave',
        date: moment(leave.date).format('MMMM Do, YYYY'),
      };
    }
    return {
      label: 'Partial Leave',
      date: moment(leave.date).format('MMMM Do, YYYY'),
      time: `${moment(leave.start_time).local().format('h:mm A')} - ${moment(leave.end_time)
        .local()
        .format('h:mm A')}`,
    };
  });
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
            <Button
              sx={{ mb: 4, mt: 2 }}
              variant="contained"
              color="primary"
              disabled={!details?.is_active}
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => handleCreateShift()}
            >
              {t('Add Shift')}
            </Button>
          </Box>

          {shifts.length > 0 && (
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {t('Trainer Shifts:')}
            </Typography>
          )}
          {shiftsLoading ? (
            <Typography>{t('Loading shifts..')}.</Typography>
          ) : shiftsError ? (
            <Typography color="error">{t('Error loading shifts')}</Typography>
          ) : shifts.length > 0 ? (
            <Card>
              <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Shift Start Time')}</TableCell>
                      <TableCell>{t('Shift End Time')}</TableCell>
                      <TableCell>{t('Action')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{shift.shift_start_time}</TableCell>
                        <TableCell>{shift.shift_end_time}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShift(shift);
                              deletePopover.onOpen(e);
                            }}
                          >
                            <Iconify icon="eva:trash-2-outline" color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ) : (
            <Box display="flex" justifyContent="flex-start" alignItems="center" height="100%">
              {details?.is_active ? (
                <Typography variant="subtitle1" color="primary">
                  {t('No shifts available. Please create a shift')}
                </Typography>
              ) : (
                <Typography variant="subtitle1" color="primary">
                  {t('Shift creation is disabled as the trainer is inactive.')}
                </Typography>
              )}
            </Box>
          )}
        </Grid>
        {shifts?.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, gap: 1, mt: 2 }}>
            {!workingHours || workingHours.length === 0 ? (
              <Box sx={{ textAlign: 'left', mt: 2 }}>
                <Typography variant="body1" sx={{ color: '#CF5A0D' }}>
                  {t("No working hours available. You can add using 'Add Work Hours'.")}
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
              {t('Add Work Hours')}
            </Button>
          </Box>
        )}

        {workingHours && workingHours.length > 0 && (
          <Card>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              {t('Trainer Working Hours:')}
            </Typography>
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
                          {groupedWorkingHours[day].some((hour) => hour.is_off_day)
                            ? t('Yes')
                            : t('No')}
                        </Typography>
                      </TableCell>

                      {/* Conditionally render shift time or full day */}
                      <TableCell>
                        {groupedWorkingHours[day][0]?.is_off_day ? (
                          <Chip label={'Off Day'} color="info" />
                        ) : groupedWorkingHours[day][0]?.is_full_day ? (
                          <Chip label={t('Full Day')} color="primary" />
                        ) : (
                          groupedWorkingHours[day]
                            .slice() // Create a copy to avoid mutating the original array
                            .sort(
                              (a, b) =>
                                moment(a.start_time).valueOf() - moment(b.start_time).valueOf()
                            ) // Sort by start_time
                            .map((hour, index) => (
                              <Box key={index} component="div">
                                <Typography variant="body2">
                                  {moment(hour.start_time).local().format('h:mm A')} -{' '}
                                  {moment(hour.end_time).local().format('h:mm A')}
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
        {leaveDates && leaveDates.length > 0 && (
          <Card sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
              {t('Leave Dates')}
            </Typography>
            <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography>{t('Date')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{t('Type')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{t('Time')}</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formattedLeaveDates.map((leave, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2">{leave.date}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{leave.label}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{leave.time || t('Full Day')}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
        <TablePaginationCustom
          count={totalLeaveDates}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
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
          {t('Delete')}
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
        title={t('Delete')}
        content={t('Are you sure you want to delete?')}
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
      <ConfirmDialog
        open={deletePopover.open}
        onClose={deletePopover.onClose}
        title={t('Delete')}
        content={t('Are you sure you want to delete?')}
        onConfirm={() => {
          confirm.onFalse();
          handleDeleteShift(selectedShift?.id);
        }}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteShift(selectedShift?.id)}
          >
            {t('Delete')}
          </Button>
        }
      />
      <WorkingHoursCreateEditForm
        currentWorkingHour={selectedWorkingHour}
        shifts={shifts}
        userId={userId}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={revalidateWorkingHours}
      />
      <CreateTrainerShiftForm
        currentWorkingHour={selectedWorkingHour}
        userId={userId}
        open={createShift.value}
        onClose={createShift.onFalse}
        reload={revalidateWorkingHours}
      />
    </Grid>
  );
}
