// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _userList } from 'src/_mock';
import { useLocales } from 'src/locales';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import UserNewEditForm from '../user-new-edit-form';
import { useGetUserDetails } from 'src/api/users';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  const currentUser = details;
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('edit')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('user'),
            href: paths.dashboard.user.list,
          },
          { name: currentUser?.name || t('user_details') }, // Fallback to 'User Details' if name is null
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentUser?.id && (
        <UserNewEditForm
          currentUser={currentUser}
          detailsLoading={detailsLoading}
          id={id}
          revalidateDetails={() => revalidateDetails}
        />
      )}
    </Container>
  );
}
