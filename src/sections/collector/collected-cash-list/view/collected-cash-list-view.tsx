import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types

// import ReviewFilters from '../review-filters';
import {
  useGetCashCollectedListPerTransaction,
  useGetCollectorCashInHand,
} from 'src/api/collector';
import CollectedCashListRow from '../collected-cash-list-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'trainer-name', label: 'Trainer', width: 180 },
  { id: 'amount_to_be_collected', label: 'Amount', width: 180 },
  { id: 'payment_method', label: 'Payment Method', width: 180 },
  { id: 'payment_status', label: 'Payment Status', width: 180 },
  { id: 'time', label: 'Time', width: 180 },

  { id: 'remarks', label: 'Remarks', width: 180 },
];

// ----------------------------------------------------------------------

export default function CollectedCashList() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');

  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const {
    cashCollectedList,
    cashCollectedLoading,
    cashCollectedError,
    cashCollectedValidating,
    totalPages,
    revalidateCashCollectedList,
  } = useGetCashCollectedListPerTransaction(trainerId, table.page + 1, table.rowsPerPage);

  useEffect(() => {
    if (cashCollectedList?.length) {
      setTableData(cashCollectedList);
    } else {
      setTableData([]);
    }
  }, [cashCollectedList]);

  const handleRowClick = (row) => {
    // setRowId(row.id);
    // // setViewMode('detail');
    //No Need on click
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Collected Cash Lists"
        links={[
          { name: 'Collector', href: paths.dashboard.root },
          {
            name: 'Transaction',
            href: paths.dashboard.commission.certificateCommissionDrivys,
          },
          { name: 'History' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {/* <CashInHandFilter /> */}
      <Card>
        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                />
                <TableBody>
                  {cashCollectedLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <CollectedCashListRow
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          reload={revalidateCashCollectedList}
                        />
                      ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalPages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        )}
      </Card>
    </Container>
  );
}
