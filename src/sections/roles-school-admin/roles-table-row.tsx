import React from 'react';
import { TableRow, TableCell, Typography, IconButton, Stack, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

type RolesTableRowProps = {
  row: {
    id: number;
    name: string;
    description: string;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function RolesTableRow({ row, onEdit, onDelete }: RolesTableRowProps) {
  const { t } = useTranslation();

  return (
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
          {row?.description || 'No description'}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
