import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _jobs, JOB_PUBLISH_OPTIONS, JOB_DETAILS_TABS } from 'src/_mock';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//
import JobDetailsToolbar from '../job-details-toolbar';
import JobDetailsContent from '../homelisting-details-content';
import JobDetailsCandidates from '../homelisting-details-trainers';
import { HOME_DETAILS_TABS } from 'src/_mock/_homelisting';
import HomeListingDetailsContent from '../homelisting-details-content';
import HomeListingTrainers from '../homelisting-details-trainers';
import { useGetSchoolById } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetHomeListingById } from 'src/api/homelisting';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function HomeListingDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { details, detailsLoading, revalidateDetails } = useGetHomeListingById(id);

  const currentJob = details;

  const [publish, setPublish] = useState(currentJob?.publish);

  const [currentTab, setCurrentTab] = useState('details');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangePublish = useCallback((newValue: string) => {
    setPublish(newValue);
  }, []);
  const quickCreate = useBoolean();
  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {HOME_DETAILS_TABS.map((tab) => (
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
  const handleAddTrainer = () => {
    if (quickCreate) {
      quickCreate.onFalse();
    } else {
      quickCreate.onTrue();
    }
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Home Listing Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: "Home Listing",
            href: paths.dashboard.homelisting.root,
          },
          { name: 'Details' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          currentTab === 'trainers' && (
            <Button onClick={quickCreate.onTrue} variant="contained">
              Add Trainer
            </Button>
          )
        }
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

      {currentTab === 'details' && (
        <HomeListingDetailsContent
          details={currentJob}
          loading={detailsLoading}
          reload={revalidateDetails}
        />
      )}

      {currentTab === 'trainers' && (
        <HomeListingTrainers
          homelistingdetails={details}
          create={quickCreate.value}
          onCreate={handleAddTrainer}
          revalidateDetails={revalidateDetails}
          detailsLoading={detailsLoading}
        />
      )}
    </Container>
  );
}
