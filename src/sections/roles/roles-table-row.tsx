import React from 'react';
import { TableRow, TableCell, Typography, IconButton, Stack, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  return (
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
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit?.(row.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
