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
import {
  mapRoleToPermissionBySchoolAdmin,
  useGetRolesBySchoolAdmin,
  useMappedRolesBySchoolAdmin,
} from 'src/api/role-permission-school-admin';

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
  const { mappedRoles, mappedRolesLoading, mappedRolesTotal } = useMappedRolesBySchoolAdmin(
    0,
    10000
  );
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [rights, setRights] = useState({
    create: false,
    read: true,
    update: false,
    delete: false,
  });
  const { roles } = useGetRolesBySchoolAdmin(0, 1000);
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

      const response = await mapRoleToPermissionBySchoolAdmin(mapRole);
      if (response.status === 'success') {
        enqueueSnackbar('Role And Permission Mapped successfully!', {
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
            {row?.name || 'N/A'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {row?.description || 'No description'}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Button variant="outlined" size="small" color="primary" onClick={() => setOpen(true)}>
            Map Role
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Role Mapping for{' '}
          <Typography component="span" color="primary" fontWeight={600}>
            "{row.name}"
          </Typography>
        </DialogTitle>{' '}
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRoleId}
              label="Select Role"
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
            label="Create"
          />
          <FormControlLabel
            control={<Checkbox checked={rights.read} onChange={handleCheckboxChange} name="read" />}
            label="Read"
          />
          <FormControlLabel
            control={
              <Checkbox checked={rights.update} onChange={handleCheckboxChange} name="update" />
            }
            label="Update"
          />
          <FormControlLabel
            control={
              <Checkbox checked={rights.delete} onChange={handleCheckboxChange} name="delete" />
            }
            label="Delete"
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
