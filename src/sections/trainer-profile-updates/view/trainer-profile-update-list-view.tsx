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
// import BookingTableToolbar from '../booking-table-toolbar';
import { paths } from 'src/routes/paths';
import TrainerProfileUpdateRow from '../trainer-profile-update-table-row';

const TABLE_HEAD = [
  { id: 'userName', label: 'Trainer', width: 180 },
  { id: 'Updations Made', label: 'Updation Made', width: 380 },
  { id: 'isVerified', label: 'Verified', width: 150 },
  { id: 'Action', label: '', width: 150 },
];

export default function TrainerProfileUpdatesListView() {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const [filters, setFilters] = useState({
    trainer_id: undefined,
    page: table.page + 1,
    limit: table.rowsPerPage,
    is_verified: undefined,
  });

  const {
    profileUpdates,
    totalCount,
    profileUpdateError,
    profileUpdateLoading,
    revalidateProfileUpdates,
  } = useGetTrainerProfileUpdateList(filters);

  const [tableData, setTableData] = useState([]);

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

  return (
    <Card sx={{ mb: 5 }}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Trainer Profile Updates',
            href: paths.dashboard.todo.trainerProfileUpdates,
          },
          { name: 'List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
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
                      No data available
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
