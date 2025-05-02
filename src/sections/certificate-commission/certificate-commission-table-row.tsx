import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Typography, Button, TextField } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { updateCommission } from 'src/api/commission';
import { createSchool } from 'src/api/school';
import { useAuthContext } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
// ----------------------------------------------------------------------

interface RowProps {
  certificate_commission_in_percentage: any;
  max_commission: any;
  min_commission: any;
  vendor_name: any;
}

interface StudentReviewRowProps {
  reload: () => void;
  row: RowProps;
}

export default function CertificateCommissionRow({ reload, row }: StudentReviewRowProps) {
  const {
    certificate_commission_in_percentage,
    max_commission,
    min_commission,
    vendor_name = [],
    vendor_id,
  } = row;
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [newCommission, setNewCommission] = useState(certificate_commission_in_percentage);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();
  const handleSaveClick = async () => {
    setIsUpdating(true);
    try {
      const body = {
        vendor_id: vendor_id,
        certificate_commission_in_percentage: newCommission,
      };

      await createSchool(body);
      enqueueSnackbar(t('Commission updated successfully'), { variant: 'success' });
      setIsEditing(false);
      reload();
    } catch (error) {
      enqueueSnackbar(t('Failed to update commission'), { variant: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCommission(event.target.value);
  };
  return (
    <TableRow hover>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() =>
            user?.user?.user_type !== 'SCHOOL_ADMIN'
              ? router.push(paths.dashboard.school.details(vendor_id))
              : ''
          }
        >
          {vendor_name || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>{max_commission || 'N/A'}%</TableCell>
      <TableCell>{min_commission || 'N/A'}%</TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            size="small"
            value={newCommission}
            onChange={handleInputChange}
            variant="outlined"
          />
        ) : (
          `${certificate_commission_in_percentage}%`
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
                setNewCommission(certificate_commission_in_percentage);
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
