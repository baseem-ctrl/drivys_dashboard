import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useGetCategories } from 'src/api/category';
import { Checkbox, Grid } from '@mui/material';
import { useGetVendorsList } from 'src/api/vendor';
import { useGetProductsList } from 'src/api/product2';
import FormProvider from 'src/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { CreateMapper } from 'src/api/home-slider';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { IUserTableFilterValue, IUserTableFilters } from 'src/types/user';
import { TableNoData } from 'src/components/table';

import UserTableToolbar from '../vendor/vendor-table-toolbar';

interface Props {
  title?: string;
  open: boolean;
  homeSliderTypeId: number;
  homeSliderId: number;
  onClose: () => void;
  //   onReload: () => void;
  updateValue: any;
}
const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

export default function MappingList({
  open,
  onClose,
  homeSliderTypeId,
  updateValue,
  homeSliderId,
}) {
  const [filters, setFilters] = useState(defaultFilters);
  const { category, categoryLoading, revalidateCategories } = useGetCategories(
    0,
    1000,
    '',
    '',
    filters.name
  );
  const { products, productsLoading, revalidateProducts } = useGetProductsList(
    0,
    1000,
    filters.name
  );
  const { vendor, vendorLoading, revalidateVendors } = useGetVendorsList(0, 1000, filters.name);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const NewSliderSchema = Yup.object().shape({});

  const defaultValues = useMemo(() => ({}), [updateValue]);
  const methods = useForm({
    resolver: yupResolver(NewSliderSchema),
    defaultValues,
  });
  const { reset, formState } = methods;
  const { isSubmitting } = formState;

  const [arryOfId, setArreyOfId] = useState([]);
  const [selected, setSelected] = useState('');
  const [isTrue, setIsTrue] = useState('');

  const handleChange = (e, id, type) => {
    setArreyOfId((prevIds) => {
      if (!prevIds.includes(id)) {
        return [...prevIds, id];
      } else {
        return prevIds.filter((prevId) => prevId !== id);
      }
    });

    setSelected(id);
    setIsTrue(type);
  };

  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!updateValue?.Id) {
        const formData = new FormData();
        formData.append('HomeSliderId', homeSliderId.toString());

        arryOfId.forEach((id) => {
          if (isTrue === 'product') {
            formData.append(`Products[${id}]`, id);
          }
          if (isTrue === 'category') {
            formData.append(`Categories[${id}]`, id);
          }
          if (isTrue === 'vendor') {
            formData.append(`Vendors[${id}]`, id);
          }
        });

        const response = await CreateMapper(formData);

        if (response) {
          reset();
          enqueueSnackbar(response.message, { variant: 'success' });
          onClose();
          router.push(paths.dashboard.slider.root);
        } else {
          enqueueSnackbar('select first', { variant: 'error' });
        }
      }
    } catch (error) {
      console.error(error);
      if (error && error.message) {
        Object.keys(error.message).forEach((key) => {
          error.message[key].forEach((message: string) => {
            enqueueSnackbar(message, { variant: 'error' });
          });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  const notFound = !vendor.length || !category.length || !products.length;

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>
        {homeSliderTypeId === 0 && 'Select Voucher'}
        {homeSliderTypeId === 1 && 'Select Categories'}
        {homeSliderTypeId === 2 && 'Select Vendors'}
      </DialogTitle>

      <DialogContent>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="flex-end" spacing={10}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {updateValue ? 'Save' : 'Create'}
              </LoadingButton>
            </Stack>
          </Grid>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            revalidate={
              (homeSliderTypeId === 0 && revalidateProducts) ||
              (homeSliderTypeId === 1 && revalidateCategories) ||
              (homeSliderTypeId === 2 && revalidateVendors)
            }
          />

          {homeSliderTypeId === 0 &&
            !productsLoading &&
            products.map((product) => (
              <Stack
                key={product.Id}
                direction="row"
                sx={{
                  pl: 2,
                  pr: 1,
                  py: 1,
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value={selected === product.Id}
                      onChange={(e) => handleChange(e, product.Id, 'product')}
                    />
                  }
                  label={product.Name}
                  sx={{ flexGrow: 1, m: 0 }}
                />
              </Stack>
            ))}
          {homeSliderTypeId === 1 &&
            !categoryLoading &&
            category.map((cat) => (
              <Stack
                key={cat.Id}
                direction="row"
                sx={{
                  pl: 2,
                  pr: 1,
                  py: 1,
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value={selected === cat.Id}
                      onChange={(e) => handleChange(e, cat.Id, 'category')}
                    />
                  }
                  label={cat.Name}
                  sx={{ flexGrow: 1, m: 0 }}
                />
              </Stack>
            ))}
          {homeSliderTypeId === 2 &&
            !vendorLoading &&
            vendor.map((ven) => (
              <Stack
                key={ven.Id}
                direction="row"
                sx={{
                  pl: 2,
                  pr: 1,
                  py: 1,
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value={selected === ven.Id}
                      onChange={(e) => handleChange(e, ven.Id, 'vendor')}
                    />
                  }
                  label={ven.Name}
                  sx={{ flexGrow: 1, m: 0 }}
                />
              </Stack>
            ))}
          {(!productsLoading || !vendorLoading || !categoryLoading) &&
            products.length === 0 &&
            vendor.length === 0 &&
            category.length === 0 ? (
            <TableNoData notFound={notFound} />
          ) : null}
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
