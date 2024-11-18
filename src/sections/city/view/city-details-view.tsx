import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// components
import { useGetAllCities, useGetCityById, useGetPackageCityList } from 'src/api/city';
import { useParams } from 'src/routes/hooks';
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle } from '@mui/material';

// custom components for tabs
import CityDetails from './city-detail';
import CityPackageDetails from './city-package-details';
import CityNewEditForm from '../city-new-edit-form';
import { paths } from 'src/routes/paths';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function CityDetailsView() {
  const [currentTab, setCurrentTab] = useState('cityDetails');
  const { id } = useParams();
  const { packageCityList, packageCityListLoading, revalidatePackage } = useGetPackageCityList({
    id,
  });
  const { revalidateCities } = useGetAllCities();
  const { city, cityLoading, cityError } = useGetCityById(id);
  const [openEditPopup, setOpenEditPopup] = useState(false);

  const CITY_DETAILS_TABS = [
    { value: 'cityDetails', label: 'City Details' },
    { value: 'package', label: 'Package' },
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

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'City',
            href: paths.dashboard.system.city,
          },
          { name: 'List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {renderTabs}

      {currentTab === 'cityDetails' && <CityDetails city={city} onEdit={setOpenEditPopup} />}

      {currentTab === 'package' && (
        <CityPackageDetails
          reload={revalidatePackage}
          city={city}
          packageDetails={packageCityList}
          packageCityListLoading={packageCityListLoading}
        />
      )}
      <Dialog open={openEditPopup} onClose={handleClosePopup}>
        <DialogTitle>Edit City</DialogTitle>
        <DialogContent>
          <CityNewEditForm
            city={city}
            reload={revalidateCities}
            handleClosePopup={handleClosePopup}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
