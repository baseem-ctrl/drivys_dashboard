import { useState, useCallback, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { useLocales } from 'src/locales';

import {
  Card,
  Table,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
  Skeleton,
  TableCell,
  TableRow,
  Typography,
  Stack,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom, TableSelectedAction, TablePaginationCustom } from 'src/components/table';
// import BookingTableToolbar from '../booking-table-toolbar';
import RefundFilters from '../refund-filter';
import { useGetEligibleRewardTrainerList } from 'src/api/loyality';
import PendingRewardTableRow from '../pending-rewards-table-row';
import TrainerRewardFilters from '../trainer-reward-filter';

const defaultFilters = {
  trainer_id: null,
};

export default function PendingRewardListView({ table, filters, setFilters, searchValue }) {
  const { t } = useLocales();

  const {
    eligibleRewardTrainers,
    eligibleRewardTrainersLoading,
    revalidateEligibleRewardTrainers,
    totalPages,
  } = useGetEligibleRewardTrainerList({
    page: table.page,
    limit: table.rowsPerPage,
    // search: searchValue,
    status: 'pending',
    // ...(filters?.category_id && { category_id: filters.category_id }),
    // ...(filters?.city_id && { city_id: filters.city_id }),
    ...(filters?.trainer_id && { trainer_id: filters.trainer_id }),
  });
  const TABLE_HEAD = [
    { id: 'trainer-name', label: t('trainer'), width: 180 },
    { id: 'reward-amount', label: t('reward_amount'), width: 180 },
    { id: 'is-periodic', label: t('periodic'), width: 220 },
    { id: 'start-date', label: t('start_date'), width: 220 },
    { id: 'end-date', label: t('end_date'), width: 220 },
    { id: 'notes', label: t('notes'), width: 180 },
    { id: 'achieved-date', label: t('achieved_date'), width: 200 },
    { id: 'notes', label: '', width: 250 },
  ];

  const openFilters = useBoolean();

  const [tableData, setTableData] = useState([]);

  const confirm = useBoolean();

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  useEffect(() => {
    if (eligibleRewardTrainers?.length > 0) {
      setTableData(eligibleRewardTrainers);
    } else {
      setTableData([]);
    }
  }, [eligibleRewardTrainers]);
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

  const handleRowClick = (row: any) => {
    // router.push(paths.dashboard.booking.refundDetails(row?.id));
  };
  const canReset = !isEqual(defaultFilters, filters);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="flex-end"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      margin={3}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <TrainerRewardFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {/* <JobSort sort={sortBy} onSort={handleSortBy} sortOptions={JOB_SORT_OPTIONS} /> */}
      </Stack>
    </Stack>
  );
  return (
    <Card sx={{ mb: 5 }}>
      {renderFilters}
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
            <Tooltip title={t('delete')}>
              <IconButton onClick={confirm.onTrue}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
        />

        <Scrollbar>
          <Table>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
            />
            <TableBody>
              {eligibleRewardTrainersLoading &&
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={TABLE_HEAD.length}>
                      <Skeleton animation="wave" height={40} />
                    </TableCell>
                  </TableRow>
                ))}

              {!eligibleRewardTrainersLoading &&
                tableData.length > 0 &&
                tableData.map((row) => (
                  <PendingRewardTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => handleRowClick(row)}
                    reload={revalidateEligibleRewardTrainers}
                    // onDeleteRow={() => handleDeleteRow(row.id)}
                    // onEditRow={() => handleEditRow(row.id)}
                  />
                ))}

              {!eligibleRewardTrainersLoading && tableData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD?.length} align="center">
                    <Typography variant="h6" color="textSecondary">
                      {t('no_data_available')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      <TablePaginationCustom
        count={totalPages}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
}
