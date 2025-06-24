import React from 'react';
import { TableRow, TableCell, IconButton, MenuItem, Tooltip, Avatar } from '@mui/material';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function SupportTableRow({ row, t }) {
  const { user, message } = row;
  const router = useRouter();

  const popover = usePopover();
  const { enqueueSnackbar } = useSnackbar();

  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.user.details(user_id));
  };
  return (
    <TableRow hover>
      <TableCell
        sx={{
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={row.user_id ? () => handleUserDetails(row.user_id) : undefined}
      >
        {user?.name || t('n/a')}
      </TableCell>
      <TableCell>{user?.email || t('n/a')}</TableCell>
      <TableCell>{message || t('n/a')}</TableCell>
    </TableRow>
  );
}
