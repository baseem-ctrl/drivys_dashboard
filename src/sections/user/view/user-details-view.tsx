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
import JobDetailsContent from '../school-details-content';
import JobDetailsCandidates from '../school-details-trainers';
import { SCHOOL_DETAILS_TABS } from 'src/_mock/_school';
import SchoolDetailsContent from '../school-details-content';
import SchoolTrainers from '../school-details-trainers';
import { useGetSchoolById } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Button } from '@mui/base';
import { useGetUserById } from 'src/api/users';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { details, detailsLoading, revalidateDetails } = useGetUserById(id);
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
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Users', href: paths.dashboard.user.list },
          { name: `${details?.user?.name ?? 'Details'}` },
        ]}
        // action={
        //   <Button
        //     onClick={quickCreate.onTrue}
        //     variant="contained"
        //     startIcon={<Iconify icon="mingcute:add-line" />}
        //   >
        //     New School
        //   </Butto>
        // }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {/* <JobDetailsToolbar
        backLink={paths.dashboard.job.root}
        editLink={paths.dashboard.job.edit(`${currentJob?.id}`)}
        liveLink="#"
        publish={publish || ''}
        onChangePublish={handleChangePublish}
        publishOptions={JOB_PUBLISH_OPTIONS}
      /> */}
      {renderTabs}

      {/* {currentTab === 'details' && (
        <SchoolDetailsContent
          details={currentJob}
          loading={detailsLoading}
          reload={revalidateDetails}
        />
      )} */}

      {/* {currentTab === 'trainers' && <SchoolTrainers candidates={currentJob?.candidates} />} */}
    </Container>
  );
}
