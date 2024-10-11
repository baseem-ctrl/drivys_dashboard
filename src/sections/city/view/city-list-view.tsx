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
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
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
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types
import { IUserTableFilters } from 'src/types/user';
//
import CityTableRow from '../city-table-row';
import { enqueueSnackbar } from 'src/components/snackbar';
import CityCreateEditForm from '../city-create-update';
import { deleteCity, useGetAllCities } from 'src/api/city';
import CityNewEditForm from '../city-new-edit-form';
import CityDetails from './city-details';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'locale', label: 'Locale', width: 180 },
  { id: 'city_id', label: 'City ID', width: 220 },
  { id: 'is_published', label: 'Published', width: 180 },
  { id: 'action1', label: '', width: 180 },
  { id: 'action2', label: '', width: 88 },
];

const defaultFilters: IUserTableFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function CityListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const createCity = useBoolean();

  const [filters, setFilters] = useState('');
  const [tableData, setTableData] = useState<any>([]);
  const [selectedCity, setSelectedCity] = useState(null); // State to hold selected city
  const [viewMode, setViewMode] = useState('table'); // State to manage view mode
  const [rowId, setRowId] = useState(null);
  const { cities, revalidateCities } = useGetAllCities({ limit: 1000 }); // Fetch all cities

  const [transformedCities, setTransformedCities] = useState([]);
  console.log('citiescities', cities);
  useEffect(() => {
    if (cities && Array.isArray(cities)) {
      const newTransformedCities = cities.reduce((acc, city) => {
        city.city_translations.forEach((translation) => {
          acc.push({
            id: city.id,
            is_published: city.is_published,
            city_translations: [translation],
            deleted_by: city.deleted_by,
            deleted_by_user: city.deleted_by_user,
          });
        });
        return acc;
      }, []);
      setTransformedCities(newTransformedCities);
    }
  }, [cities]);

  useEffect(() => {
    if (transformedCities?.length) {
      setTableData(transformedCities);
    } else {
      setTableData([]);
    }
  }, [transformedCities]);

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

  const paginatedData = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleRowClick = (row) => {
    setRowId(row.id);
    setSelectedCity(row);
    setViewMode('detail');
  };

  const handleEditClick = () => {
    setViewMode('edit'); // Change view to edit
  };

  const handleBackToList = () => {
    setViewMode('table'); // Change view back to table
    setSelectedCity(null); // Reset selected city
  };

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
            <Button
              onClick={() => {
                createCity.onTrue();
              }}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New City
            </Button>
          }
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
                    {paginatedData.map((row) => (
                      <CityTableRow
                        // key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => handleRowClick(row)} // Handle row click
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        reload={revalidateCities}
                      />
                    ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          {viewMode === 'detail' && selectedCity && (
            <CityDetails
              city={selectedCity} // Pass the selected city to the detail component
              onEdit={handleEditClick} // Handle edit button click
              onBack={handleBackToList} // Handle back to list click
              reload={revalidateCities}
              cityId={rowId}
            />
          )}

          {viewMode === 'edit' && selectedCity && (
            <CityNewEditForm
              setSelectedCity={setSelectedCity}
              setViewMode={setViewMode}
              city={selectedCity} // Pass the selected city to the edit component
              onBack={handleBackToList} // Handle back to list click
              reload={revalidateCities}
            />
          )}

          {viewMode === 'table' && (
            <>
              {' '}
              <TablePaginationCustom
                count={dataFiltered.length}
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
  filters: IUserTableFilters;
}) {
  const { name, status } = filters;

  // Stabilize the input data to maintain order after sorting
  const stabilizedThis = inputData.map((el, index) => [el, index] as [any, number]);
  stabilizedThis.sort((a, b) => {
    return comparator(a[0], b[0]);
  });

  // Apply the filters
  return stabilizedThis
    .map((el) => el[0])
    .filter((item) => {
      // Filter by name if provided
      if (name && (!item.name || item.name.toLowerCase().indexOf(name.toLowerCase()) === -1)) {
        return false;
      }

      // Filter by status if provided
      if (status && item.status !== status) {
        return false;
      }

      return true;
    });
}
