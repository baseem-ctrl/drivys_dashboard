import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Box, Skeleton, Stack, TableCell, TableRow, Button, Tab, Tabs } from '@mui/material';

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

import { useGetAllLanguage } from 'src/api/language';
import { useAuthContext } from 'src/auth/hooks';
import { useActiveLink } from 'src/routes/hooks/use-active-link';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { useGetPaymentList } from 'src/api/booking-assistant';
import UnattendedStudentFilter from '../unattended-students';
import UnattendedStudentRow from '../unattended-students-row';
import { useGetUnattendedStudents } from 'src/api/unattended-students';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function UnattendedStudentListView() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const [currentTab, setCurrentTab] = useState('unapproved');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };
  const TABLE_HEAD = [
    { id: 'student', label: t('student'), width: 200 },
    { id: 'trainer', label: t('trainer'), width: 200 },
    { id: 'start_time', label: t('start_time'), width: 200 },
    { id: 'end_time', label: t('end_time'), width: 200 },
    { id: 'reason', label: t('reason'), width: 200 },
    { id: 'action', label: '', width: 200 },
  ];
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    category_id?: any;
  }>({});
  const {
    unattendedSessions,
    unattendedLoading,
    unattendedError,
    totalPages,
    revalidateUnattendedSessions,
  } = useGetUnattendedStudents(
    table.page + 1,
    table.rowsPerPage,
    currentTab === 'approved' ? 'approved' : 'pending'
  );

  const { totalPaymentPages, revalidatePaymentList } = useGetPaymentList({
    page: table.page,
    limit: table.rowsPerPage,
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (unattendedSessions?.length) {
      setTableData(unattendedSessions);
    } else {
      setTableData([]);
    }
  }, [unattendedSessions]);

  const handleRowClick = (row) => {
    // setRowId(row.id);
    // // setViewMode('detail');
    //No Need on click
  };

  const handleFilters = useCallback(
    // (name: string) => {
    //   table.onResetPage();
    //   setFilters((prevState) => ({
    //     ...prevState,
    //     [name]: value,
    //   }));
    // },
    [table]
  );

  const handleOrderChange = (event) => {
    const value = event.target.value;

    if (value === '') {
      setSelectedOrder(undefined);
      setLocaleFilter('');
      // setFilters(defaultFilters);
    } else {
      setSelectedOrder(value);
    }
  };
  const handleLocaleFilterChange = (locale: string) => {
    setLocaleFilter(locale);
  };
  // const canReset = !isEqual(defaultFilters, filters);

  const handleResetFilters = useCallback(() => {
    setSelectedOrder(undefined);

    setLocaleFilter('');
    // setFilters(defaultFilters);
  }, []);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <UnattendedStudentFilter
        open={openFilters.value}
        onOpen={openFilters.onTrue}
        onClose={openFilters.onFalse}
        handleOrderChange={handleOrderChange}
        selectedOrder={selectedOrder}
        filters={filters}
        setFilters={setFilters}
        onFilters={handleFiltersChange}
        // canReset={canReset}
        onResetFilters={handleResetFilters}
        localeOptions={localeOptions}
        onLocaleChange={handleLocaleFilterChange}
      />
    </Stack>
  );
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('unattended_student')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('unattended_student'),
            href: paths.dashboard.assistant.student.list,
          },
          { name: t('list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {/* {renderFilters} */}

      <Box sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={t('pending')} value="unapproved" />
          <Tab label={t('approved')} value="approved" />
        </Tabs>
      </Box>

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
                  {unattendedLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData?.map((row) => (
                        <UnattendedStudentRow row={row} reload={revalidateUnattendedSessions} />
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
