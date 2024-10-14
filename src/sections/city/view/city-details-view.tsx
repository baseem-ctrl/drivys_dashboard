import { useState, useCallback, useEffect } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
import { Box, Button, Stack, Card } from '@mui/material';
// components
import Label from 'src/components/label';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetAllCities, useGetPackageCityById, useGetPackageCityList } from 'src/api/city';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
// custom components for tabs
import CityDetails from './city-detail';
import CityPackageDetails from './city-package-details';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function CityDetailsView({ city }: Props) {
  console.log('city', city);
  const [currentTab, setCurrentTab] = useState('cityDetails');
  const { revalidateCities } = useGetAllCities();
  const { packageCityList, packageCityListLoading, revalidatePackageCity } = useGetPackageCityById(
    city.id
  );
  console.log('packageCityList', packageCityList);
  const CITY_DETAILS_TABS = [
    { value: 'cityDetails', label: 'City Details' },
    { value: 'package', label: 'Package' },
  ];

  // useEffect(() => {
  //   revalidateCities();
  // }, []);

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const quickCreate = useBoolean(); // State for handling additional actions (like editing)

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab} sx={{ mb: { xs: 3, md: 5 } }}>
      {CITY_DETAILS_TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      {/* <CustomBreadcrumbs
        heading="City Details"
        links={[{ name: 'Dashboard', href: '#' }, { name: 'City Details' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      /> */}

      {renderTabs}

      {currentTab === 'cityDetails' && (
        <CityDetails city={city} onEdit={() => quickCreate.onTrue()} />
      )}

      {currentTab === 'package' && (
        <CityPackageDetails
          reload={revalidatePackageCity}
          city={city}
          packageDetails={packageCityList}
          packageCityListLoading={packageCityListLoading}
        />
      )}

      {quickCreate.value && (
        <Button variant="contained" onClick={() => quickCreate.onFalse()}>
          Edit City
        </Button>
      )}
    </Container>
  );
}
