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

import JobDetailsToolbar from '../job-details-toolbar';
import JobDetailsContent from '../user-details-content';
import JobDetailsCandidates from '../school-details-trainers';
import { SCHOOL_DETAILS_TABS } from 'src/_mock/_school';
import SchoolDetailsContent from '../user-details-content';
import SchoolTrainers from '../school-details-trainers';
import { useGetSchoolById } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Button } from '@mui/base';
import { useGetUserDetails } from 'src/api/users';
import UserProfileView from './user-profile-view';
import { useGetAddressList } from 'src/api/users';
import UserDetailsContent from '../user-details-content';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const userId = Number(window.location.pathname.split('/').pop());
  const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  // Use the new hook to get the address list
  const { addresses, addressesLoading, addressesError, revalidateAddresses } = useGetAddressList({
    userId, // Add userId here
    page: 0, // First page
    limit: 10, // Limit to 10 addresses
    search: '', // Optional search string
  });

  const currentJob = details;

  // const [publish, setPublish] = useState(currentJob?.publish);

  // const [currentTab, setCurrentTab] = useState('details');

  // const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
  //   setCurrentTab(newValue);
  // }, []);

  // const handleChangePublish = useCallback((newValue: string) => {
  //   setPublish(newValue);
  // }, []);
  // const renderTabs = (
  //   <Tabs
  //     value={currentTab}
  //     onChange={handleChangeTab}
  //     sx={{
  //       mb: { xs: 3, md: 5 },
  //     }}
  //   >
  //     {USER_DETAILS_TABS.map((tab) => (
  //       <Tab
  //         key={tab.value}
  //         iconPosition="end"
  //         value={tab.value}
  //         label={tab.label}
  //         icon={
  //           tab.value === 'candidates' ? (
  //             <Label variant="filled">{currentJob?.candidates.length}</Label>
  //           ) : (
  //             ''
  //           )
  //         }
  //       />
  //     ))}
  //   </Tabs>
  // );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="User Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users', href: paths.dashboard.user.list },
          { name: `${details?.user?.name ?? 'Details'}` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserDetailsContent
        details={details}
        addresses={addresses || []}
        loading={detailsLoading}
        addressesLoading={addressesLoading}
        reload={revalidateAddresses}
      />
    </Container>
  );
}
