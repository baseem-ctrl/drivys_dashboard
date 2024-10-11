import { Helmet } from 'react-helmet-async';
import HomeSliderCreateView from 'src/sections/home-slider/home-slider-create-view';
// sections

// ----------------------------------------------------------------------

export default function HomeSliderCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create Home Slider</title>
      </Helmet>

      <HomeSliderCreateView />
    </>
  );
}
