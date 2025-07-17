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
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function RewardTableRow({ row, selected, tabIndex, reload }: Props) {
  const router = useRouter();
  const methods = useForm();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

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
          {user?.name || t('n/a')}
        </Link>
      </TableCell>
      <TableCell>
        <Typography fontSize="0.875rem">
          <span className="dirham-symbol">&#x00EA;</span>
          {row?.reward_details?.reward_amount ?? '0'}
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
          : t('n/a')}
      </TableCell>
      <TableCell>
        {' '}
        {row?.trainer_reward?.end_date
          ? moment(row?.trainer_reward?.end_date)
              .local()
              .format('DD/MM/YY h:mm a')
          : t('n/a')}
      </TableCell>
      <TableCell>{row?.notes ? `${row?.notes}` : t('n/a')}</TableCell>

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
                : t('n/a')}
            </Typography>
          </>
        ) : (
          t('n/a')
        )}
      </TableCell>

      {tabIndex === 0 && (
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
      )}
      {tabIndex === 1 && <TableCell></TableCell>}
    </TableRow>
  );
}
