import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Skeleton, Stack, TableCell, TableRow } from '@mui/material';
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
import { IDialectTableFilters } from 'src/types/dialect';
import { paths } from 'src/routes/paths';

//
import DialectTableRow from '../dialects-table-row';
import { enqueueSnackbar } from 'src/components/snackbar';
import DialectCreateEditForm from '../dialects-create-update';
import DialectDetails from './dialects-details';
import DialectFilters from '../dialects-filters';
import DialectSearch from '../dialects-search';
import { useGetAllLanguage } from 'src/api/language';
import { deleteDialect, useGetAllDialect } from 'src/api/dialect';

const TABLE_HEAD = [
  { id: 'dialect_name', label: 'Dialect Name' },
  { id: 'language_name', label: 'Language Name' },
  { id: 'description', label: 'Description' },
  { id: 'keywords', label: 'Keywords' },
  { id: 'order_id', label: 'Order' },
  { id: 'is_published', label: 'Published' },
  { id: 'action2', label: '' },
];

const defaultFilters: IDialectTableFilters = {
  name: '',
  locale: '',
};

export default function DialectListView() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const createDialect = useBoolean();
  const openFilters = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);
  const [tableData, setTableData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDialect, setSelectedDialect] = useState(null); // State to hold selected dialect
  const [viewMode, setViewMode] = useState('table'); // State to manage view mode
  const [originalTableData, setOriginalTableData] = useState<any>([]);
  const [languageName, setLanguageName] = useState('');
  const [dialectName, setDialectName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isPublished, setIsPublished] = useState('');
  const { dialect, revalidateCategory, totalpages, dialectLoading } = useGetAllDialect({
    page: table.page + 1,
    limit: table.rowsPerPage,
    search: searchQuery,
    language_name: languageName,
    dialect_name: dialectName,
    keywords: keyword,
    is_published: isPublished,
  });
  const dialectFilterStates = {
    languageName,
    setLanguageName,
    dialectName,
    setDialectName,
    keyword,
    setKeyword,
    isPublished,
    setIsPublished,
  };

  useEffect(() => {
    if (dialect?.length) {
      setOriginalTableData(dialect);
      setTableData(dialect);
    } else {
      setTableData([]);
      setOriginalTableData([]);
    }
  }, [dialect]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setLanguageName('');
    setDialectName('');
    setKeyword('');
    setIsPublished('');
    setFilters(defaultFilters);
    setTableData(originalTableData);
  }, [originalTableData]);

  // Handle filter changes
  const handleFiltersChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Function to delete a dialect row by dialect ID
  const handleDeleteRow = async (dialectId: string) => {
    const response = await deleteDialect(dialectId);
    if (response) {
      enqueueSnackbar(response?.message ?? 'Success');
      revalidateCategory();
      setViewMode('table');
    } else {
      console.error('Error deleting dialect:', response.statusText);
    }
  };
  const handleRowClick = (row) => {
    // setSelectedDialect(row);
    // setViewMode('detail');
    //No Needed row click nothing to show more than listing page
  };

  const handleEditClick = () => {
    setViewMode('Edit');
  };

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <DialectSearch
        query={searchQuery}
        onSearch={handleFiltersChange}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <DialectFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          filters={filters}
          onFilters={handleFiltersChange}
          canReset={!isEqual(defaultFilters, filters)}
          onResetFilters={handleResetFilters}
          dialectFilterStates={dialectFilterStates}
        />
      </Stack>
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Dialect',
            href: paths.dashboard.system.dialect,
            onClick: (event) => {
              setViewMode('table');
            },
          },
          { name: 'List' },
        ]}
        action={
          viewMode === 'table' && (
            <Button
              onClick={() => {
                createDialect.onTrue();
              }}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Dialect
            </Button>
          )
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {viewMode === 'table' && renderFilters}
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
                  {dialectLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={5}>
                            <Skeleton variant="text" />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData.length > 0 &&
                      tableData.map((row, index) => (
                        <DialectTableRow
                          key={index}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          reload={revalidateCategory}
                        />
                      ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {viewMode === 'detail' && selectedDialect && (
          <DialectDetails
            dialect={selectedDialect}
            setSelectedDialect={setSelectedDialect}
            onEdit={handleEditClick}
            reload={revalidateCategory}
          />
        )}

        {viewMode === 'table' && (
          <TablePaginationCustom
            count={totalpages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        )}
      </Card>

      <DialectCreateEditForm
        reload={revalidateCategory}
        open={createDialect.value}
        onClose={createDialect.onFalse}
        onSuccess={() => {
          createDialect.onFalse();
          revalidateCategory();
        }}
      />
    </Container>
  );
}
