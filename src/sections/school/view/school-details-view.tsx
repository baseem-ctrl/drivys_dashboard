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
import JobDetailsContent from '../school-details-content';
import JobDetailsCandidates from '../school-details-trainers';
import { SCHOOL_DETAILS_TABS } from 'src/_mock/_school';
import SchoolDetailsContent from '../school-details-content';
import SchoolTrainers from '../school-details-trainers';
import { useGetSchoolById } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function SchoolDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { details, detailsLoading, revalidateDetails } = useGetSchoolById(id);

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
      {SCHOOL_DETAILS_TABS.map((tab) => (
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
        heading="Schools Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: `${
              currentJob?.vendor_translations?.length > 0
                ? currentJob?.vendor_translations[0]?.name
                : 'School'
            }`,
            href: paths.dashboard.school.root,
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
        <SchoolDetailsContent
          details={currentJob}
          loading={detailsLoading}
          reload={revalidateDetails}
        />
      )}

      {currentTab === 'trainers' && (
        <SchoolTrainers
          candidates={details}
          create={quickCreate.value}
          onCreate={handleAddTrainer}
        />
      )}
    </Container>
  );
}
