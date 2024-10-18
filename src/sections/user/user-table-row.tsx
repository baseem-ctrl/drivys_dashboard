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
import { Link } from '@mui/material';

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

  const quickEdit = useBoolean();

  const redirectToDetailsPage = () => {
    router.push(paths.dashboard.user.details(row?.id));
  };


  const popover = usePopover();
  const router = useRouter();
  return (
    <>
      <TableRow hover selected={selected} sx={{ cursor: "pointer" }} onClick={redirectToDetailsPage}>
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
              primary={name ?? 'NA'}
              secondary={email ?? 'NA'}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
              }}
            />
            <Label
              variant="soft"
              color="info"
            >
              {user_type}
            </Label>
          </Link>

        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {country_code ? `${country_code}-${phone}` : phone || 'NA'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(dob).toISOString().split('T')[0] ?? 'NA'}</TableCell>

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
              {row?.max_cash_in_hand_allowed ?? 'NA'}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.cash_in_hand ?? 'NA'}</TableCell>
          </>
        )}
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
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
