import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Table,
  TableBody,
  TableHead,
  TablePagination,
  Paper,
  Link,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function RevenueReportRow({ row }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [trainerPage, setTrainerPage] = useState(0);
  const [trainerRowsPerPage, setTrainerRowsPerPage] = useState(5);
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentRowsPerPage, setPaymentRowsPerPage] = useState(5);
  const { t } = useTranslation();

  const handleTrainerPageChange = (event, newPage) => {
    setTrainerPage(newPage);
  };
  const handleTrainerRowsPerPageChange = (event) => {
    setTrainerRowsPerPage(parseInt(event.target.value, 10));
    setTrainerPage(0);
  };

  const handlePaymentPageChange = (event, newPage) => {
    setPaymentPage(newPage);
  };
  const handlePaymentRowsPerPageChange = (event) => {
    setPaymentRowsPerPage(parseInt(event.target.value, 10));
    setPaymentPage(0);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Typography variant="body2">{row['School Name'] || t('n/a')}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {' '}
            <span className="dirham-symbol">&#x00EA;</span>
            {row['Bookings Revenue By School'] || '0'}{' '}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{row['Total Number Of Bookings'] || '0'}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {row['Total Number Of Completed Bookings'] || '0'}
          </Typography>
        </TableCell>

        <TableCell>
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isExpanded ? 'Hide details' : 'Click here to view more details'}
          </Link>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <>
          {/* Bookings Revenue By Trainer Table */}
          <TableRow>
            <TableCell colSpan={5}>
              <Paper
                sx={{
                  marginBottom: 2,
                  padding: 2,

                  borderRadius: '8px',
                }}
              >
                <Typography variant="h6" color="primary">
                  Bookings Revenue By Trainer
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Trainer Name</TableCell>
                      <TableCell>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row['Bookings Revenue By Trainer']
                      ?.slice(
                        trainerPage * trainerRowsPerPage,
                        trainerPage * trainerRowsPerPage + trainerRowsPerPage
                      )
                      .map((trainer, index) => (
                        <TableRow key={index}>
                          <TableCell>{trainer['Trainer Name']}</TableCell>
                          <TableCell>{trainer.Revenue}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 15]}
                  component="div"
                  count={row['Bookings Revenue By Trainer']?.length || 0}
                  rowsPerPage={trainerRowsPerPage}
                  page={trainerPage}
                  onPageChange={handleTrainerPageChange}
                  onRowsPerPageChange={handleTrainerRowsPerPageChange}
                />
              </Paper>
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  );
}
