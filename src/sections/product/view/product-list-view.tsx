import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// _mock
import { STOCK_OPTIONS } from 'src/_mock';
// api
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useTable, TablePaginationCustom } from 'src/components/table';
import {} from 'src/components/custom-dialog';
import Box from '@mui/material/Box';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// types
import { IProductItem, IProductTableFilterValue } from 'src/types/product';
import { RouterLink } from 'src/routes/components';
import EmptyContent from 'src/components/empty-content/empty-content';
import { useGetProducts } from 'src/api/product';
import { Stack } from '@mui/material';
import ProductCard from '../product-card';
import CardSkeleton from '../card-skeleton';
import ProductFiltersResult from '../product-filters-result';
import ProductSearch from '../product-search';
import ProductFilters from '../product-filters';

// ----------------------------------------------------------------------

const defaultFilters: any = {
  name: '',
  publish: [],
  stock: [],
  price_min: 0,
  price_max: 0,
  discount_price_max: 0,
  discount_price_min: 0,
  cost_price_max: 0,
  cost_price_min: 0,
  weight_max: 0,
  weight_min: 0,
  in_stock: '',
};

// ----------------------------------------------------------------------

export default function ProductListView() {
  const router = useRouter();

  const table = useTable({ defaultRowsPerPage: 15 });

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState<IProductItem[]>([]);
  const openFilters = useBoolean();

  const [search, setSearch] = useState('');

  const [filters, setFilters] = useState(defaultFilters);

  const {
    products,
    productsEmpty,
    productsError,
    productsLoading,
    totalPages,
    revalidateProducts,
  } = useGetProducts({
    limit: table.rowsPerPage,
    page: table.page + 1,
    search: filters.name,
    price_min: filters.price_min,
    price_max: filters?.price_max,
    discount_price_max: filters?.discount_price_max,
    discount_price_min: filters?.discount_price_min,
    cost_price_max: filters?.cost_price_max,
    cost_price_min: filters?.cost_price_min,
    weight_max: filters?.weight_max,
    weight_min: filters?.weight_min,
    in_stock: filters?.in_stock,
  });

  useEffect(() => {
    if (products?.length) {
      setTableData(products);
    } else {
      setTableData([]);
    }
  }, [products]);

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback(
    (name: string, value: IProductTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id: string) => {
      console.log(id, 'deeelete');
    },
    [tableData]
  );
  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const [addOneProduct, setAddOneProduct] = useState(false);

  const handleAddNewProduct = () => {
    if (!addOneProduct) {
      setTableData((prevTableData: any) => [
        {
          id: Date.now(),
          product_translation: [],
          newProduct: true,
        },
        ...prevTableData,
      ]);
    }

    setAddOneProduct(true);
  };
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ paddingTop: 2, paddingLeft: 2 }}
    >
      <ProductSearch query={search} results={filters} onSearch={handleFilters} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <ProductFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          filters={filters}
          onFilters={handleFilters}
          canReset={canReset}
          onResetFilters={handleResetFilters}
          stockOptions={STOCK_OPTIONS}
        />
      </Stack>
    </Stack>
  );
  const renderResults = (
    <ProductFiltersResult
      onResetFilters={handleResetFilters}
      canReset={canReset}
      results={tableData?.length}
    />
  );
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Products List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Product',
            href: paths.dashboard.product.root,
          },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            onClick={() => handleAddNewProduct()}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={addOneProduct}
          >
            New Product
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card sx={{ marginTop: '50px' }}>
        <Stack
          spacing={2.5}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          {renderFilters}

          {canReset && renderResults}
        </Stack>

        {productsLoading &&
          [...Array(table.rowsPerPage)].map((_, index) => (
            <CardSkeleton key={index} sx={{ height: denseHeight }} />
          ))}

        {!productsLoading && tableData && (
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            {tableData.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={() => handleViewRow(product.id)}
                onEdit={() => handleEditRow(product.id)}
                onDelete={() => handleDeleteRow(product.id)}
                reload={revalidateProducts}
                setTableData={setTableData}
                setAddOneProduct={setAddOneProduct}
              />
            ))}
          </Box>
        )}

        {!productsLoading && productsEmpty && !productsError && (
          <EmptyContent filled title="No Data" />
        )}

        {!productsLoading && productsError && <EmptyContent filled title="Error" />}

        <TablePaginationCustom
          count={totalPages}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
