import React from 'react';
import { TableRow, TableCell, Typography, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

type PermissionTableRowProps = {
  row: {
    role_id: number;
    role: {
      id: number;
      name: string;
      description: string;
    };
    permission_id: number;
    permission: {
      id: number;
      name: string;
      description: string;
    };
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  reload: () => void;
};

export default function PermissionTableRow({ row, reload }: PermissionTableRowProps) {
  const { t } = useTranslation();

  const accessRights: string[] = [];
  if (row.create) accessRights.push('Create');
  if (row.read) accessRights.push('Read');
  if (row.update) accessRights.push('Update');
  if (row.delete) accessRights.push('Delete');

  return (
    <TableRow hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
      <TableCell>
        <Typography variant="subtitle2" fontWeight={600} textTransform="capitalize">
          {row.role?.name || t('n/a')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.role?.description || '-'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2" fontWeight={600} textTransform="capitalize">
          {row.permission?.name || t('n/a')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.permission?.description || '-'}
        </Typography>
      </TableCell>

      <TableCell>
        {accessRights.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {accessRights.map((right) => (
              <Chip key={right} label={right} size="small" color="primary" />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No access rights
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
}
