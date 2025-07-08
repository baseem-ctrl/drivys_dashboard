import React, { useState } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import {
  TableRow,
  TableCell,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { mapRoleToPermission, useGetRoles, useMappedRoles } from 'src/api/roles-and-permission';
import { useTranslation } from 'react-i18next';

type PermissionTableRowProps = {
  row: {
    id: number;
    name: string;
    description: string;
    permission_id: any;
  };
  reload: any;
};

export default function PermissionTableRow({ row, reload }: PermissionTableRowProps) {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { mappedRoles, mappedRolesLoading, mappedRolesTotal } = useMappedRoles(0, 10000);
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [rights, setRights] = useState({
    create: false,
    read: true,
    update: false,
    delete: false,
  });
  const { roles } = useGetRoles(0, 1000);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRights((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  React.useEffect(() => {
    if (selectedRoleId && mappedRoles?.length > 0) {
      const matched = mappedRoles.find(
        (item) => item.role_id === selectedRoleId && item.permission_id === row.id
      );
      if (matched) {
        setRights({
          create: matched.create,
          read: matched.read,
          update: matched.update,
          delete: matched.delete,
        });
      } else {
        setRights({
          create: false,
          read: true,
          update: false,
          delete: false,
        });
      }
    }
  }, [selectedRoleId, mappedRoles, row.id]);

  const handleSubmitRoleMapping = async (data: any) => {
    try {
      const mapRole = {
        rolePermissioMapping: [
          {
            permission_id: row.id,
            role_id: selectedRoleId,
            create: rights.create ?? false,
            read: rights.read ?? false,
            update: rights.update ?? false,
            delete: rights.delete ?? false,
          },
        ],
      };

      const response = await mapRoleToPermission(mapRole);
      if (response.status === 'success') {
        enqueueSnackbar(t('role_permission_mapping_success'), {
          variant: 'success',
        });
      }
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
      reload();
      setOpen(false);
    }
  };

  return (
    <>
      <TableRow hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
        <TableCell>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            textTransform="capitalize"
            color="text.primary"
          >
            {row?.name || t('n/a')}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {row?.description || t('no_description')}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Button variant="outlined" size="small" color="primary" onClick={() => setOpen(true)}>
            {t('map_role')}{' '}
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {t('role_mapping_for')}
          <Typography component="span" color="primary" fontWeight={600}>
            "{row.name}"
          </Typography>
        </DialogTitle>{' '}
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('select_role')}</InputLabel>
            <Select
              value={selectedRoleId}
              label={t('select_role')}
              name="role"
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox checked={rights.create} onChange={handleCheckboxChange} name="create" />
            }
            label={t('create')}
          />
          <FormControlLabel
            control={<Checkbox checked={rights.read} onChange={handleCheckboxChange} name="read" />}
            label={t('read')}
          />
          <FormControlLabel
            control={
              <Checkbox checked={rights.update} onChange={handleCheckboxChange} name="update" />
            }
            label={t('update')}
          />
          <FormControlLabel
            control={
              <Checkbox checked={rights.delete} onChange={handleCheckboxChange} name="delete" />
            }
            label={t('delete')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitRoleMapping}
            disabled={!selectedRoleId}
          >
            {t('save')}{' '}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
