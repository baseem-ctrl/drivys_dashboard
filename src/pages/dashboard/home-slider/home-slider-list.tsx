import { Helmet } from 'react-helmet-async';
// sections
import HomeSliderListView from 'src/sections/home-slider/home-slider-list-view';

// ----------------------------------------------------------------------

export default function HomeSliderListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Home Slider List</title>
      </Helmet>

      <HomeSliderListView />
    </>
  );
}
