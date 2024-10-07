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


// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function PackageDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { details, detailsLoading, revalidateDetails } = useGetPackageById(id);

  const currentPackage = details;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Package Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Package', href: paths.dashboard.package.root },
          { name: 'Details' },
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
