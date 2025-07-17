import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Skeleton, Tab, TableCell, TableRow, Tabs } from '@mui/material';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import {
  useGetAdminCashCollectedListPerTransaction,
  useGetAdminCollectorCashInHand,
} from 'src/api/admin-collector';
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

import CashInHandListRow from '../cash-in-hand-list-admin-table-row';
import CashCollectedRow from '../cash-collected-row';
import CashInHandFilter from '../cash-in-hand-list-admin-filters';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

const defaultFilters = {
  cash_clearance_date_from: null,
  cash_clearance_date_to: null,
  search: '',
  trainerId: null,
  vendorId: null,
};
// ----------------------------------------------------------------------

export default function CashInHandList() {
  const { t } = useTranslation();

  const TABLE_HEAD = [
    { id: 'collector-id', label: t('collector'), width: 180 },
    { id: 'status_text', label: t('status'), width: 180 },
    { id: 'collected-cash-in-hand', label: t('collected_cash'), width: 180 },
    { id: 'max-collected-cash-in-hand', label: t('max_cash_in_hand'), width: 180 },
    { id: 'action', label: '', width: 180 },
  ];

  const COLECTED_TABLE_HEAD = [
    { id: 'collector-id', label: t('collector'), width: 180 },
    { id: 'payment_method', label: t('payment_method'), width: 180 },
    { id: 'txn_amount', label: t('amount'), width: 120 },
    { id: 'payment_status', label: t('payment_status'), width: 150 },
    { id: 'remarks', label: t('remarks'), width: 250 },
    { id: 'collected_on', label: t('collected_on'), width: 180 },
  ];

  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState(defaultFilters);

  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [collectorId, setCollectorId] = useState<string | null>(null);

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [toCollectList, setToCollectList] = useState<any>([]);
  const [collectedList, setCollectedList] = useState<any>([]);

  const { cashInHand, cashLoading, cashError, totalPages, revalidateCollectorCashInHand } =
    useGetAdminCollectorCashInHand(
      trainerId,
      vendorId,
      table.page + 1,
      table.rowsPerPage,
      filters.search,
      filters.cash_clearance_date_from,
      filters.cash_clearance_date_to
    );
  const {
    adminCashCollectedList,
    adminCashCollectedLoading,
    totalPages: total,
  } = useGetAdminCashCollectedListPerTransaction(collectorId, table.page + 1, table.rowsPerPage);
  useEffect(() => {
    if (adminCashCollectedList?.length) {
      setCollectedList(adminCashCollectedList);
    } else {
      setCollectedList([]);
    }
  }, [adminCashCollectedList]);
  useEffect(() => {
    if (cashInHand?.length) {
      setToCollectList(cashInHand);
    } else {
      setToCollectList([]);
    }
  }, [cashInHand]);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentData = activeTab === 0 ? toCollectList : collectedList;
  const totalPagesToUse = activeTab === 0 ? totalPages : total;

  const handleRowClick = (row) => {
    // setRowId(row.id);
    // // setViewMode('detail');
    //No Need on click
  };
  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Cash In Hand Lists"
        links={[
          { name: 'Collector', href: paths.dashboard.root },
          {
            name: 'Cash In Hand',
            href: paths.dashboard.collectorAdminView,
          },
          { name: 'List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <CashInHandFilter filters={filters} onFilters={handleFilters} />
      <Card>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Pending Collections" />
          <Tab label="Completed Collections" />
        </Tabs>

        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset', mt: 3 }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={currentData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  currentData.map((row) => row.id)
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
                  headLabel={activeTab === 0 ? TABLE_HEAD : COLECTED_TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                />
                <TableBody>
                  {cashLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell
                            colSpan={
                              activeTab === 'collected'
                                ? COLECTED_TABLE_HEAD.length
                                : TABLE_HEAD.length
                            }
                          >
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : currentData?.map((row) =>
                        activeTab === 0 ? (
                          <CashInHandListRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            reload={revalidateCollectorCashInHand}
                          />
                        ) : (
                          <CashCollectedRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            reload={revalidateCollectorCashInHand}
                          />
                        )
                      )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalPagesToUse}
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
