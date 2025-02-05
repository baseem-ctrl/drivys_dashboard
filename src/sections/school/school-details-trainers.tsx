// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import { IJobCandidate } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
import { addTrainer, RemoveTrainerFromSchool, useGetSchoolTrainers } from 'src/api/school';
import { TablePaginationCustom, useTable } from 'src/components/table';
import {
  Autocomplete,
  Button,
  CircularProgress,
  FormHelperText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import { useGetUsers } from 'src/api/users';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type Props = {
  candidates: any;
  create: Boolean;
  onCreate: Function;
};

export default function SchoolTrainers({ candidates, create, onCreate }: Props) {
  const table = useTable({ defaultRowsPerPage: 5, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [trainerMappingId, setTrainerMappingId] = useState('');
  const [loadingButton, setLoadingButton] = useState(false);

  const {
    schoolTrainersList,
    schoolTrainersLoading,
    schoolTrainersError,
    totalPages,
    revalidateTrainers,
  } = useGetSchoolTrainers({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    vendor_id: candidates?.id,
  });
  const { users, usersLoading, usersError, usersEmpty, usersLength } = useGetUsers({
    page: 1,
    limit: 15,
    user_types: 'TRAINER',
    search: search,
    is_active: '1',
  });
  const popover = usePopover();
  const confirm = useBoolean();
  const NewUserSchema = Yup.object().shape({
    cash_clearance_date: Yup.string(),
    cash_in_hand: Yup.string().nullable(),

    vendor_commission_in_percentage: Yup.number()
      .required('vendor commission is required')
      .when([], {
        is: () =>
          candidates?.min_commision >= 0 &&
          candidates?.max_commision >= 0 &&
          candidates?.max_commision &&
          candidates?.min_commision,
        then: (schema) =>
          schema
            .min(
              candidates?.min_commision,
              `School commission must be greater than or equal to ${candidates?.min_commision}%`
            )
            .max(
              candidates?.max_commision,
              `School commission must be less than or equal to ${candidates?.max_commision}%`
            ),
        otherwise: (schema) => schema,
      }),
    trainer_id: Yup.mixed().required(),
    max_cash_in_hand_allowed: Yup.string().nullable(), // not required
  });

  const defaultValues = useMemo(
    () => ({
      cash_clearance_date: '',
      cash_in_hand: '',
      vendor_commission_in_percentage: '',
      password: '',
      phone: '',
      trainer_id: '',
      max_cash_in_hand_allowed: '',
    }),
    [candidates]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();
  useEffect(() => {
    if (candidates?.id) {
      reset(defaultValues);
    }
  }, [candidates, reset]);
  const onSubmit = async (data: any) => {
    const body = {
      trainer_id: data?.trainer_id?.id,
      vendor_id: candidates?.id,
      vendor_commission_in_percentage: data?.vendor_commission_in_percentage,
      cash_in_hand: data?.cash_in_hand,
      max_cash_in_hand_allowed: data?.max_cash_in_hand_allowed,
      cash_clearance_date: data?.cash_clearance_date,
    };
    try {
      setLoadingButton(true);
      const response = await addTrainer(body);
      if (response) {
        enqueueSnackbar(response?.message ?? 'Trainer Added Successfully');
        onCreate();
        revalidateTrainers();
        reset(defaultValues);
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
      setLoadingButton(false);
      setSearch('');
    }
  };
  const handlePopoverOpen = (e, trainer: any) => {
    popover.onOpen(e);
    setTrainerId(trainer?.user_id);
    setTrainerMappingId(trainer?.id);
  };
  const handleRemove = async () => {
    try {
      if (trainerMappingId) {
        const response = await RemoveTrainerFromSchool(trainerMappingId);
        if (response) {
          enqueueSnackbar(response?.message ?? 'Trainer Removed Successfully');
          setTrainerId('');
          revalidateTrainers();
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
    }
  };
  return (
    <Box
      gap={3}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
      }}
    >
      {create && (
        <Stack component={Card} direction="column" spacing={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Trainer
          </Typography>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box rowGap={1} display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
              <RHFAutocomplete
                name="trainer_id"
                label="Trainer"
                options={users} // Use the full list of user objects as options
                getOptionLabel={(option) => (option ? `${option.name}` : '')} // Display only the name in the input field
                isOptionEqualToValue={(option, value) => option.id === value.id} // Compare based on IDs
                onInputChange={(_, value) => setSearch(value)} // Set the search value when user types in the field
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.name} - {option.email} {/* Show "name - email" in the dropdown */}
                  </li>
                )}
                onInput={(_, value) => {
                  setSearch(value); // Store only the ID in the form state
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Trainer"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <RHFTextField
                name="cash_clearance_date"
                label="Cash Clearance Date "
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RHFTextField name="cash_in_hand" label="Cash in Hand" />
              <div>
                <RHFTextField
                  name="vendor_commission_in_percentage"
                  label="School Commission (%)"
                />
                <FormHelperText sx={{ color: 'primary.main', ml: 1 }}>
                  School Commission must be in between {candidates.min_commision || '0'}% and{' '}
                  {candidates.max_commision || '0'}%
                </FormHelperText>
              </div>
              <RHFTextField name="max_cash_in_hand_allowed" label="Max Cash Allowded" />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: '15px' }}>
              <LoadingButton
                sx={{ width: '100%', color: '#CF5A0D', borderColor: '#CF5A0D' }}
                type="submit"
                variant="outlined"
                loading={schoolTrainersLoading}
              >
                {'Save'}
              </LoadingButton>
              <LoadingButton
                onClick={() => {
                  onCreate();
                }}
                color="error"
                variant="outlined"
                sx={{ width: '100%' }}
              >
                {'Cancel'}
              </LoadingButton>
            </Box>
          </FormProvider>
        </Stack>
      )}
      {!schoolTrainersLoading ? (
        schoolTrainersList?.length > 0 ? (
          schoolTrainersList?.map((trainer: any) => (
            <Stack component={Card} direction="column" spacing={2} key={trainer?.id} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} key={trainer?.id}>
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={(e) => handlePopoverOpen(e, trainer)}
                >
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>

                <Avatar
                  alt={trainer?.user?.name ?? 'NA'}
                  src={trainer?.user?.photo_url}
                  sx={{ width: 48, height: 48 }}
                />

                <Stack spacing={1}>
                  <ListItemText
                    primary={trainer?.user?.name}
                    secondary={trainer?.user?.email}
                    secondaryTypographyProps={{
                      mt: 0.5,
                      component: 'span',
                      typography: 'caption',
                      color: 'text.disabled',
                    }}
                  />
                </Stack>
                {/* <TablePaginationCustom
              count={totalPages}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            /> */}
              </Stack>
              <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
                {[
                  // { label: 'Name', value: items?.name ?? 'N/A' },
                  {
                    label: 'Phone Number',
                    value: trainer?.user?.country_code
                      ? `${trainer?.user?.country_code}-${trainer?.user?.phone}`
                      : trainer?.user?.phone ?? 'NA',
                  },
                  { label: 'Hand Cash Allowed', value: trainer?.max_cash_in_hand_allowed ?? 'NA' },

                  { label: 'Cash in Hand', value: trainer?.cash_in_hand ?? 'NA' },
                  {
                    label: 'Cash Clearance Date',
                    value: trainer?.cash_clearance_date ?? 'NA',
                  },
                  {
                    label: 'Last Booking',
                    value: trainer?.last_booking_was ?? 'NA',
                  },
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                    <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                      {item.label}
                    </Box>
                    <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                      :
                    </Box>
                    <Box component="span">{schoolTrainersLoading ? 'Loading...' : item.value}</Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          ))
        ) : (
          !create && (
            <Typography color="textSecondary" sx={{ color: '#CF5A0D' }}>
              No trainer under this school
            </Typography>
          )
        )
      ) : (
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
      )}
      {totalPages > 5 && (
        <TablePaginationCustom
          count={totalPages}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          // dense={table.dense}
        />
      )}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={() => {
          confirm.onFalse();
          handleRemove();
        }}
        action={
          <Button variant="contained" color="error">
            Delete
          </Button>
        }
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={(e) => {
            popover.onClose();
            router.push(paths.dashboard.user.details(trainerId));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            confirm.onTrue();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Remove
        </MenuItem>
      </CustomPopover>
    </Box>
  );
}
