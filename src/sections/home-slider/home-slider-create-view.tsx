// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import HomeSliderForm from './home-slider-form';
import { useTranslation } from 'react-i18next';

//

// ----------------------------------------------------------------------

export default function HomeSliderCreateView() {
  const settings = useSettingsContext();
  const { t } = useTranslation()
  return (
    <Container>
      <CustomBreadcrumbs
        heading={t("Create Home Slider")}
        links={[
          {
            name: t('Dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('Sliders'),
            href: paths.dashboard.slider.root,
          },
          { name: t('New Home slider') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HomeSliderForm />
    </Container>
  );
}
