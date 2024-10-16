import { Helmet } from 'react-helmet-async';
import CityListView from 'src/sections/city/view/city-list-view';
// sections

// ----------------------------------------------------------------------

export default function CityListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: City List</title>
      </Helmet>

      <CityListView />
    </>
  );
}
