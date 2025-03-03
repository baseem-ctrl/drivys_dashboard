import orderBy from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useLocales } from 'src/locales';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// _mock
import {
  _jobs,
  _roles,
  JOB_SORT_OPTIONS,
  JOB_BENEFIT_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_EMPLOYMENT_TYPE_OPTIONS,
} from 'src/_mock';
import { PUBLISH_OPTIONS } from 'src/_mock';

// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// types
import { IJobItem, IJobFilters, IJobFilterValue } from 'src/types/job';
//
import { CircularProgress, TableCell, TableRow, Box } from '@mui/material';
import { useGetAllCategory } from 'src/api/category';
import { TablePaginationCustom, useTable } from 'src/components/table';
import CategoryList from '../category-list';
import JobSort from '../job-sort';
import JobSearch from '../job-search';
import CategoryFilters from '../category-filters';
import JobFiltersResult from '../job-filters-result';
import CardSkeleton from '../card-skeleton';

// ----------------------------------------------------------------------

const defaultFilters: IJobFilters = {
  roles: [],
  locations: [],
  benefits: [],
  experience: 'all',
  employmentTypes: [],
  published: 'all',
  parent_id: { label: '', value: '' },
  name: '',
};

const isPublishMap = {
  All: '',
  Published: '1',
  UnPublished: '0',
};

// ----------------------------------------------------------------------

export default function CategoryListView() {
  const settings = useSettingsContext();
  const { t } = useLocales();

  const openFilters = useBoolean();

  const [sortBy, setSortBy] = useState('latest');

  const table = useTable({ defaultRowsPerPage: 15 });

  const [filters, setFilters] = useState(defaultFilters);

  const is_published_value = isPublishMap[filters.published] || null;

  const { category, categoryLoading, totalpages, revalidateCategory, categoryError } =
    useGetAllCategory({
      limit: table.rowsPerPage,
      page: table.page + 1,
      search: filters.name,
      published: is_published_value,
      parent_id: filters?.parent_id?.value,
    });

  const [tableData, setTableData] = useState<any>([]);

  const [addOnlyOneCategory, setAddOnlyOneCategory] = useState(false);

  useEffect(() => {
    if (category?.length) {
      setTableData(category);
    } else {
      setTableData([]);
    }
  }, [category]);

  const [search, setSearch] = useState<{ query: string; results: IJobItem[] }>({
    query: '',
    results: [],
  });

  const dataFiltered = applyFilter({
    inputData: _jobs,
    filters,
    sortBy,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = !dataFiltered.length && canReset;

  const handleFilters = useCallback((name: string, value: IJobFilterValue) => {
    setFilters((prevState) => ({
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
        const results = _jobs.filter(
          (job) => job.title.toLowerCase().indexOf(search.query.toLowerCase()) !== -1
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
    window.location.reload();
  }, []);

  const handleAddNewCategory = () => {
    if (!addOnlyOneCategory) {
      setTableData((prevTableData: any) => [
        {
          id: Date.now(),
          category_translations: [],
          newCategory: true,
        },
        ...prevTableData,
      ]);
    }

    setAddOnlyOneCategory(true);
  };

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <JobSearch query={filters.name} results={filters} onSearch={handleFilters} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <CategoryFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
          //

          locationOptions={countries}
          roleOptions={_roles}
          benefitOptions={JOB_BENEFIT_OPTIONS.map((option) => option.label)}
          experienceOptions={['all', ...JOB_EXPERIENCE_OPTIONS.map((option) => option.label)]}
          employmentTypeOptions={JOB_EMPLOYMENT_TYPE_OPTIONS.map((option) => option.label)}
          publishOptions={['all', ...PUBLISH_OPTIONS.map((option) => option.label)]}
        />
      </Stack>
    </Stack>
  );

  const renderResults = (
    <JobFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={tableData.length}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('category_list')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          {
            name: t('category'),
            href: paths.dashboard.category.root,
          },
          { name: t('list') },
        ]}
        action={
          <Button
            component={RouterLink}
            onClick={() => handleAddNewCategory()}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={addOnlyOneCategory}
          >
            {t('new_category')}
          </Button>
        }
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

      {notFound && <EmptyContent filled title="No Data" sx={{ py: 10 }} />}
      <TableRow>{categoryLoading && <CardSkeleton />}</TableRow>

      <CategoryList
        tableData={tableData}
        jobs={dataFiltered}
        reload={revalidateCategory}
        setTableData={setTableData}
        setAddOnlyOneCategory={setAddOnlyOneCategory}
        // parentCategoryValues={category}
      />
      <TablePaginationCustom
        count={totalpages}
        page={table.page ?? 0}
        rowsPerPage={table?.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}

        // dense={table.dense}
        // onChangeDense={table.onChangeDense}
        //
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({
  inputData,
  filters,
  sortBy,
}: {
  inputData: IJobItem[];
  filters: IJobFilters;
  sortBy: string;
}) => {
  const { employmentTypes, experience, roles, locations, benefits } = filters;

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
  if (employmentTypes.length) {
    inputData = inputData.filter((job) =>
      job.employmentTypes.some((item) => employmentTypes.includes(item))
    );
  }

  if (experience !== 'all') {
    inputData = inputData.filter((job) => job.experience === experience);
  }

  if (roles.length) {
    inputData = inputData.filter((job) => roles.includes(job.role));
  }

  if (locations.length) {
    inputData = inputData.filter((job) => job.locations.some((item) => locations.includes(item)));
  }

  if (benefits.length) {
    inputData = inputData.filter((job) => job.benefits.some((item) => benefits.includes(item)));
  }

  return inputData;
};
