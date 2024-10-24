import isEqual from 'lodash/isEqual';

import { useState, useEffect, useCallback } from 'react';
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
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

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
  getComparator,
} from 'src/components/table';
// types

import StateTableRow from '../state-table-row';
import { enqueueSnackbar } from 'src/components/snackbar';
// import StateCreateEditForm from '../state-create-update';
import { deleteStateById, useGetStateList } from 'src/api/state';
import StateDetails from './state-details';
import StateNewEditForm from '../state-new-edit-form';
import StateCreateEditForm from '../state-create-update';
import StateFilters from '../state-filters';
import StateSearch from '../state-search';
import { IStateTableFilters } from 'src/types/state';
import { useGetAllLanguage } from 'src/api/language';
// import StateNewEditForm from '../state-new-edit-form';
// import StateDetails from './state-details';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'locale', label: 'Locale', width: 180 },
  { id: 'state_id', label: 'State ID', width: 220 },
  { id: 'is_published', label: 'Published', width: 180 },
  { id: 'action1', label: 'Display Order ID', width: 180 },
  { id: 'action2', label: '', width: 88 },
];

const defaultFilters: IStateTableFilters = {
  name: '',
  locale: '',
};
// ----------------------------------------------------------------------

export default function StateListView() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const createState = useBoolean();
  const openFilters = useBoolean();

  const [tableData, setTableData] = useState<any>([]);
  const [selectedState, setSelectedState] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [rowId, setRowId] = useState(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [stateProvinceID, setProvinceID] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [localeFilter, setLocaleFilter] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedOrder, setSelectedOrder] = useState(undefined);

  const [index, setIndex] = useState(null);

  // Use the state hook instead of the city one
  const { states, revalidateStates, totalpages, stateLoading } = useGetStateList({
    limit: table.rowsPerPage,
    page: table.page,
    order: selectedOrder,
    searchTerm: searchQuery,
    locale: localeFilter,
    is_published: filters.is_published,
  });

  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (states?.length) {
      setTableData(states);
    } else {
      setTableData([]);
    }
  }, [states]);

  // Function to delete a state row by state ID
  const handleDeleteRow = async (stateId: string) => {
    const response = await deleteStateById(stateId);
    if (response) {
      enqueueSnackbar(response?.message ?? 'Success');
      revalidateStates();
      setViewMode('table');
    } else {
      console.error('Error deleting state:', response.statusText);
    }
  };

  const handleRowClick = (row) => {
    setRowId(row.id);
    setSelectedState(row);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('table');
    setSelectedState(null);
  };

  const handleEditClick = () => {
    setOpenEditPopup(true);
  };

  const handleClosePopup = () => {
    setOpenEditPopup(false);
  };
  const handleFilters = useCallback(
    (name: string, value: IStateTableFilters) => {
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
      setFilters(defaultFilters);
    } else {
      setSelectedOrder(value);
    }
  };
  const handleLocaleFilterChange = (locale: string) => {
    setLocaleFilter(locale);
  };
  const canReset = !isEqual(defaultFilters, filters);

  const handleFiltersChange = (name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleResetFilters = useCallback(() => {
    setSelectedOrder(undefined);

    setLocaleFilter('');
    setFilters(defaultFilters);
  }, []);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <StateSearch query={searchQuery} onSearch={handleFilters} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <StateFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          handleOrderChange={handleOrderChange}
          selectedOrder={selectedOrder}
          filters={filters}
          onFilters={handleFiltersChange}
          canReset={canReset}
          onResetFilters={handleResetFilters}
          localeOptions={localeOptions}
          onLocaleChange={handleLocaleFilterChange}
        />
      </Stack>
    </Stack>
  );
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'State',
              href: paths.dashboard.system.state,
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
                  createState.onTrue();
                }}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New State
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {renderFilters}
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
                    {stateLoading
                      ? Array.from(new Array(5)).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={TABLE_HEAD?.length || 6}>
                              <Skeleton animation="wave" height={40} />
                            </TableCell>
                          </TableRow>
                        ))
                      : tableData?.map((row) => (
                          <StateTableRow
                            row={row}
                            setProvinceID={setProvinceID}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            reload={revalidateStates}
                          />
                        ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          {viewMode === 'detail' && selectedState && (
            <StateDetails
              state={selectedState}
              onEdit={handleEditClick}
              onBack={handleBackToList}
              reload={revalidateStates}
              stateId={rowId}
              index={index}
            />
          )}

          <Dialog open={openEditPopup} onClose={handleClosePopup}>
            <DialogTitle>Edit State</DialogTitle>
            <DialogContent>
              {selectedState && (
                <StateNewEditForm
                  state={selectedState}
                  reload={revalidateStates}
                  setViewMode={setViewMode}
                  setSelectedState={setSelectedState}
                  handleClosePopup={handleClosePopup}
                  stateProvinceID={stateProvinceID}
                />
              )}
            </DialogContent>
          </Dialog>

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

      <StateCreateEditForm
        title="Create State"
        open={createState.value}
        onClose={createState.onFalse}
        reload={revalidateStates}
      />
    </>
  );
}
