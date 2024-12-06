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
import { IPickupTableFilters } from 'src/types/city';
//
import PickupTableRow from '../pickup-table-row';
import { enqueueSnackbar } from 'src/components/snackbar';
import PickupCreateEditForm from '../pickup-new-edit-form';
import { deleteCityPickupExclusionById, useGetCityPickupExclusionList } from 'src/api/pickup';
import PickupFilters from '../pickup-filters';
import PickupSearch from '../pickup-search';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'city_id', label: 'City ID' },
  { id: 'start_time', label: 'Start Time', width: 180 },
  { id: 'start_date', label: 'Start Date', width: 180 },
  { id: 'end_date', label: 'End Date', width: 180 },
  { id: 'end_time', label: 'End Time', width: 180 },

  { id: 'status', label: 'Status', width: 180 },
  { id: 'action2', label: '', width: 88 },
];

const defaultFilters: IPickupTableFilters = {
  name: '',
  locale: '',
  status: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
};

// ----------------------------------------------------------------------

export default function PickupListView() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const createCity = useBoolean();
  const openFilters = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);
  const [tableData, setTableData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [originalTableData, setOriginalTableData] = useState<any>([]);

  const {
    exclusions,
    exclusionsLoading,
    exclusionsError,
    exclusionsValidating,
    totalpages,
    revalidateExclusions,
  } = useGetCityPickupExclusionList({
    limit: table.rowsPerPage,
    page: table.page,

    filters,
  });

  useEffect(() => {
    if (exclusions?.length) {
      setOriginalTableData(exclusions);
      setTableData(exclusions);
    } else {
      setTableData([]);
      setOriginalTableData([]);
    }
  }, [exclusions]);

  // Function to delete a city row by city ID
  const handleDeleteRow = async (cityId: string) => {
    try {
      const response = await deleteCityPickupExclusionById(cityId);

      if (response) {
        enqueueSnackbar('Pickup deleted successfully!', { variant: 'success' });
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      revalidateExclusions();
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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setTableData(originalTableData);
  }, [originalTableData]);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="flex-end"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ marginBottom: 3 }}
    >
      <Stack direction="row" spacing={1} flexShrink={0}>
        <PickupFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          filters={filters}
          onFilters={handleFiltersChange}
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />
      </Stack>
    </Stack>
  );
  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          mt: 9,
        }}
      >
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Pickup',
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
                New Pickup
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {viewMode === 'table' && renderFilters}
        <Card>
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
                  {exclusionsLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : dataFiltered?.map((row) => (
                        <PickupTableRow
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          reload={revalidateExclusions}
                        />
                      ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>{' '}
          <TablePaginationCustom
            count={totalpages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <PickupCreateEditForm
        title="Create Emirate"
        open={createCity.value}
        onClose={createCity.onFalse}
        reload={revalidateExclusions}
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
  filters: IPickupTableFilters;
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
