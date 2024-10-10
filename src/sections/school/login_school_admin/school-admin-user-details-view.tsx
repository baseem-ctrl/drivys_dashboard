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
import { SCHOOL_DETAILS_TABS } from 'src/_mock/_school';
import SchoolTrainers from '../school-details-trainers';
import { useGetSchoolById } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Button } from '@mui/base';
import { useGetUserDetails } from 'src/api/users';
import UserDetailsContentAdmin from './school-admin-user-details-content';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserDetailsViewAdmin({ id }: Props) {
  const settings = useSettingsContext();
  const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  const currentJob = details;

  const [publish, setPublish] = useState(currentJob?.publish);

  const [currentTab, setCurrentTab] = useState('details');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangePublish = useCallback((newValue: string) => {
    setPublish(newValue);
  }, []);

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
        heading="User Details"
        links={[
          {}
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserDetailsContentAdmin details={details} loading={detailsLoading} />
    </Container>
  );
}
