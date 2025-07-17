// @mui
import moment from 'moment';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { FormHelperText, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// components
import Iconify from 'src/components/iconify';
import {
  RemoveTrainerFromSchool,
  useGetSchoolTrainerList,
  useGetSchoolTrainers,
} from 'src/api/school';
import { useTable } from 'src/components/table';
import { Button, CircularProgress, MenuItem, Typography, Grid } from '@mui/material';

import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import { useGetGenderEnum, useGetGearEnum, createTrainer } from 'src/api/users';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetTrainerNoSchool } from 'src/api/trainer';
import { updateUserVerification } from 'src/api/school-admin';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  candidates: any;
  create: Boolean;
  onCreate: Function;
  vendor_id: string | number;
};

export default function SchoolAdminTrainers({ candidates, create, onCreate, vendor_id }: Props) {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [trainerMappingId, setTrainerMappingId] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editDetails, setIsEditDetails] = useState();
  const [index, setIndex] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const {
    schoolTrainersList,
    schoolTrainersLoading,
    schoolTrainersError,
    totalPages,
    revalidateTrainers,
  } = useGetSchoolTrainerList({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
  });
  const popover = usePopover();
  const confirm = useBoolean();
  const { t } = useLocales();

  const NewUserSchema = Yup.object().shape({
    vehicle_number: Yup.string().nullable(), // not required
    phone: Yup.string().matches(
      /^5\d{0,8}$/,
      'Phone number should start with 5 and not exceed 9 digits'
    ),
    vendor_commission_in_percentage: Yup.number()
      .required('vendor commission is required')
      .when([], {
        is: () =>
          candidates[0]?.vendor?.min_commision >= 0 &&
          candidates[0]?.vendor?.max_commision >= 0 &&
          candidates[0]?.vendor?.max_commision &&
          candidates[0]?.vendor?.min_commision,
        then: (schema) =>
          schema
            .min(
              candidates[0]?.vendor?.min_commision,
              `School commission must be greater than or equal to ${candidates[0]?.vendor?.min_commision}%`
            )
            .max(
              candidates[0]?.vendor?.max_commision,
              `School commission must be less than or equal to ${candidates[0]?.vendor?.max_commision}%`
            ),
        otherwise: (schema) => schema,
      }),
    dob: Yup.string()
      .required('Date of birth is required for students and trainers.')
      .test('is-valid-date', 'The dob field must be a valid date.', function (value) {
        if (!value) return true;
        const isValidDate = !isNaN(Date.parse(value));
        return isValidDate;
      })
      .test('is-before-today', 'The dob field must be a date before today.', function (value) {
        if (!value) return true;
        const today = new Date();
        const dob = new Date(value);
        return dob < today;
      })
      .test('is-18-or-older', 'User must be 18 or older.', function (value) {
        if (!value) return true;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        return (
          age > 18 ||
          (age === 18 &&
            (monthDifference > 0 ||
              (monthDifference === 0 && today.getDate() >= birthDate.getDate())))
        );
      }),
    certificate_commission_in_percentage: Yup.number()
      .required(t('certificate_commission_required'))
      .when([], {
        is: () =>
          candidates[0]?.certificate_min_commision >= 0 &&
          candidates[0]?.certificate_max_commision >= 0 &&
          candidates[0]?.certificate_max_commision &&
          candidates[0]?.certificate_min_commision,
        then: (schema) =>
          schema
            .min(
              candidates[0]?.certificate_min_commision,
              t('min_certificate_commission_error', {
                min: candidates[0]?.certificate_min_commision ?? 0,
              })
            )
            .max(
              candidates[0]?.certificate_max_commision,
              t('max_certificate_commission_error', {
                max: candidates?.certificate_max_commision ?? 100,
              })
            ),
        otherwise: (schema) => schema,
      }),
  });
  const defaultValues = useMemo(
    () => ({
      name: editDetails?.user?.name || '',
      name_ar: editDetails?.user?.name_ar || '',
      email: editDetails?.user?.email || '',
      password: '',

      vendor_commission_in_percentage: editDetails?.vendor_commission_in_percentage || '',
      certificate_commission_in_percentage: editDetails?.certificate_commission_in_percentage || '',
      vehicle_number: editDetails?.vehicle_number || '',
      phone: '',
      dob: editDetails?.user?.dob?.split('T')[0] || '',
    }),
    [candidates, editDetails]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });

  // Function to close the edit pop-up
  const handleEditClose = () => {
    setOpenEdit(false);
  };
  const handleCancelClick = () => {
    onCreate();
  };
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  // useEffect(() => {
  //   if (editDetails) {
  //     reset({
  //       cash_clearance_date: new Date(editDetails.cash_clearance_date).toISOString().split('T')[0],
  //       name: editDetails?.user?.name,
  //       email: editDetails?.user?.email,
  //       last_booking_was: new Date(editDetails.last_booking_was).toISOString().split('T')[0],
  //       cash_in_hand: editDetails.cash_in_hand,
  //       vendor_commission_in_percentage: editDetails.vendor_commission_in_percentage,
  //       max_cash_in_hand_allowed: editDetails.max_cash_in_hand_allowed,
  //     });
  //   }
  // }, [editDetails, reset]);
  const values = watch();
  useEffect(() => {
    if (candidates?.id) {
      reset(defaultValues);
    }
  }, [candidates, reset]);

  const onSubmit = async (data: any) => {
    const body: any = {
      name: data?.name,
      name_ar: data?.name_ar,
      email: data?.email,
      password: data?.password,
      vendor_commission_in_percentage: data?.vendor_commission_in_percentage,
      certificate_commission_in_percentage: data?.certificate_commission_in_percentage,
      vehicle_number: data?.vehicle_number,
      phone: data?.phone,
      country_code: '971',
      dob: moment(data?.dob).format('YYYY-MM-DD'),
    };

    // Add vendor_id for new trainer, or update if edit
    if (!editData) {
      body.vendor_id = candidates[0]?.vendor_id;
    } else {
      body.id = editDetails?.id;
    }

    try {
      const response = await createTrainer(body);
      if (response) {
        enqueueSnackbar('Trainer created successfully', { variant: 'success' });
        onCreate();
        revalidateTrainers();
        reset();
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      handleEditClose();
      setIsEditDetails(null);
    }
  };
  const handlePopoverOpen = (e, trainer: any, index) => {
    popover.onOpen(e);
    setIsEditDetails(trainer);
    setTrainerId(trainer?.user_id);
    setTrainerMappingId(trainer?.id);
    setIndex(index);
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
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  return (
    <>
      {create && (
        <Stack direction="column" spacing={2} sx={{ p: 3, width: '50%' }}>
          <Typography variant="h6" gutterBottom>
            Create New Trainer
          </Typography>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box rowGap={3} display="grid" gridTemplateColumns="1fr" columnGap={2}>
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
                    <RHFTextField name="name" label="Name (En)" fullWidth />
                    <RHFTextField name="name_ar" label="Name (Ar)" fullWidth />

                    <RHFTextField name="email" label="Email Address" fullWidth />
                    <RHFTextField
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <RHFTextField name="phone" label="Phone Number" type="number" prefix="+971" />
                    <RHFTextField name="vehicle_number" label="Vehicle Number" fullWidth />
                    <div>
                      <RHFTextField
                        name="vendor_commission_in_percentage"
                        label="School Commision"
                        fullWidth
                        suffix="%"
                      />
                      <FormHelperText sx={{ color: 'primary.main', ml: 1 }}>
                        School Commission must be in between{' '}
                        {candidates[0]?.vendor?.min_commision || '0'}% and{' '}
                        {candidates[0]?.vendor?.max_commision || '0'}%
                      </FormHelperText>
                    </div>
                    <div>
                      <RHFTextField
                        name="certificate_commission_in_percentage"
                        label="Certificate Commision"
                        fullWidth
                        suffix="%"
                      />
                      <FormHelperText sx={{ color: 'primary.main', ml: 1 }}>
                        Certificate Commission must be in between{' '}
                        {candidates[0]?.vendor?.certificate_min_commision || '0'}% and{' '}
                        {candidates[0]?.vendor?.certificate_max_commision || '0'}%
                      </FormHelperText>
                    </div>
                    <RHFTextField
                      name="dob"
                      label="Date of Birth"
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    spacing={2}
                    sx={{ mt: 3 }}
                  >
                    <Button variant="outlined" sx={{ width: 'auto' }} onClick={handleCancelClick}>
                      Cancel
                    </Button>
                    <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                      {'Create User'}
                    </LoadingButton>
                  </Stack>
                </Card>
              </Grid>
            </Box>

            {/* <Box sx={{ mt: 2, display: 'flex', gap: '15px' }}>
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
            </Box> */}
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
          schoolTrainersList?.length > 0 && !create ? (
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
                    { label: 'Name (Ar)', value: trainer?.user?.name_ar ?? t('n/a') },
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
                      label: 'School Commission',
                      value: trainer?.vendor_commission_in_percentage ?? 'NA',
                    },
                    {
                      label: 'Cash Clearance Date',
                      value: trainer?.cash_clearance_date
                        ? moment(trainer.cash_clearance_date).format('YYYY-MM-DD') // Format the date using moment
                        : 'NA', // Default value if date is not available
                    },
                    {
                      label: 'Last Booking',
                      value: trainer?.last_booking_was
                        ? moment(trainer.last_booking_was).format('YYYY-MM-DD') // Format the date using moment
                        : 'NA', // Default value if date is not available
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
          title="Remove"
          content="Are you sure want to remove this trainer?"
          onConfirm={() => {
            confirm.onFalse();
            handleRemove();
          }}
          action={
            <Button variant="contained" color="error">
              Remove
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
        </CustomPopover>
      </Box>
    </>
  );
}
