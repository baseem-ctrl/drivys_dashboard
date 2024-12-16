// @mui
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { ASSETS_API } from 'src/config-global';

// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  name: string;
  flag: string;
  rank: string;
  email: string;
  category: string;
  avatarUrl: string;
  totalAmount: number;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function EcommerceBestSalesman({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 640 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row) => (
                <EcommerceBestSalesmanRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type EcommerceBestSalesmanRowProps = {
  row?: any;
};

function EcommerceBestSalesmanRow({ row }: EcommerceBestSalesmanRowProps) {
  const CoverUrl = `${ASSETS_API}/assets/images/avatar/avatar_2.jpg`;
  return (
    <TableRow>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar alt={CoverUrl} src={CoverUrl} sx={{ mr: 2 }} />
        {row?.name ?? 'NA'}
      </TableCell>

      <TableCell>{row?.email ?? 'NA'}</TableCell>

      <TableCell align="center">{row?.total_bookings ?? 'NA'}</TableCell>
    </TableRow>
  );
}
