// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { RHFSwitch, RHFUploadAvatar } from 'src/components/hook-form';
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
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
} from '@mui/material';

import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import { useGetUsers, createUser, useGetGenderEnum, useGetGearEnum } from 'src/api/users';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetTrainerNoSchool } from 'src/api/trainer';

// ----------------------------------------------------------------------

type Props = {
  candidates: any;
  create: Boolean;
  onCreate: Function;
  vendor_id: string | number;
};

export default function SchoolAdminTrainers({ candidates, create, onCreate, vendor_id }: Props) {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { genderData, genderLoading, genderError } = useGetGenderEnum();
  const { gearData, gearLoading, gearError } = useGetGearEnum();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [trainerMappingId, setTrainerMappingId] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editDetails, setIsEditDetails] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [index, setIndex] = useState(null);
  const {
    schoolTrainersList,
    schoolTrainersLoading,
    schoolTrainersError,
    totalPages,
    revalidateTrainers,
  } = useGetSchoolTrainers({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
    vendor_id: vendor_id,
  });
  const { trainers, trainersLoading, trainersError, trainersEmpty, trainersLength } =
    useGetTrainerNoSchool({
      page: table?.page,
      limit: table?.rowsPerPage,
      search: search,
    });
  const popover = usePopover();
  const confirm = useBoolean();
  const NewUserSchema = Yup.object().shape({
    // cash_clearance_date: Yup.string(),
    // cash_in_hand: Yup.string().required('Mention the Cash in hand '),
    // vendor_commission_in_percentage: Yup.string().nullable(),
    // max_cash_in_hand_allowed: Yup.string().nullable(), // not required
  });
  console.log('candidates', candidates);
  console.log('schoolTrainersList', editDetails?.cash_clearance_date);
  const defaultValues = useMemo(
    () => ({
      cash_clearance_date: editDetails?.cash_clearance_date || '',
      cash_in_hand: editDetails?.cash_in_hand || '',
      vendor_commission_in_percentage: editDetails?.vendor_commission_in_percentage || '',
      password: '',

      max_cash_in_hand_allowed: editDetails?.max_cash_in_hand_allowed || '',
    }),
    [candidates]
  );
  console.log('defualt values', defaultValues);
  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });

  const handleEditOpen = (trainer: any) => {
    popover.onClose();
    setEditData(trainer); // Set the current trainer's data
    setOpenEdit(true); // Open the dialog
  };
  console.log('edit data', index);
  // Function to close the edit pop-up
  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  useEffect(() => {
    if (editDetails) {
      reset({
        cash_clearance_date: new Date(editDetails.cash_clearance_date).toISOString().split('T')[0],
        cash_in_hand: editDetails.cash_in_hand,
        vendor_commission_in_percentage: editDetails.vendor_commission_in_percentage,
        max_cash_in_hand_allowed: editDetails.max_cash_in_hand_allowed,
      });
    }
  }, [editDetails, reset]);
  const values = watch();
  useEffect(() => {
    if (candidates?.id) {
      reset(defaultValues);
    }
  }, [candidates, reset]);
  console.log('edit dataaaaa', editDetails?.user?.id);

  const onSubmit = async (data: any) => {
    console.log('Submitting data:', data);

    const body: any = {
      // Fields from the form
      name: data?.name,
      email: data?.email,
      school_commission_in_percentage: data?.school_commission_in_percentage,
      country_code: data?.country_code,
      phone: data?.phone,
      dob: data?.dob,
    };

    // Add trainer_id based on conditions
    if (!editData) {
      body.vendor_id = candidates[0]?.vendor_id;
      // body.trainer_id = editDetails?.user?.id ?? null;
    } else {
      body.vendor_id = editDetails?.vendor_id;
      // body.trainer_id = editDetails?.user_id ?? null;
    }

    console.log('Final body before validation:', body);

    // Validate trainer_id
    // if (!body.trainer_id) {
    //   enqueueSnackbar('Trainer ID is required.', { variant: 'error' });
    //   return;
    // }

    try {
      const response = await createUser(body);
      if (response) {
        enqueueSnackbar(response?.message ?? 'Trainer Added Successfully');
        onCreate();
        revalidateTrainers();
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
      handleEditClose();
    }
  };

  const handlePopoverOpen = (e, trainer: any, index) => {
    popover.onOpen(e);
    setIsEditDetails(trainer);
    setTrainerId(trainer?.id);
    setTrainerMappingId(trainer?.id);
    setIndex(index);
  };
  console.log('Edit details', editDetails);
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
  console.log('Validation errors:', errors);

  return (
    <>
      {create && (
        <Stack component={Card} direction="column" spacing={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New Trainer
          </Typography>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box
              rowGap={3}
              display="grid"
              gridTemplateColumns="1fr"
              columnGap={2}
              sx={{ width: '100%' }}
            >
              <Grid xs={12} md={12}>
                {' '}
                {/* Make it span full width on all screen sizes */}
                <Card sx={{ p: 3, width: '100%' }}>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)', // Use 2 columns on larger screens
                    }}
                  >
                    <RHFTextField name="name" label="Full Name" fullWidth />
                    <RHFTextField name="email" label="Email Address" fullWidth />
                    <RHFTextField
                      name="school_commission_in_percentage"
                      label="School Commission (%)"
                      type="number"
                      fullWidth
                    />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <RHFTextField
                        name="country_code"
                        label="Country Code"
                        sx={{ maxWidth: 100 }}
                        prefix="+"
                        fullWidth
                      />
                      <RHFTextField name="phone" label="Phone Number" sx={{ flex: 1 }} fullWidth />
                    </Stack>
                    <RHFTextField
                      name="dob"
                      label="Date of Birth"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    spacing={2}
                    sx={{ mt: 3 }}
                  >
                    <Button variant="outlined" sx={{ width: 'auto' }}>
                      Cancel
                    </Button>
                    <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                      {'Create User'}
                    </LoadingButton>
                  </Stack>
                </Card>
              </Grid>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: '15px' }}>
              <LoadingButton
                sx={{ width: '100%', color: '#CF5A0D', borderColor: '#CF5A0D' }}
                type="submit"
                variant="outlined"
                loading={schoolTrainersLoading}
              >
                Save
              </LoadingButton>
              <LoadingButton
                onClick={() => {
                  onCreate();
                }}
                color="error"
                variant="outlined"
                sx={{ width: '100%' }}
              >
                Cancel
              </LoadingButton>
            </Box>
          </FormProvider>
        </Stack>
      )}
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
      >
        {!schoolTrainersLoading ? (
          schoolTrainersList?.length > 0 ? (
            schoolTrainersList?.map((trainer: any, index) => (
              <Stack
                component={Card}
                direction="column"
                spacing={2}
                key={trainer?.id}
                sx={{ p: 3 }}
              >
                <Stack direction="row" spacing={2} key={trainer?.id}>
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={(e) => handlePopoverOpen(e, trainer, index)}
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

                    {/* <Stack direction="column"> */}
                    {/* <IconButton
                  size="small"
                  color="error"
                  sx={{
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
                    },
                  }}
                >
                  <Iconify width={18} icon="solar:phone-bold" />
                </IconButton>

                <IconButton
                  size="small"
                  color="info"
                  sx={{
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.16),
                    },
                  }}
                >
                  <Iconify width={18} icon="solar:chat-round-dots-bold" />
                </IconButton>

                <IconButton
                  size="small"
                  color="primary"
                  sx={{
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                    },
                  }}
                >
                  <Iconify width={18} icon="fluent:mail-24-filled" />
                </IconButton>

                <Tooltip title="Download CV">
                  <IconButton
                    size="small"
                    color="secondary"
                    sx={{
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
                      },
                    }}
                  >
                    <Iconify width={18} icon="eva:cloud-download-fill" />
                  </IconButton>
                </Tooltip> */}
                    {/* </Stack> */}
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
                    {
                      label: 'Hand Cash Allowed',
                      value: trainer?.max_cash_in_hand_allowed ?? 'NA',
                    },

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
                      <Box component="span">
                        {schoolTrainersLoading ? 'Loading...' : item.value}
                      </Box>
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
              router.push(paths.dashboard.school.detailsadmin(trainerId));
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
          <MenuItem onClick={() => handleEditOpen(trainerMappingId)}>
            <Iconify icon="eva:edit-fill" />
            Edit
          </MenuItem>
        </CustomPopover>
        <Dialog open={openEdit} onClose={handleEditClose} fullWidth maxWidth="sm">
          <DialogTitle>Edit Trainer Details</DialogTitle>
          <DialogContent
            sx={{
              paddingTop: '11px !important',
            }}
          >
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Box rowGap={1} display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
                <RHFTextField
                  name="cash_clearance_date"
                  label="Cash Clearance Date "
                  type="date"
                  // value={editDetails?.cash_clearance_date}
                  InputLabelProps={{ shrink: true }}
                />
                <RHFTextField
                  name="cash_in_hand"
                  label="Cash in Hand"
                  // value={editDetails?.cash_in_hand}
                />
                <RHFTextField
                  name="vendor_commission_in_percentage"
                  label="Vendor Commission (%)"
                />
                <RHFTextField name="max_cash_in_hand_allowed" label="Max Cash Allowded" />
              </Box>
            </FormProvider>
          </DialogContent>
          <DialogActions>
            <LoadingButton
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              loading={isSubmitting}
            >
              Save Changes
            </LoadingButton>
            <Button onClick={handleEditClose} variant="outlined">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
