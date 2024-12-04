import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { Tooltip } from '@mui/material';
import { sendNotification } from 'src/api/notification';
import ConfirmDialogSend from 'src/components/custom-dialog/confirm-dailog-send';
import { useState } from 'react';
import moment from 'moment';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;

  row: any;
  onSelectRow: VoidFunction;
};

export default function NotificationTableRow({ row, selected, onSelectRow }: Props) {
  const { user, title, description, data, user_id, sent_at } = row;
  const { email, user_type, phone, locale, gender } = user;
  const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  const { no_of_sessions, session_dates, pickup_location, trainer_details } = parsedData;
  const { enqueueSnackbar } = useSnackbar();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log('row', row);
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const handleRowClick = (stateId: string) => {
    onSelectRow();
  };

  const shouldDisplayRow = user_id && title && description && user_type;

  const handleSendNotification = async () => {
    const notificationData = {
      user_ids: [user.id],
      user_type,
      title,
      description,
      send_all: 0,
    };

    try {
      setLoading(true);
      const response = await sendNotification(notificationData);
      enqueueSnackbar('Notification sent successfully!', {
        variant: 'success',
      });
      setConfirmDialogOpen(false);
      setLoading(false);
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

      setConfirmDialogOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      {shouldDisplayRow && (
        <TableRow
          hover
          selected={selected}
          onClick={() => handleRowClick(user_id)}
          sx={{ cursor: 'pointer' }}
        >
          <TableCell sx={{ fontWeight: 500, padding: 2, color: 'text.primary' }}>
            {user_id || 'N/A'}
          </TableCell>

          <TableCell sx={{ color: 'warning.main', fontWeight: 500, padding: 2 }}>
            {title || 'N/A'}
          </TableCell>

          <TableCell sx={{ fontWeight: 500, padding: 2, color: 'text.secondary' }}>
            {description || 'N/A'}
          </TableCell>

          <TableCell sx={{ fontWeight: 500, padding: 2 }}>
            <Label color="info">{user_type || ''}</Label>
          </TableCell>

          <TableCell sx={{ fontWeight: 500, padding: 2 }}>
            {trainer_details?.name || 'N/A'}
          </TableCell>

          <TableCell>
            <Label color="success">
              {moment(sent_at).format('YYYY-MM-DD HH:mm:ss')} {/* Format the sent_at value */}
            </Label>
          </TableCell>
        </TableRow>
      )}
      <ConfirmDialogSend
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title="Send Notification"
        content="Are you sure you want to send this notification?"
        onConfirm={handleSendNotification}
        loading={loading}
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          View
        </MenuItem>
      </CustomPopover>
    </>
  );
}
