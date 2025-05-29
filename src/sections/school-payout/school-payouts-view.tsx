import orderBy from 'lodash/orderBy';
import { useState, useCallback } from 'react';
import moment from 'moment';

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
import { _tours, _tourGuides, TOUR_SORT_OPTIONS } from 'src/_mock';
// assets
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// types
import { ITourItem, ITourFilters, ITourFilterValue } from 'src/types/tour';
//
import PayoutSort from './payout-sort';
import PayoutSearch from './payout-search';
// import TourFilters from '../tour-filters';
import PayoutFiltersResult from './payout-filters-result';
import { useGetPayoutBySchool, useGetSchoolPayouts, useGetTrainerPayouts } from 'src/api/payouts';
import { Box, Card, CardContent, Chip, Tooltip, Typography } from '@mui/material';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
import { TablePaginationCustom, useTable } from 'src/components/table';
import { useGetSchool } from 'src/api/school';
import { useRouter } from 'src/routes/hooks';
import { useGetUsers } from 'src/api/users';
import { useTranslation } from 'react-i18next';

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
  { value: 'total_paid_and_completed_booking', label: 'Bookings' },
];
export default function SchoolAdminPayoutPage() {
  const { t } = useTranslation();
  const settings = useSettingsContext();
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const router = useRouter();
  const openFilters = useBoolean();
  const quickCreate = useBoolean();
  const [vendorId, setVendorId] = useState(false);
  const [amount, setAmount] = useState(false);

  const [sortBy, setSortBy] = useState('');

  const [search, setSearch] = useState<{ query: string; results: ITourItem[] }>({
    query: '',
    results: [],
  });
  const [searchValue, setSearchValue] = useState('');

  const [filters, setFilters] = useState(defaultFilters);
  const {
    payoutBySchoolList,
    payoutBySchoolLoading,
    payoutBySchoolError,
    totalPages,
    revalidatePayoutBySchool,
  } = useGetPayoutBySchool({
    trainer_id: filters?.trainer_id,
    limit: table?.rowsPerPage,
    page: table?.page + 1,
    sort_dir: table.order,
    sorting_by: sortBy,
  });

  const { schoolList, schoolLoading, revalidateSchool } = useGetSchool({
    page: 0,
    limit: 1000,
    search: searchValue,
  });
  const { users } = useGetUsers({
    page: 0,
    limit: 1000,
    user_types: 'TRAINER',
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

  const canReset = !!filters.trainer_id;

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
        usersLoading={schoolLoading}
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
    const lastPaidDate = item?.last_paid_at
      ? moment(item.last_paid_at, 'HH:mm:ss dddd YYYY-MM-DD').format('DD/MM/YY, hh:mm A')
      : 'NA';
    const fields = [
      { label: t('School Name'), value: item?.vendor_name ?? 'NA' },
      { label: t('Total Bookings'), value: item?.total_paid_and_completed_booking ?? 0 },
      {
        label: t('Total Earnings'),
        value: (
          <>
            <span className="dirham-symbol">&#x00EA;</span>
            {item?.total_amount_earned_from_booking ?? 0}
          </>
        ),
      },

      {
        label: t('Last Paid'),
        value: (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="body2">{item?.last_paid_amount ?? 0}</Typography>
            <Chip
              label={`Time: ${lastPaidDate}`}
              size="small"
              color="success"
              variant="soft"
              sx={{ mt: 0.5 }}
            />
          </Box>
        ),
      },
      {
        label: t('Admin Payable Amount'),
        value: (
          <>
            <span className="dirham-symbol">&#x00EA;</span>
            {item?.amount_required_from_admin ?? 'NA'}
          </>
        ),
      },
    ];

    return (
      <Box
        display="grid"
        gridTemplateColumns="repeat(5, 1fr)"
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
    const lastPaidDate = item?.last_paid_at
      ? moment(item.last_paid_at, 'HH:mm:ss dddd YYYY-MM-DD').format('DD/MM/YY, hh:mm A')
      : 'NA';
    const fields = [
      { label: t('School Name'), value: item?.vendor_name ?? 'NA' },
      { label: t('Total Bookings'), value: item?.total_paid_and_completed_booking ?? 0 },
      {
        label: t('Total Earnings'),
        value: (
          <>
            <span className="dirham-symbol">&#x00EA;</span>

            {item?.total_amount_earned_from_booking ?? 0}
          </>
        ),
      },

      {
        label: t('Last Paid'),
        value: (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="body2">{item?.last_paid_amount ?? 0}</Typography>
            <Chip
              label={`Time: ${lastPaidDate}`}
              size="small"
              color="success"
              variant="soft"
              sx={{ mt: 0.5 }}
            />
          </Box>
        ),
      },
      {
        label: t('Admin Payable Amount'),
        value: (
          <>
            <span className="dirham-symbol">&#x00EA;</span>
            {item?.amount_required_from_admin ?? 'NA'}
          </>
        ),
      },
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
  const handleCardClick = (id, isPayoutDisabled, amount) => {
    setAmount(amount);
    router.push(paths.dashboard.payouts.schoolDetails(id), {
      disablePayout: isPayoutDisabled ? '1' : '0',
      amount: amount,
    });
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('School Payout')}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: t('Payout'),
            href: paths.dashboard.payouts.school,
          },
          { name: t('School Payouts') },
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
        {/* {renderFilters} */}

        {canReset && renderResults}
      </Stack>

      {notFound && <EmptyContent title="No Data" filled sx={{ py: 10 }} />}

      <Box display="flex" flexDirection="column" gap={3}>
        {payoutBySchoolList.map((tour: any) => (
          <Card
            key={tour.id}
            // sx={{
            //   p: 2,
            //   border: '1px solid #ddd',
            //   borderRadius: 2,
            //   boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            //   cursor: tour.total_paid_and_completed_booking > 0 ? 'pointer' : 'not-allowed',
            // }}
            // onClick={() =>
            //   tour.total_paid_and_completed_booking > 0 &&
            //   handleCardClick(
            //     tour.vendor_id,
            //     tour.amount_required_from_admin > 0,
            //     tour.amount_required_from_admin
            //   )
            // }

            // onClick={() => handleView(tour.id)}
          >
            <CardContent
              sx={{
                display: { xs: 'none', md: 'block' },
              }}
            >
              {renderLargeScreenContent(tour)}
            </CardContent>

            <CardContent
              sx={{
                display: { xs: 'block', md: 'none' },
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
