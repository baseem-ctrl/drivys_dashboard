import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
import { useLocales } from 'src/locales';

// routes
import { paths } from 'src/routes/paths';
// _mock
import { _jobs, JOB_PUBLISH_OPTIONS, JOB_DETAILS_TABS } from 'src/_mock';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//

import { useGetSchoolByIdAdmin } from 'src/api/school';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import SchoolAdminDetailsContent from './school-admin-details-content';
import SchoolAdminTrainers from './school-admin-details-trainers';
import SchoolAdminPackageDetails from './school-admin-package-details';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function SchoolAdminDetailsView({ id }: Props) {
  const { t } = useLocales();

  const SCHOOL_DETAILS_TABS = [
    { value: 'details', label: t('school_details') },
    { value: 'trainers', label: t('trainers') },
    { value: 'package', label: t('packages') },
  ];
  const settings = useSettingsContext();
  const { details, detailsLoading, revalidateDetails } = useGetSchoolByIdAdmin(id);

  const currentSchool = details[0]?.vendor;

  const [currentTab, setCurrentTab] = useState('details');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
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
              <Label variant="filled">{currentSchool?.candidates.length}</Label>
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
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('schools_details')}
        links={[{}]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          currentTab === 'trainers' && (
            <Button onClick={quickCreate.onTrue} variant="contained">
              {t('create_new_trainer')}
            </Button>
          )
        }
      />
      {!detailsLoading ? (
        <>
          {renderTabs}

          {currentTab === 'details' && (
            <SchoolAdminDetailsContent
              details={currentSchool}
              loading={detailsLoading}
              reload={revalidateDetails}
            />
          )}

          {currentTab === 'trainers' && (
            <SchoolAdminTrainers
              candidates={details}
              create={quickCreate.value}
              onCreate={handleAddTrainer}
              vendor_id={currentSchool?.id}
            />
          )}
          {currentTab === 'package' && <SchoolAdminPackageDetails id={currentSchool?.id} />}
          {!details && (
            <Stack>No School is Associated With, Please Contact System Admin To add a School</Stack>
          )}
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh', // Full viewport height
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
