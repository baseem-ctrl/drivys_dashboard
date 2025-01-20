import orderBy from 'lodash/orderBy';
import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fTimestamp } from 'src/utils/format-time';
// _mock
import { _tours, _tourGuides, TOUR_SERVICE_OPTIONS, TOUR_SORT_OPTIONS } from 'src/_mock';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// types
import { ITourItem, ITourFilters, ITourFilterValue } from 'src/types/tour';
//
import PayoutSort from '../payout-sort';
import PayoutSearch from '../payout-search';
// import TourFilters from '../tour-filters';
import PayoutFiltersResult from '../payout-filters-result';
import { useGetTrainerPayouts } from 'src/api/payouts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
import { TablePaginationCustom, useTable } from 'src/components/table';
import { useGetUsers } from 'src/api/users';

// ----------------------------------------------------------------------

const defaultFilters: any = {
  destination: [],
  tourGuides: [],
  services: [],
  startDate: null,
  endDate: null,
  trainer_id: '',
};

// ----------------------------------------------------------------------
const PAYOUT_SORT_OPTIONS = [
  { value: 'id', label: 'Latest' },
  { value: 'paid_bookings', label: 'Bookings' },
  { value: 'paid_cash_bookings', label: 'Cash Bookings' },
];
export default function TrainerPayoutPage() {
  const settings = useSettingsContext();
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const openFilters = useBoolean();

  const [sortBy, setSortBy] = useState('');

  const [search, setSearch] = useState<{ query: string; results: ITourItem[] }>({
    query: '',
    results: [],
  });
  const [searchValue, setSearchValue] = useState('');

  const [filters, setFilters] = useState(defaultFilters);
  const { payoutsList, payoutsLoading, payoutsError, payoutsEmpty, totalPages } =
    useGetTrainerPayouts({
      page: table?.page + 1,
      limit: table?.rowsPerPage,
      trainer_id: filters?.trainer_id,
      sort_dir: table.order,
      sorting_by: sortBy,
    });
  const { users, usersLoading, revalidateUsers } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
    search: searchValue,
  });
  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: _tours,
    filters,
    sortBy,
    dateError,
  });

  const canReset =
    !!filters.destination.length ||
    !!filters.tourGuides.length ||
    !!filters.services.length ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = !dataFiltered.length && canReset;

  const handleFilters = useCallback((name: string, value: ITourFilterValue) => {
    setFilters((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback(
    (inputValue: string) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = _tours.filter(
          (tour) => tour.name.toLowerCase().indexOf(search.query.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [search.query]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSortBy('');
  }, []);

  const renderFilters = (
    <Stack
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'flex', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <PayoutSearch
        filters={filters}
        onFilters={handleFilters}
        options={users}
        setSearchValue={setSearchValue}
        usersLoading={usersLoading}
      />
      <Stack direction="row" spacing={1} flexShrink={0}>
        <PayoutSort sort={sortBy} onSort={handleSortBy} sortOptions={PAYOUT_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  const renderResults = (
    <PayoutFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
  );
  const renderLargeScreenContent = (item: any) => {
    const fields = [
      { label: 'Trainer Name', value: item?.trainer_name ?? 'NA' },
      { label: 'Total Bookings', value: item?.paid_bookings ?? 0 },
      {
        label: 'Total Eranings ',
        value: `${item?.total_amount_earned_from_booking} AED` ?? '0 AED',
      },
      { label: 'Earnings In Cash ', value: `${item?.total_cash_amount_received} AED` ?? 'NA' },
      { label: 'Admin Payable Amount', value: `${item?.amount_required_from_admin} AED` ?? 'NA' },
      { label: 'Action', value: <Button variant="outlined">Payouts</Button> },
    ];

    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(6, 1fr)"
        gap={2}
        sx={{ alignItems: 'center' }}
      >
        {/* Render Labels */}
        {fields.map((field, index) => (
          <Typography
            key={`label-${index}`}
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              textAlign: index === 0 ? 'left' : 'center', // Align the first label to the left
              color: 'text.secondary',
            }}
          >
            {field.label}
          </Typography>
        ))}

        {/* Render Values */}
        {fields.map((field, index) => (
          <Typography
            key={`value-${index}`}
            variant="body2"
            sx={{
              textAlign: index === 0 ? 'left' : 'center', // Align the first value to the left
            }}
          >
            {field.value}
          </Typography>
        ))}
      </Box>
    );
  };

  const renderSmallScreenContent = (item: any) => {
    const fields = [
      { label: 'Name', value: item?.trainer_name ?? 'NA' },
      { label: 'Total Bookings', value: item?.paid_bookings ?? 0 },
      {
        label: 'Total Eranings ',
        value: `${item?.total_amount_earned_from_booking} AED` ?? '0 AED',
      },
      { label: 'Earnings In Cash ', value: `${item?.total_cash_amount_received} AED` ?? 'NA' },

      { label: 'Admin Payable Amount', value: `${item?.amount_required_from_admin} AED` ?? 'NA' },
      { label: 'Action', value: <Button variant="outlined">Payouts</Button> },
    ];

    return (
      <Box display="flex" flexDirection="column" gap={1}>
        {fields.map((field, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid #ddd', pb: 1 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {field.label}
            </Typography>
            <Typography variant="body2">{field.value}</Typography>
          </Box>
        ))}
      </Box>
    );
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Trainer Payout"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Payout',
            href: paths.dashboard.tour.root,
          },
          { name: 'Trainer Payouts' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Stack
        spacing={2.5}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}

        {canReset && renderResults}
      </Stack>

      {notFound && <EmptyContent title="No Data" filled sx={{ py: 10 }} />}

      {/* <TrainerPayoutList tours={dataFiltered} /> */}
      <Box display="flex" flexDirection="column" gap={3}>
        {payoutsList.map((tour: any) => (
          <Card
            key={tour.id}
            sx={{
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 2,
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
            }}
            // onClick={() => handleView(tour.id)}
          >
            {/* Large Screen Content */}
            <CardContent
              sx={{
                display: { xs: 'none', md: 'block' }, // Only display for larger screens
              }}
            >
              {renderLargeScreenContent(tour)}
            </CardContent>

            {/* Small Screen Content */}
            <CardContent
              sx={{
                display: { xs: 'block', md: 'none' }, // Only display for small screens
              }}
            >
              {renderSmallScreenContent(tour)}
            </CardContent>
          </Card>
        ))}
      </Box>

      <TablePaginationCustom
        count={totalPages}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({
  inputData,
  filters,
  sortBy,
  dateError,
}: {
  inputData: ITourItem[];
  filters: ITourFilters;
  sortBy: string;
  dateError: boolean;
}) => {
  const { services, destination, startDate, endDate, tourGuides } = filters;

  const tourGuideIds = tourGuides.map((tourGuide) => tourGuide.id);

  // SORT BY
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['createdAt'], ['asc']);
  }

  if (sortBy === 'popular') {
    inputData = orderBy(inputData, ['totalViews'], ['desc']);
  }

  // FILTERS
  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (tour) =>
          fTimestamp(tour.available.startDate) >= fTimestamp(startDate) &&
          fTimestamp(tour.available.endDate) <= fTimestamp(endDate)
      );
    }
  }

  if (destination.length) {
    inputData = inputData.filter((tour) => destination.includes(tour.destination));
  }

  if (tourGuideIds.length) {
    inputData = inputData.filter((tour) =>
      tour.tourGuides.some((filterItem) => tourGuideIds.includes(filterItem.id))
    );
  }

  if (services.length) {
    inputData = inputData.filter((tour) => tour.services.some((item) => services.includes(item)));
  }

  return inputData;
};
