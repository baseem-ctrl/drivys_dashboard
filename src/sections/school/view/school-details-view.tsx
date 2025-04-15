import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';

// _mock
import { _jobs, JOB_PUBLISH_OPTIONS, JOB_DETAILS_TABS } from 'src/_mock';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//
import JobDetailsToolbar from '../job-details-toolbar';
import JobDetailsContent from '../school-details-content';
import JobDetailsCandidates from '../school-details-trainers';
import SchoolDetailsContent from '../school-details-content';
import SchoolTrainers from '../school-details-trainers';
import { useGetSchoolById } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import SchoolPackageDetails from './school-package-details';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function SchoolDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { user } = useAuthContext();
  const { details, detailsLoading, revalidateDetails } = useGetSchoolById(id);

  const currentJob = details;

  const [publish, setPublish] = useState(currentJob?.publish);
  const SCHOOL_DETAILS_TABS = [
    { value: 'details', label: t('school_details') },
    { value: 'trainers', label: t('trainers') },
    { value: 'package', label: t('packages') },
  ];
  const filteredTabs =
    user?.user?.user_type === 'COLLECTOR'
      ? SCHOOL_DETAILS_TABS.filter((tab) => tab.value === 'details')
      : SCHOOL_DETAILS_TABS;
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
      {filteredTabs.map((tab) => (
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
      {user?.user?.user_type !== 'COLLECTOR' && (
        <CustomBreadcrumbs
          heading={t('schools_details')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            {
              name: `${
                currentJob?.vendor_translations?.length > 0
                  ? currentJob?.vendor_translations[0]?.name
                  : t('school')
              }`,
              href: paths.dashboard.school.root,
            },
            { name: t('details') },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
          action={
            currentTab === 'trainers' && (
              <Button onClick={quickCreate.onTrue} variant="contained">
                {t('add_trainer')}
              </Button>
            )
          }
        />
      )}

      {/* <JobDetailsToolbar
        backLink={paths.dashboard.job.root}
        editLink={paths.dashboard.job.edit(`${currentJob?.id}`)}
        liveLink="#"
        publish={publish || ''}
        onChangePublish={handleChangePublish}
        publishOptions={JOB_PUBLISH_OPTIONS}
      /> */}
      {!detailsLoading ? (
        <>
          {renderTabs}

          {currentTab === 'details' && (
            <SchoolDetailsContent
              t={t}
              details={currentJob}
              loading={detailsLoading}
              reload={revalidateDetails}
              user={user.user?.user_type}
            />
          )}

          {currentTab === 'trainers' && user?.user?.user_type !== 'COLLECTOR' && (
            <SchoolTrainers
              t={t}
              candidates={details}
              create={quickCreate.value}
              onCreate={handleAddTrainer}
            />
          )}
          {currentTab === 'package' && <SchoolPackageDetails t={t} id={id} />}
        </>
      ) : !details ? (
        <Stack>{t('no_school_associated')}</Stack>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // height: '100vh', // Full viewport height
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
