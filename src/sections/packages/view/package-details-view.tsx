// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
//
import PackageDetails from '../package-details-content';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { useGetPackageById } from 'src/api/package';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function PackageDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { t } = useTranslation();
  const { details, detailsLoading, revalidateDetails } = useGetPackageById(id);
  const { user } = useAuthContext();

  const currentPackage = details;
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('Package Details')}
        links={[
          { name: t('Dashboard'), href: paths.dashboard.root },
          {
            name: t('Package'),
            href:
              user.user.user_type === 'ADMIN'
                ? paths.dashboard.package.root
                : paths.dashboard.school.package,
          },
          { name: t('Details') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PackageDetails
        details={currentPackage}
        loading={detailsLoading}
        reload={revalidateDetails}
      />
    </Container>
  );
}
