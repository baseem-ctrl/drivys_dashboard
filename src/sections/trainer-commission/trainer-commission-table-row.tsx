import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Typography, Button, TextField } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import { updateCommission } from 'src/api/commission';
// ----------------------------------------------------------------------

export default function TrainerCommissionRow({ reload, row }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const router = useRouter();
  const {
    vendor_session_commission_in_percentage,
    trainer_name = [],
    vendor_id,
    vendor_trainer_mapping_id,
    vendor_name,
    trainer_id,
  } = row;
  console.log('row', row);
  const [newCommission, setNewCommission] = useState(vendor_session_commission_in_percentage);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCommission(event.target.value);
  };

  const handleSaveClick = async () => {
    setIsUpdating(true);
    try {
      const body = {
        mapping_id: vendor_trainer_mapping_id,
        vendor_commission_in_percentage: newCommission,
      };

      await updateCommission(body);
      enqueueSnackbar('Commission updated successfully', { variant: 'success' });
      setIsEditing(false);
      reload();
    } catch (error) {
      enqueueSnackbar('Failed to update commission', { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TableRow hover>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover':
              user?.user?.user_type !== 'SCHOOL_ADMIN'
                ? { textDecoration: 'underline' }
                : { textDecoration: 'none' },
          }}
          onClick={() =>
            user?.user?.user_type !== 'SCHOOL_ADMIN'
              ? router.push(paths.dashboard.user.details(trainer_id))
              : ''
          }
        >
          {trainer_name || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell
        variant="body2"
        sx={{
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover':
            user?.user?.user_type !== 'SCHOOL_ADMIN'
              ? { textDecoration: 'underline' }
              : { textDecoration: 'none' },
        }}
        onClick={() =>
          user?.user?.user_type !== 'SCHOOL_ADMIN'
            ? router.push(paths.dashboard.school.details(vendor_id))
            : ''
        }
      >
        {vendor_name || 'N/A'}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            size="small"
            value={newCommission}
            onChange={handleInputChange}
            variant="outlined"
          />
        ) : (
          `${vendor_session_commission_in_percentage}%`
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSaveClick()}
              disabled={isUpdating}
              sx={{ marginRight: '10px' }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setIsEditing(false);
                setNewCommission(vendor_session_commission_in_percentage);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Commission'}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
