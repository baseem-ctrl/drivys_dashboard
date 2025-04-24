import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Typography, Button, TextField } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import { updateCommission } from 'src/api/commission';
import { useGetSchoolById } from 'src/api/school';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function TrainerCommissionRow({ reload, row }) {
  const { t } = useTranslation();
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

  const { details } = useGetSchoolById(vendor_id);
  const minCommission = details?.min_commision ?? null;
  const maxCommission = details?.max_commision ?? null;
  const [newCommission, setNewCommission] = useState(vendor_session_commission_in_percentage);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewCommission(value);

    if (minCommission !== null && maxCommission !== null) {
      if (value < minCommission || value > maxCommission) {
        setError(`Commission must be between ${minCommission}% and ${maxCommission}%.`);
      } else {
        setError('');
      }
    }
  };

  const handleSaveClick = async () => {
    if (error) return;

    setIsUpdating(true);
    try {
      const body = {
        mapping_id: vendor_trainer_mapping_id,
        vendor_commission_in_percentage: newCommission,
      };

      await updateCommission(body);
      enqueueSnackbar(t('Commission updated successfully'), { variant: 'success' });
      setIsEditing(false);
      reload();
    } catch (error) {
      enqueueSnackbar(t('Failed to update commission'), { variant: 'error' });
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
      <TableCell style={{ fontWeight: 700 }}>
        {isEditing ? (
          <TextField
            size="small"
            value={newCommission}
            onChange={handleInputChange}
            variant="outlined"
            error={!!error}
            helperText={
              <Typography sx={{ color: error ? 'error.main' : 'primary.main', fontSize: 14 }}>
                {' '}
                {error ||
                  `${t('School Commission must be between')} ${
                    minCommission !== null ? `${minCommission}%` : 'N/A'
                  } ${t('and')} ${maxCommission !== null ? `${maxCommission}%` : 'N/A'}.`}
              </Typography>
            }
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
              {t('Save')}
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
              {t('Cancel')}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
          >
            {isUpdating ? t('Updating...') : t('Update')}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
