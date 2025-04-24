import isEqual from 'lodash/isEqual';
import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import AddIcon from '@mui/icons-material/Add';

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
//
import { IDeliveryItem } from 'src/types/product';

import { Skeleton, TableCell, TableRow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetSupportList } from 'src/api/support';
import SupportTableRow from '../support-table-row';

// ----------------------------------------------------------------------

const defaultFilters: any = {
  name: '',
  is_active: '',
  display_order: 0,
  catalogue_type: '',
  locale: '',
};

// ----------------------------------------------------------------------

export default function SupportlistingListView() {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const { t } = useTranslation();

  const TABLE_HEAD = [
    { id: 'user', label: t('User') },
    { id: 'status', label: t('status') },
    { id: 'priority', label: t('priority') },
    { id: 'message', label: t('message') },
    { id: 'subject', label: t('subject') },
  ];

  const [tableData, setTableData] = useState<IDeliveryItem[]>();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // State to manage view mode
  const [filters, setFilters] = useState(defaultFilters);
  const { supports, supportLoading, supportError, totalpages, revalidateSupport } =
    useGetSupportList({
      user_id: filters.user_id,
      limit: table?.rowsPerPage,
      page: table?.page,
    });

  useEffect(() => {
    if (supports?.length) {
      setTableData(supports);
    } else {
      setTableData([]);
    }
  }, [supports]);

  // const handleDeleteRow = async (id: string) => {
  //   try {
  //     const response = await deleteHomeListing(id);
  //     // revalidateHomeListing();
  //     enqueueSnackbar(response?.message);
  //   } catch (error) {
  //     enqueueSnackbar(error?.message, { variant: 'error' });
  //   }
  // };

  // const handleEditRow = useCallback(
  //   (e: any, id: string) => {
  //     e.stopPropogation();
  //     router.push(paths.dashboard.notification.edit);
  //   },
  //   [router]
  // );

  // const renderResults = (
  //   <JobFiltersResult
  //     filters={filters}
  //     onResetFilters={handleResetFilters}
  //     //
  //     canReset={canReset}
  //     onFilters={handleFilters}
  //     //
  //     results={dataFiltered.length}
  //   />
  // );
  // const handleViewRow = useCallback(
  //   (id: string) => {
  //     router.push(paths.dashboard.homelisting.details(id));
  //   },
  //   [router]
  // );

  const handleRowClick = (row) => {
    setSelectedNotification(row);
    setViewMode('detail');
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('support')}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: t('Support List'),
            href: paths.dashboard.notification.root,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: t('List') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card
        sx={{
          marginTop: 10,
        }}
      >
        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData?.length}
              // onSelectAllRows={(checked) =>
              //   table.onSelectAllRows(checked, tableData?.map((row) => row?.id))
              // }
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
                  headLabel={TABLE_HEAD}
                  rowCount={tableData?.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(checked, tableData?.map((row) => row.id))
                  // }
                />

                <TableBody>
                  {supportLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <SupportTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          // onDeleteRow={() => handleDeleteRow(row.id)}
                          // onEditRow={(e: any) => handleEditRow(e, row.id)}
                          // revalidateHomeListing={revalidateNotifications}
                          // onViewRow={() => handleRowClick(row)}
                        />
                      ))}

                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
                  /> */}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalpages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        )}
      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------
