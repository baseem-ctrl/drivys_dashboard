import { useState } from 'react';
import { format } from 'date-fns';
import { Star, StarBorder } from '@mui/icons-material';

// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type RowProps = {
  school_id: number;
  school_name: string;
  revenue: string | number;
  bookings: number;
  trainer_ratings: string | null;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableLabels: any;
  tableData: RowProps[];
}

export default function SchoolPerformanceDetails({
  title,
  subheader,
  tableLabels,
  tableData,
  ...other
}: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'auto', height: '315px' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 960 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {displayedData.map((row) => (
                <SchoolPerformanceRow key={row.school_id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

type SchoolPerformanceRowProps = {
  row: RowProps;
};

function SchoolPerformanceRow({ row }: SchoolPerformanceRowProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const popover = usePopover();

  // Function to render stars
  const renderRatingStars = (rating: string | null) => {
    const ratingValue = rating ? parseFloat(rating) : 0;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(
        i < ratingValue ? <Star key={i} color="primary" /> : <StarBorder key={i} color="primary" />
      );
    }

    return stars;
  };

  const handleDownload = () => {
    popover.onClose();
    console.info('DOWNLOAD', row.school_id);
  };

  const handlePrint = () => {
    popover.onClose();
    console.info('PRINT', row.school_id);
  };

  const handleShare = () => {
    popover.onClose();
    console.info('SHARE', row.school_id);
  };

  const handleDelete = () => {
    popover.onClose();
    console.info('DELETE', row.school_id);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <ListItemText
            primary={row.school_name}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={row.revenue}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={row.bookings}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderRatingStars(row.trainer_ratings)}
          </Box>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleDownload}>
          <Iconify icon="eva:cloud-download-fill" />
          Download
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <Iconify icon="solar:share-bold" />
          Share
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}
