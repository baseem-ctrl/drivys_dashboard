import { TableRow, TableCell, Typography, Chip } from '@mui/material';

export default function StudentRow({ row, t }) {
  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2">{row?.id || t('n/a')}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row?.name || t('n/a')}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {' '}
          {row?.preferred_trainer_lang?.dialect_name || t('n/a')}{' '}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2"> {row?.email || t('n/a')} </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row?.phone || t('n/a')}</Typography>
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
