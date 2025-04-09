import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip,
} from '@mui/material';

import moment from 'moment';

import { Typography } from '@mui/material';
import axios from 'axios';

interface RowProps {
  trainer_id: number;
  collector_id: number;
  currency: string;
  remarks: string | null;
  collected_amount: number;
  last_collected_at: string;
  total_number_of_bookings: number;
}

interface CollectedCashListRowProps {
  reload: () => void;
  row: RowProps;
}

const CollectedCashListRow = ({ reload, row }: CollectedCashListRowProps) => {
  const [isOpen, setIsOpen] = useState(false); // To manage the visibility of the detailed table
  const [transactionData, setTransactionData] = useState<any[]>([]); // Data for the detailed table

  // Function to fetch transaction data based on trainer_id
  const fetchTransactionData = async (trainerId: number) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${
        import.meta.env.VITE_HOST_API
      }collector/cash/cash-collected-list-per-transaction?trainer_id=${trainerId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTransactionData(data.data); // Update state with fetched data
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };
  console.log('transactionData', transactionData);
  // Toggle the visibility of the nested table
  const handleRowClick = () => {
    setIsOpen(!isOpen); // Toggle the open state
    if (!isOpen) {
      fetchTransactionData(row.trainer_id); // Fetch data when the row is clicked
    }
  };

  return (
    <>
      {/* Main Row */}
      <TableRow
        hover
        onClick={handleRowClick}
        sx={{
          '&:hover': {
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <TableCell>
          <Typography variant="body2">{row?.trainer_id || 'N/A'}</Typography>
        </TableCell>
        <TableCell>
          {typeof row?.collected_amount === 'number' ? row.collected_amount.toFixed(2) : 'N/A'}
        </TableCell>
        <TableCell>
          {row?.last_collected_at
            ? moment(row.last_collected_at, 'HH:mm:ss dddd YYYY-MM-DD').format(
                'DD MMM YYYY, hh:mm A'
              )
            : 'N/A'}
        </TableCell>
        <TableCell>{row?.total_number_of_bookings || 'N/A'}</TableCell>
        <TableCell>{row?.remarks ?? 'N/A'}</TableCell>
      </TableRow>

      {isOpen && transactionData && transactionData.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} sx={{ padding: 0 }}>
            <TableContainer component={Paper} sx={{ width: '100%' }}>
              <Table sx={{ minWidth: '100%' }} aria-label="transaction details table">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Payment Status</TableCell>
                    <TableCell>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionData.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.txn_amount ?? 'N/A'} AED
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {moment(transaction.created_at, 'HH:mm:ss dddd YYYY-MM-DD').format(
                          'DD MMM YYYY, hh:mm A'
                        ) ?? 'N/A'}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={transaction.payment_method ?? 'N/A'}
                          color="primary"
                          variant="soft"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={transaction.payment_status ?? 'N/A'}
                          color={transaction.payment_status === 'PAID' ? 'success' : 'error'}
                          variant="soft"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{transaction.remarks ?? 'N/A'}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default CollectedCashListRow;
