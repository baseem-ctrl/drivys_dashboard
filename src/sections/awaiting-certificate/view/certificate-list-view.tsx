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
import { useGetAllCertificateRequests } from 'src/api/certificate';
import { useLocation } from 'react-router-dom';

// types

import { useGetAllLanguage } from 'src/api/language';
import CertificateFilters from '../certificate-filters';
import CertificateRow from '../certificate-table-row';
import CertificateSearch from '../certificate-search';
import { ICityTableFilters } from 'src/types/city';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'city', label: t('City'), width: 180 },
  { id: 'gear', label: t('Gear'), width: 180 },
  { id: 'request_date', label: t('Request Date'), width: 180 },
  { id: 'certificate_url', label: t('Certificate URL'), width: 180 },
  { id: 'status', label: t('Status'), width: 180 },
  { id: 'trainer', label: t('Trainer'), width: 180 },
  { id: 'txn', label: t('Transaction ID'), width: 180 },
  { id: 'user', label: t('User'), width: 180 },
  { id: 'vehicle_type', label: t('Vehicle Type'), width: 180 },
  { id: 'comments', label: t('Comments'), width: 180 },
  { id: 'actions', label: '', width: 180 },
];

// ----------------------------------------------------------------------

export default function CertificateListView() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const { t } = useTranslation()
  const settings = useSettingsContext();
  const location = useLocation();
  const path = location.pathname.split('/').pop();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');
  const [filters, setFilters] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { certificateRequests, certificateLoading, totalpages, revalidateCertificateRequests } =
    useGetAllCertificateRequests(
      table.page,
      table.rowsPerPage,
      searchQuery,
      path === 'approved-certificate' ? 'APPROVED' : 'PENDING'
    );

  const { language } = useGetAllLanguage(0, 1000);
  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (certificateRequests?.length) {
      setTableData(certificateRequests);
    } else {
      setTableData([]);
    }
  }, [certificateRequests]);

  const handleRowClick = (row) => {
    // setRowId(row.id);
    // // setViewMode('detail');
    //No Need on click
  };

  const handleFilters = useCallback(
    (name: string, value: ICityTableFilters) => {
      setSearchQuery(value);
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
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

  const handleFiltersChange = (name, value) => {
    // setFilters((prevFilters) => ({
    //   ...prevFilters,
    //   [name]: value,
    // }));
  };

  const handleResetFilters = useCallback(() => {
    setSelectedOrder(undefined);

    setLocaleFilter('');
    // setFilters(defaultFilters);
  }, []);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <CertificateFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          handleOrderChange={handleOrderChange}
          selectedOrder={selectedOrder}
          filters={filters}
          onFilters={handleFiltersChange}
          // canReset={canReset}
          onResetFilters={handleResetFilters}
          localeOptions={localeOptions}
          onLocaleChange={handleLocaleFilterChange}
        />
      </Stack>
    </Stack>
  );
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t("List")}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: path === 'awaiting-certificate' ? t('Awaiting Certificate') : t('Approved Certificate'),
            href: paths.dashboard.school.certificate,
            onClick: (event) => {
              setViewMode('table');
            },
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <CertificateSearch query={searchQuery} onSearch={handleFilters} />

      {/* {renderFilters} */}
      <Card
        sx={{
          mt: 2,
        }}
      >
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
                  {tableData.length > 0 ? (
                    <>
                      {tableData.map((row) => (
                        <CertificateRow
                          key={row.id}
                          row={row}
                          path={path}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          reload={revalidateCertificateRequests}
                        />
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={TABLE_HEAD.length}
                        sx={{ textAlign: 'center', fontStyle: 'italic', color: 'gray' }}
                      >
                        {t("Nothing to show")}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Skeleton loading state */}
                  {certificateLoading &&
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={TABLE_HEAD?.length || 6}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))}
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
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        )}
      </Card>
    </Container>
  );
}
