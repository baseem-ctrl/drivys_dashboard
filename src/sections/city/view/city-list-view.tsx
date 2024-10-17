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
import {
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';

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
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types
import { ICityTableFilters } from 'src/types/city';
//
import CityTableRow from '../city-table-row';
import { enqueueSnackbar } from 'src/components/snackbar';
import CityCreateEditForm from '../city-create-update';
import { deleteCity, useGetAllCities } from 'src/api/city';
import CityNewEditForm from '../city-new-edit-form';
import CityDetails from './city-details';
import CityFilters from '../city-filters';
import CitySearch from '../city-search';
import { useGetAllLanguage } from 'src/api/language';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'locale', label: 'Locale', width: 180 },
  { id: 'city_id', label: 'City ID', width: 220 },
  { id: 'is_published', label: 'Published', width: 180 },
  { id: 'action1', label: '', width: 180 },
  { id: 'action2', label: '', width: 88 },
];

const defaultFilters: ICityTableFilters = {
  name: '',
  locale: '',
};

// ----------------------------------------------------------------------

export default function CityListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const createCity = useBoolean();
  const openFilters = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);
  const [tableData, setTableData] = useState<any>([]);
  const [selectedCity, setSelectedCity] = useState(null); // State to hold selected city
  const [viewMode, setViewMode] = useState('table'); // State to manage view mode
  const [rowId, setRowId] = useState(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [originalTableData, setOriginalTableData] = useState<any>([]);

  const [index, setIndex] = useState(null);
  const { cities, revalidateCities, totalpages, cityLoading } = useGetAllCities(
    table.page,
    table.rowsPerPage,
    searchQuery,
    localeFilter
  );
  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));
  useEffect(() => {
    if (cities?.length) {
      setOriginalTableData(cities);
      setTableData(cities);
    } else {
      setTableData([]);
      setOriginalTableData([]);
    }
  }, [cities]);

  // Function to delete a city row by city ID
  const handleDeleteRow = async (cityId: string) => {
    const response = await deleteCity(cityId);
    if (response) {
      enqueueSnackbar(response?.message ?? 'Success');
      revalidateCities();
      setViewMode('table');
    } else {
      console.error('Error deleting city:', response.statusText);
    }
  };
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });
  const handleFiltersChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleRowClick = (row) => {
    setRowId(row.id);
    setSelectedCity(row);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('table');
    setSelectedCity(null);
  };
  const handleEditClick = () => {
    setOpenEditPopup(true);
  };

  const handleClosePopup = () => {
    setOpenEditPopup(false);
  };
  console.log('originalTableData', originalTableData);
  const handleResetFilters = useCallback(() => {
    setLocaleFilter('');
    setFilters(defaultFilters);
    setTableData(originalTableData);
  }, [originalTableData]);

  const handleFilters = useCallback(
    (name: string, value: ICityTableFilters) => {
      console.log('name', name);
      console.log('value', value);

      setSearchQuery(value);
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleLocaleFilterChange = (locale: string) => {
    setLocaleFilter(locale);
  };
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <CitySearch query={searchQuery} onSearch={handleFilters} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <CityFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
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
              name: 'City',
              href: paths.dashboard.system.city,
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
                  createCity.onTrue();
                }}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New City
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
                    {cityLoading
                      ? Array.from(new Array(5)).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={TABLE_HEAD?.length || 6}>
                              <Skeleton animation="wave" height={40} />
                            </TableCell>
                          </TableRow>
                        ))
                      : dataFiltered?.map((row) => (
                          <CityTableRow
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            reload={revalidateCities}
                          />
                        ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          {viewMode === 'detail' && selectedCity && (
            <CityDetails
              city={selectedCity}
              onEdit={handleEditClick}
              onBack={handleBackToList}
              reload={revalidateCities}
              cityId={rowId}
              index={index}
            />
          )}

          <Dialog open={openEditPopup} onClose={handleClosePopup}>
            <DialogTitle>Edit City</DialogTitle>
            <DialogContent>
              {selectedCity && (
                <CityNewEditForm
                  city={selectedCity}
                  reload={revalidateCities}
                  setViewMode={setViewMode}
                  setSelectedCity={setSelectedCity}
                  handleClosePopup={handleClosePopup}
                />
              )}
            </DialogContent>
          </Dialog>
          {viewMode === 'table' && (
            <>
              {' '}
              <TablePaginationCustom
                count={totalpages}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
                dense={table.dense}
                onChangeDense={table.onChangeDense}
              />
            </>
          )}
        </Card>
      </Container>

      <CityCreateEditForm
        title="Create City"
        open={createCity.value}
        onClose={createCity.onFalse}
        reload={revalidateCities}
      />
    </>
  );
}

// ----------------------------------------------------------------------

// apply filter function
function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: any[];
  comparator: (a: any, b: any) => number;
  filters: ICityTableFilters;
}) {
  const { name, locale } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as [any, number]);
  stabilizedThis.sort((a, b) => {
    return comparator(a[0], b[0]);
  });

  const filteredData = stabilizedThis
    .map((el) => el[0])
    .filter((item) => {
      // Check for name filter
      if (
        name &&
        (!item.city_translations ||
          !item.city_translations.some((translation) =>
            translation.name.toLowerCase().includes(name.toLowerCase())
          ))
      ) {
        return false;
      }

      // Check for locale filter
      if (locale) {
        const hasMatchingLocale = item.city_translations.some(
          (translation) => translation.locale === locale
        );
        if (!hasMatchingLocale) {
          return false;
        }
      }

      return true;
    });

  return filteredData;
}
