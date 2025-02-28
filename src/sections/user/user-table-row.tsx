// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { IUserItem } from 'src/types/user';
import { useLocales } from 'src/locales';

// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import UserQuickEditForm from './user-quick-edit-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useState } from 'react';
import { Box, Link } from '@mui/material';
import { updateUser } from 'src/api/users';
import { useSnackbar } from 'src/components/snackbar';
import moment from 'moment';

// ----------------------------------------------------------------------

type Props = {
  selected?: boolean;
  onEditRow: VoidFunction;
  row: any;
  onSelectRow?: VoidFunction;
  onDeleteRow: VoidFunction;
  currentUserType?: any;
  reload?: any;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  currentUserType,
  reload,
}: Props) {
  const { name, photo_url, dob, user_type, is_active, email, phone, country_code } = row;

  const confirm = useBoolean();
  const { t } = useLocales();

  const quickEdit = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const redirectToDetailsPage = () => {
    router.push(paths.dashboard.user.details(row?.id));
  };

  const popover = usePopover();
  const router = useRouter();
  const handleVerify = async () => {
    try {
      const body = {
        user_id: row?.id,
        is_verified: row?.verified_at === null ? 1 : 0,
      };
      const response = await updateUser(body);
      if (response) {
        enqueueSnackbar(t('trainer_verified_successfully'));

        reload();
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
    <>
      <TableRow
        hover
        selected={selected}
        sx={{ cursor: 'pointer' }}
        onClick={redirectToDetailsPage}
      >
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={name} src={photo_url} sx={{ mr: 2 }} />
          <Link
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => router.push(paths.dashboard.user.details(row?.id))}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {name ?? t('n_a')}
                  {user_type === 'TRAINER' && row?.verified_at && (
                    <Iconify icon="solar:verified-check-bold" sx={{ color: '#42A5F5' }} />
                  )}
                </Box>
              }
              secondary={email ?? t('n_a')}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
              }}
            />
            <Label variant="soft" color="info">
              {user_type}
            </Label>
          </Link>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {country_code ? `${country_code}-${phone}` : phone || t('n_a')}
        </TableCell>
        {currentUserType !== 'TRAINER' && (
          <TableCell sx={{ whiteSpace: 'nowrap' }}>
            {dob ? new Date(dob).toISOString().split('T')[0] : t('n_a')}
          </TableCell>
        )}
        <TableCell>
          <Label
            variant="soft"
            color={
              (is_active === true && 'success') || (is_active === false && 'error') || 'default'
            }
          >
            {is_active ? 'Active' : 'In Active'}
          </Label>
        </TableCell>
        {currentUserType === 'TRAINER' && (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {row?.vendor?.vendor_translations[0]?.name ?? t('n_a')}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {row?.max_cash_in_hand_allowed ?? t('n_a')}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.cash_in_hand ?? t('n_a')}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              <Label
                variant="soft"
                color={
                  row?.is_suspended === true || row?.is_suspended === 1
                    ? 'success'
                    : row?.is_suspended === false || row?.is_suspended === 0
                    ? 'error'
                    : 'warning'
                }
                sx={{ alignContent: 'center' }}
              >
                {row?.is_suspended ? 'Yes' : 'No'}
              </Label>
            </TableCell>
          </>
        )}
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={(e) => {
                quickEdit.onTrue();
                e.stopPropagation();
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={(e) => {
              e.stopPropagation(); // Prevents the event from reaching parent component
              popover.onOpen(e); // Opens the popover
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={reload}
      />

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
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.user.details(row?.id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>
        {user_type === 'TRAINER' && (
          <MenuItem
            onClick={() => {
              popover.onClose();
              handleVerify();
            }}
          >
            <Iconify icon="solar:verified-check-bold" sx={{ color: '#42A5F5' }} />
            {!row?.verified_at ? 'Verify' : 'Unverify'}
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={onDeleteRow}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
