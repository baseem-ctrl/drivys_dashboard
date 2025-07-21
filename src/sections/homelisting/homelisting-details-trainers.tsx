// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// components
import Iconify from 'src/components/iconify';
import { RemoveTrainerFromSchool } from 'src/api/school';
import { useTable } from 'src/components/table';
import {
  Autocomplete,
  Button,
  CircularProgress,
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
import { createHomeListing, RemoveTrainerFromHomeListing } from 'src/api/homelisting';
import { useParams } from 'react-router';
import { deleteTrainer } from 'src/api/trainer';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  homelistingdetails: any;
  create: Boolean;
  onCreate: Function;
  revalidateDetails: any;
  detailsLoading: any;
};

export default function HomeListingTrainers({
  homelistingdetails,
  create,
  onCreate,
  revalidateDetails,
  detailsLoading,
}: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [trainerMappingId, setTrainerMappingId] = useState('');

  // const [loadingButton, setLoadingButton] = useState(false);
  const { users, usersLoading, revalidateUsers } = useGetUsers({
    page: table?.page,
    limit: table?.rowsPerPage,
    user_types: 'TRAINER',
    search: search,
    is_verified: '1',
  });

  const popover = usePopover();
  const confirm = useBoolean();
  const NewUserSchema = Yup.object().shape({
    trainer_id: Yup.mixed().required(),
  });

  const defaultValues = useMemo(
    () => ({
      trainer_id: '',
    }),
    [homelistingdetails]
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

  useEffect(() => {
    if (homelistingdetails?.id) {
      reset(defaultValues);
    }
  }, [homelistingdetails, reset]);

  const onSubmit = async (data: any) => {
    const body = new FormData();

    homelistingdetails?.translations?.forEach(
      (
        translation: { title: string | Blob; locale: string; description: string | Blob },
        index: any
      ) => {
        body.append(`translation[${index}][title]`, translation.title);
        body.append(`translation[${index}][locale]`, translation.locale);
        body.append(`translation[${index}][description]`, translation.description);
      }
    );

    if (homelistingdetails?.trainers?.length > 0) {
      homelistingdetails.trainers.forEach((trainer: { id: string }, index: number) => {
        body.append(`trainers[${index}][user_id]`, trainer.trainer_id);
      });

      // Append the latest trainer at the end of the existing list
      const nextIndex = homelistingdetails.trainers.length;

      body.append(`trainers[${nextIndex}][user_id]`, data?.trainer_id?.id);
    } else {
      // Append the latest trainer as the first entry
      body.append(`trainers[0][user_id]`, data?.trainer_id?.id);
    }

    body.append('home_listing_id', params?.id ?? '');

    try {
      // setLoadingButton(true);
      const response = await createHomeListing(body);
      if (response) {
        enqueueSnackbar(response?.message ?? 'Trainer Added Successfully');
        onCreate();
        revalidateDetails();
        reset(defaultValues);
        setSearch('');
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
      // setLoadingButton(false);
    }
  };
  const handleDeleteTrainer = async (homeListingId, trainerId) => {
    try {
      const response = await RemoveTrainerFromHomeListing(homeListingId, trainerId);
      if (response) {
        enqueueSnackbar('Trainer Deleted successfully."', {
          variant: 'success',
        });
        revalidateDetails();
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

  const handlePopoverOpen = (e, trainer: any, deleteId) => {
    popover.onOpen(e);
    setTrainerId(trainer?.id);
    setTrainerMappingId(trainer?.id);
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
            {t('Add New Trainer')}
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
                    label={t('Search Trainer')}
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
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: '15px' }}>
              <LoadingButton
                sx={{ width: '100%', color: '#CF5A0D', borderColor: '#CF5A0D' }}
                type="submit"
                variant="outlined"
                loading={detailsLoading}
              >
                {t('Save')}
              </LoadingButton>
              <LoadingButton
                onClick={() => {
                  onCreate();
                }}
                color="error"
                variant="outlined"
                sx={{ width: '100%' }}
              >
                {t('Cancel')}
              </LoadingButton>
            </Box>
          </FormProvider>
        </Stack>
      )}
      {!detailsLoading ? (
        homelistingdetails?.trainers?.length > 0 ? (
          homelistingdetails?.trainers?.map((trainerItem: any) => {
            const trainerdisplayed = trainerItem?.trainer;
            return (
              <Stack
                component={Card}
                direction="column"
                spacing={2}
                key={trainerdisplayed?.id}
                sx={{ p: 3, cursor: 'pointer' }}
              >
                <Stack direction="row" spacing={2} key={trainerdisplayed?.id}>
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={(e) => handlePopoverOpen(e, trainerdisplayed, trainerItem?.id)}
                  >
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>

                  <Avatar
                    alt={trainerdisplayed?.name ?? t('n/a')}
                    src={trainerdisplayed?.photo_url}
                    sx={{ width: 48, height: 48 }}
                  />

                  <Stack spacing={1}>
                    <ListItemText
                      primary={trainerdisplayed?.user?.name}
                      secondary={trainerdisplayed?.user?.email}
                      secondaryTypographyProps={{
                        mt: 0.5,
                        component: 'span',
                        typography: 'caption',
                        color: 'text.disabled',
                      }}
                    />
                  </Stack>
                </Stack>
                <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
                  {[
                    { label: t('name'), value: trainerdisplayed?.name ?? t('n/a') },
                    { label: t('email'), value: trainerdisplayed?.email ?? t('n/a') },
                    {
                      label: t('phone_number'),
                      value: trainerdisplayed?.country_code
                        ? `${trainerdisplayed?.country_code}-${trainerdisplayed?.phone}`
                        : trainerdisplayed?.phone ?? t('n/a'),
                    },
                    { label: t('locale'), value: trainerdisplayed?.locale ?? t('n/a') },
                    { label: t('gender'), value: trainerdisplayed?.gender ?? t('n/a') },
                    {
                      label: t('display_order'),
                      value: trainerItem?.display_order ?? t('n/a'),
                    },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                      <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                        {item.label}
                      </Box>
                      <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                        :
                      </Box>
                      <Box component="span">{detailsLoading ? t('loading') : item.value}</Box>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            );
          })
        ) : (
          !create && (
            <Typography color="textSecondary" sx={{ color: '#CF5A0D' }}>
              {t('no_trainer_found')}
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
            popover.onClose();
            router.push(paths.dashboard.user.details(trainerId));
          }}
        >
          <Iconify icon="eva:eye-outline" sx={{ mr: 1 }} />
          View
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={() => {
          confirm.onFalse();
          handleDeleteTrainer(homelistingdetails?.id, trainerId);
        }}
        action={
          <Button variant="contained" color="error">
            Delete
          </Button>
        }
      />
    </Box>
  );
}
