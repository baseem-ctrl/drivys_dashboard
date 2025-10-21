import { TableRow, TableCell, Typography, Chip } from '@mui/material';

export default function StudentRow({ row, t, index }) {
  const isOdd = index % 2 !== 0;

  return (
    <TableRow
      sx={{
        backgroundColor: isOdd ? '#f5f5f5' : 'transparent', // odd rows colored, even rows transparent/white
        '&:hover': {
          backgroundColor: '#e0e0e0',
        },
      }}
    >
      <TableCell sx={{ fontWeight: 500, color: '#374151' }}>
        {row?.id || t('n/a')}
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>
          {row?.name || t('n/a')}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: '#4b5563' }}>
          {row?.preferred_trainer_lang?.dialect_name || t('n/a')}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: '#4b5563' }}>
          {row?.email || t('n/a')}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: '#4b5563' }}>
          {row?.phone || t('n/a')}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={row?.is_active ? 'Active' : 'Inactive'}
          sx={{
            fontWeight: 500,
            color: row?.is_active ? '#166534' : '#991b1b',
            backgroundColor: row?.is_active ? '#dcfce7' : '#fee2e2',
            borderRadius: '9999px',
            height: '26px',
          }}
        />
      </TableCell>
    </TableRow>
  );
}
