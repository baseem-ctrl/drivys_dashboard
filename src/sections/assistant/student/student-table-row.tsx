import { TableRow, TableCell, Typography, Chip } from '@mui/material';

export default function StudentRow({ row }) {
  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2">{row?.name || 'N/A'}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {' '}
          {row?.preferred_trainer_lang?.dialect_name || 'N/A'}{' '}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2"> {row?.email || 'N/A'} </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row?.phone || 'N/A'}</Typography>
      </TableCell>

      <TableCell>
        <Chip
          variant="soft"
          label={row?.is_active ? 'Active' : 'Inactive'}
          color={row?.is_active ? 'success' : 'error'}
        />
      </TableCell>
    </TableRow>
  );
}
