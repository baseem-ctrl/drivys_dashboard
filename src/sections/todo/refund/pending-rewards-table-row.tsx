import moment from 'moment';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from 'src/components/label';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Button, LinearProgress, Link, Popover, Switch, Typography } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { paths } from 'src/routes/paths';
import { useState } from 'react';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';
import { processTrainerReward } from 'src/api/loyality';

// ----------------------------------------------------------------------

export default function PendingRewardTableRow({
  row,
  selected,

  reload,
}: Props) {
  const router = useRouter();
  const methods = useForm();
  const { enqueueSnackbar } = useSnackbar();

  const { user } = row;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleRefundAmountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'refund-popover' : undefined;

  const handleClickDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  const handleClickLoyalityDetails = (id) => {
    router.push(paths.dashboard.loyality.details(id));
  };
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('id', row?.id);
    formData.append('document', data?.document);

    try {
      const response = await processTrainerReward(formData);
      if (response) {
        reload();
        enqueueSnackbar('Reward processed successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to process Reward!', { variant: 'error' });
      }
      reload();
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      handlePopoverClose();
    }
  };
  return (
    <TableRow hover selected={selected}>
      <TableCell
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        <Link
          color="inherit"
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (user) {
              handleClickDetails(user?.id);
            }
          }}
        >
          {user?.name || 'N/A'}
        </Link>
      </TableCell>

      <TableCell>
        <Typography fontSize="0.875rem">
          {row?.reward_details?.reward_amount ?? 'N/A'} AED{' '}
        </Typography>

        <Label variant="soft" sx={{ mt: 1, color: 'darkblue' }}>
          {row?.reward_details?.period_type && `${row?.reward_details?.period_type}`}
        </Label>
      </TableCell>

      <TableCell>
        <Switch
          checked={row?.trainer_reward?.is_periodic ?? false}
          disabled
          color={row?.trainer_reward?.is_periodic ? 'success' : 'warning'}
        />
      </TableCell>

      <TableCell>
        {row?.trainer_reward?.start_date
          ? moment(row?.trainer_reward?.start_date)
              .local()
              .format('DD/MM/YY h:mm a')
          : 'N/A'}
      </TableCell>
      <TableCell>
        {' '}
        {row?.trainer_reward?.end_date
          ? moment(row?.trainer_reward?.end_date)
              .local()
              .format('DD/MM/YY h:mm a')
          : 'N/A'}
      </TableCell>
      <TableCell>{row?.notes ? `${row?.notes}` : 'N/A'}</TableCell>

      <TableCell>
        {row?.achieved_date ? (
          <>
            {moment(row?.achieved_date)
              .local()
              .format('DD/MM/YY h:mm a')}
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Claimed At:{' '}
              {row?.claimed_at
                ? moment(row?.claimed_at)
                    .local()
                    .format('DD/MM/YY h:mm a')
                : 'N/A'}
            </Typography>
          </>
        ) : (
          'N/A'
        )}
      </TableCell>

      <TableCell>
        <Button
          variant="outlined"
          color="primary"
          sx={{ fontSize: '15px' }}
          onClick={handleRefundAmountClick}
        >
          Send
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div style={{ padding: 16 }}>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                  Upload Proof of Payment
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <RHFFileUpload name="document" label="Upload Proof of Payment" />

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button variant="outlined" color="primary" onClick={handlePopoverClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                      Submit
                    </Button>
                  </Box>
                </Box>
              </form>
            </FormProvider>
          </div>
        </Popover>
      </TableCell>
    </TableRow>
  );
}
