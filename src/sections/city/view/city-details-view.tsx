import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// components
import { useGetAllCities, useGetCityById, useGetPackageCityList } from 'src/api/city';
import { useParams } from 'src/routes/hooks';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TablePagination,
} from '@mui/material';

// custom components for tabs
import CityDetails from './city-detail';
import CityPackageDetails from './city-package-details';
import CityNewEditForm from '../city-new-edit-form';
import { paths } from 'src/routes/paths';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { useTable } from 'src/components/table';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function CityDetailsView() {
  const table = useTable({ defaultRowsPerPage: 20 });
  const { t, i18n } = useTranslation();
  const [currentTab, setCurrentTab] = useState('cityDetails');
  const { id } = useParams();
  const { packageCityList, packageCityListLoading, revalidatePackage, totalPages } =
    useGetPackageCityList({
      city_id: id,
      page: table?.page,
      limit: table?.rowsPerPage,
    });
  // const { revalidateCities } = useGetAllCities();
  const { city, cityLoading, cityError, revalidate } = useGetCityById(id);
  const [openEditPopup, setOpenEditPopup] = useState(false);

  const CITY_DETAILS_TABS = [
    { value: 'cityDetails', label: t('city') },
    { value: 'package', label: t('package') },
  ];
  const handleEditClick = () => {
    setOpenEditPopup(true);
  };

  const handleClosePopup = () => {
    setOpenEditPopup(false);
  };
  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab} sx={{ mb: { xs: 3, md: 5 } }}>
      {CITY_DETAILS_TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );
  if (cityLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  const localizedTranslation = city?.city_translations?.find(
    (translation) => translation.locale?.toLowerCase() === i18n.language?.toLowerCase()
  );

  const cityName = localizedTranslation?.name ?? city?.city_translations?.[0]?.name;
  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <CustomBreadcrumbs
        heading={t('Details')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('city'), href: paths.dashboard.system.city },
          { name: cityName },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {renderTabs}

      {currentTab === 'cityDetails' && <CityDetails city={city} onEdit={setOpenEditPopup} />}

      {currentTab === 'package' && (
        <>
          <CityPackageDetails
            reload={revalidatePackage}
            city={city}
            packageDetails={packageCityList}
            packageCityListLoading={packageCityListLoading}
            totalPages={totalPages}
          />
          <TablePagination
            count={totalPages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </>
      )}
      <Dialog open={openEditPopup} onClose={handleClosePopup}>
        <DialogTitle>{t('edit')}</DialogTitle>
        <DialogContent>
          <CityNewEditForm city={city} reload={revalidate} handleClosePopup={handleClosePopup} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
