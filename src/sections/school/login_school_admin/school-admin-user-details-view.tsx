import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _jobs, JOB_PUBLISH_OPTIONS, JOB_DETAILS_TABS, USER_DETAILS_TABS } from 'src/_mock';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//

import JobDetailsCandidates from '../school-details-trainers';
import SchoolTrainers from '../school-details-trainers';
import { useGetSchoolById } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Button } from '@mui/base';
import { useGetAddressList, useGetUserDetails } from 'src/api/users';
import UserDetailsContentAdmin from './school-admin-user-details-content';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserDetailsViewAdmin({ id }: Props) {
  const settings = useSettingsContext();
  const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  const currentJob = details;
  const { t } = useTranslation();
  const [publish, setPublish] = useState(currentJob?.publish);

  const [currentTab, setCurrentTab] = useState('details');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangePublish = useCallback((newValue: string) => {
    setPublish(newValue);
  }, []);
  const { addresses, addressesLoading, addressesError, revalidateAddresses } = useGetAddressList({
    userId: id, // Add userId here
    page: 0, // First page
    limit: 10, // Limit to 10 addresses
    search: '', // Optional search string
  });
  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {USER_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            tab.value === 'candidates' ? (
              <Label variant="filled">{currentJob?.candidates.length}</Label>
            ) : (
              ''
            )
          }
        />
      ))}
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('user_details')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('trainers'), href: paths.dashboard.school.trainer },
          { name: t('details') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <UserDetailsContentAdmin
        addresses={addresses || []}
        details={details}
        loading={detailsLoading}
        reload={revalidateDetails}
        addressesLoading={addressesLoading}
      />
    </Container>
  );
}
