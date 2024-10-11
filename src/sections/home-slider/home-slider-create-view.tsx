// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import HomeSliderForm from './home-slider-form';

//

// ----------------------------------------------------------------------

export default function HomeSliderCreateView() {
  const settings = useSettingsContext();

  return (
    <Container>
      <CustomBreadcrumbs
        heading="Create Home Slider"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Sliders',
            href: paths.dashboard.slider.root,
          },
          { name: 'New Home slider' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HomeSliderForm />
    </Container>
  );
}
