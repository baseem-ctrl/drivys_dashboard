// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TableCell from '@mui/material/TableCell';
import TableRow, { TableRowProps } from '@mui/material/TableRow';

// ----------------------------------------------------------------------

export default function CardSkeleton({ ...other }: TableRowProps) {
  return (
    <TableRow {...other}>
      <TableCell colSpan={12}>
        <Stack spacing={5} direction="row" alignItems="center">
          {/* <Skeleton sx={{ borderRadius: 1.5, width: 230, height: 250, flexShrink: 0 }} /> */}
          <Skeleton sx={{ width: 370, height: 430 }} />
          <Skeleton sx={{ width: 370, height: 430 }} />
          <Skeleton sx={{ width: 370, height: 430 }} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}
