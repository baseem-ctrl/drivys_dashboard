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
  getComparator,
} from 'src/components/table';
// types

// import ReviewFilters from '../review-filters';

import CashInHandListRow from '../cash-in-hand-list-admin-table-row';
import CashCollectedRow from '../cash-collected-row';
import CashInHandFilter from '../cash-in-hand-list-admin-filters';
import { useGetCashCollectedList } from 'src/api/booking-assistant';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function CashInHandAssistantList() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [viewMode, setViewMode] = useState('table');
  const { t } = useTranslation();

  const TABLE_HEAD = [
    { id: 'name', label: t('assistant'), width: 180 },
    { id: 'collected_cash_in_hand', label: t('collected_cash'), width: 180 },
    { id: 'collected_cash_clearance_date', label: t('cash_clearance_date'), width: 180 },
    { id: 'action', label: '', width: 180 },
  ];

  const [tableData, setTableData] = useState<any>([]);
  const defaultFilters = {
    cash_clearance_date_from: undefined,
    cash_clearance_date_to: undefined,
    search: '',
    assistant_id: undefined,
    page: table.page,
    limit: table.rowsPerPage,
  };
  const [filters, setFilters] = useState(defaultFilters);
  const {
    cashCollected,
    cashCollectedLoading,
    cashCollectedError,
    totalCashPages,
    revalidateCashCollected,
  } = useGetCashCollectedList({
    ...filters,
    page: table.page,
    limit: table.rowsPerPage,
  });

  useEffect(() => {
    if (cashCollected.length) {
      setTableData(cashCollected);
    } else {
      setTableData([]);
    }
  }, [cashCollected]);

  // const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
  //   setActiveTab(newValue);
  // };

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
        heading={t('cash_in_hand_lists')}
        links={[
          { name: t('collector'), href: paths.dashboard.root },
          {
            name: t('cash_in_hand'),
            href: paths.dashboard.collectorAdminView.cashInHand,
          },
          { name: t('list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <CashInHandFilter filters={filters} onFilters={handleFilters} />
      <Card>
        {/* <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Pending Collections" />
          <Tab label="Completed Collections" />
        </Tabs> */}

        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset', mt: 3 }}>
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
                  rowCount={tableData?.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(checked, tableData?.map((row) => row.id))
                  // }
                />
                <TableBody>
                  {cashCollectedLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD.length}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : [...(tableData || [])]
                        .sort(getComparator(table.order, table.orderBy))
                        .map((row) => (
                          <CashInHandListRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            reload={revalidateCashCollected}
                          />
                        ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalCashPages}
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
