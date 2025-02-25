import { useState, useEffect } from 'react';

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
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useGetTrainerProfileUpdateList } from 'src/api/trainerProfileUpdates';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import { useLocales } from 'src/locales';

// import BookingTableToolbar from '../booking-table-toolbar';
import { paths } from 'src/routes/paths';
import TrainerProfileUpdateRow from '../trainer-profile-update-table-row';
import ProfileUpdateFilter from '../profile-update-filter';

export default function TrainerProfileUpdatesListView() {
  const openFilters = useBoolean();
  const { t } = useLocales();

  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const [filters, setFilters] = useState({
    trainer_id: '',
    page: table.page + 1,
    limit: table.rowsPerPage,
    is_verified: 0,
  });

  const {
    profileUpdates,
    totalCount,
    profileUpdateError,
    profileUpdateLoading,
    revalidateProfileUpdates,
  } = useGetTrainerProfileUpdateList(filters);
  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: table.page + 1,
      limit: table.rowsPerPage,
    }));
  }, [table.page, table.rowsPerPage]);
  const [tableData, setTableData] = useState([]);
  const TABLE_HEAD = [
    { id: 'userName', label: t('trainer'), width: 180 },
    { id: 'Updations Made', label: t('updation_made'), width: 380 },
    { id: 'isVerified', label: t('verified'), width: 150 },
    { id: 'Action', label: '', width: 150 },
  ];

  const confirm = useBoolean();

  useEffect(() => {
    if (profileUpdates?.length > 0) {
      setTableData(profileUpdates);
    } else {
      setTableData([]);
    }
  }, [profileUpdates]);

  const handleRowClick = (row: any) => {
    // router.push(paths.dashboard.booking.refundDetails(row?.id));
  };
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <ProfileUpdateFilter
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          filters={filters}
          setFilters={setFilters}
          onFilters={handleFiltersChange}
        />
      </Stack>
    </Stack>
  );
  return (
    <Card sx={{ mb: 5 }}>
      <CustomBreadcrumbs
        heading={t('list')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('trainer_profile_updates'), href: paths.dashboard.todo.trainerProfileUpdates },
          { name: t('list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

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
              {profileUpdateLoading &&
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={TABLE_HEAD.length}>
                      <Skeleton animation="wave" height={40} />
                    </TableCell>
                  </TableRow>
                ))}

              {!profileUpdateLoading &&
                tableData.length > 0 &&
                tableData.map((row) => (
                  <TrainerProfileUpdateRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => handleRowClick(row)}
                    reload={revalidateProfileUpdates}
                    // onDeleteRow={() => handleDeleteRow(row.id)}
                    // onEditRow={() => handleEditRow(row.id)}
                  />
                ))}

              {!profileUpdateLoading && tableData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD?.length} align="center">
                    <Typography variant="h6" color="textSecondary">
                      {t('no_data_available')}{' '}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      <TablePaginationCustom
        count={totalCount}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
}
