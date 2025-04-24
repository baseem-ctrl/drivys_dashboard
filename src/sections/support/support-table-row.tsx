import React from 'react';
import { TableRow, TableCell, IconButton, MenuItem, Tooltip, Avatar } from '@mui/material';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function SupportTableRow({ row }) {
  const { user, status, priority, message, subject } = row;
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
        onClick={() => handleUserDetails(row.user_id)}
      >
        {user?.name || '—'}
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === 'Open' && 'warning') ||
            (status === 'In_Progress' && 'info') ||
            (status === 'Resolved' && 'primary') ||
            (status === 'Closed' && 'success') ||
            'default'
          }
        >
          {status.replace('_', ' ')}
        </Label>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (priority === 'High' && 'error') ||
            (priority === 'Medium' && 'warning') ||
            (priority === 'Low' && 'info') ||
            'default'
          }
        >
          {priority}
        </Label>
      </TableCell>
      <TableCell>{message}</TableCell>
      <TableCell>{subject || 'N/A'}</TableCell>
    </TableRow>
  );
}
