import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Typography, Button, TextField } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { updateCommission } from 'src/api/commission';
import { useAuthContext } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
import { useGetSchoolById } from 'src/api/school';
// ----------------------------------------------------------------------

interface RowProps {
  vendor_certificate_commission_in_percentage: any;
  max_commission: any;
  min_commission: any;
  vendor_name: any;
}

interface StudentReviewRowProps {
  reload: () => void;
  row: RowProps;
}

export default function CertificateCommissionRow({ reload, row }: StudentReviewRowProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { t } = useTranslation();

  const router = useRouter();
  const {
    trainer_certificate_commission_in_percentage,
    trainer_name = [],
    vendor_id,
    vendor_trainer_mapping_id,
    vendor_name,
    trainer_id,
  } = row;
  const { details } = useGetSchoolById(vendor_id);
  const [newCommission, setNewCommission] = useState(trainer_certificate_commission_in_percentage);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const minCommission = details?.min_commision ?? null;
  const maxCommission = details?.max_commision ?? null;
  const [error, setError] = useState('');
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCommission(event.target.value);
    if (minCommission !== null && maxCommission !== null) {
      if (event.target.value < minCommission || event.target.value > maxCommission) {
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
        certificate_commission_in_percentage: newCommission,
      };

      await updateCommission(body);
      enqueueSnackbar(t('Commission updated successfully'), { variant: 'success' });
      setIsEditing(false);
      reload();
    } catch (error) {
      enqueueSnackbar(t('Failed to update commission'), { variant: 'error' });
    } finally {
      setIsUpdating(false);
      reload();
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
            error={!!error}
            helperText={
              <Typography sx={{ color: error ? 'error.main' : 'primary.main', fontSize: 14 }}>
                {' '}
                {error ||
                  `${t("Certificate Commission must be between")} ${minCommission !== null ? `${minCommission}%` : 'N/A'
                  } ${t("and")} ${maxCommission !== null ? `${maxCommission}%` : 'N/A'}.`}
              </Typography>
            }
          />
        ) : (
          `${trainer_certificate_commission_in_percentage}%`
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
              {t("Save")}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setIsEditing(false);
                setNewCommission(trainer_certificate_commission_in_percentage);
              }}
              disabled={isUpdating}
            >
              {t("Cancel")}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
          >
            {isUpdating ? t('Updating...') : t('Update Commission')}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
