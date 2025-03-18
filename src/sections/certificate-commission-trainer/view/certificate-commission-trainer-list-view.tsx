import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Skeleton, TableCell, TableRow } from '@mui/material';

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

import CertificateCommissionRow from '../certificate-commission-trainer-table-row';
import { useGetAllVendorCommissionList } from 'src/api/commission';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'trainer-name', label: t('Trainer Name'), width: 180 },
  { id: 'vendor-name', label: t('School Name'), width: 180 },
  { id: 'trainer-certificate-commission', label: t('Trainer Certificate Commission'), width: 180 },
  { id: 'action', label: '', width: 180 },
];

// ----------------------------------------------------------------------

export default function CertificateCommissionTrainer() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const { t } = useTranslation();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');

  const { vendorCommissions, commissionsLoading, totalPages, revalidateVendorCommissions } =
    useGetAllVendorCommissionList(table.page, table.rowsPerPage);

  useEffect(() => {
    if (vendorCommissions?.length) {
      setTableData(vendorCommissions);
    } else {
      setTableData([]);
    }
  }, [vendorCommissions]);

  const handleRowClick = (row) => {
    // setRowId(row.id);
    // // setViewMode('detail');
    //No Need on click
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t("Trainer Certificate Commission")}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: t('Commission'),
            href: paths.dashboard.commission.root,
          },
          { name: t('Trainer Certificate Commission') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
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
                <Tooltip title={t("Delete")}>
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
                  {commissionsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={TABLE_HEAD?.length || 6}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))
                    : tableData?.map((row) => (
                      <CertificateCommissionRow
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => handleRowClick(row)}
                        reload={revalidateVendorCommissions}
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
