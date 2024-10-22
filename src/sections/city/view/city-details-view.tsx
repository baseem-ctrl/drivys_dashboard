import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// components
import { useGetPackageCityList } from 'src/api/city';

// custom components for tabs
import CityDetails from './city-detail';
import CityPackageDetails from './city-package-details';

// ----------------------------------------------------------------------

type Props = {
  id: string;
  setOpenEditPopup: any;
  city: any;
};

export default function CityDetailsView({ city, setOpenEditPopup }: Props) {
  const [currentTab, setCurrentTab] = useState('cityDetails');
  const { packageCityList, packageCityListLoading, revalidatePackage } = useGetPackageCityList({
    city_id: city.id,
  });
  const CITY_DETAILS_TABS = [
    { value: 'cityDetails', label: 'City Details' },
    { value: 'package', label: 'Package' },
  ];

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

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
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
    </Container>
  );
}
