import { Helmet } from 'react-helmet-async';
import HomelistingListView from 'src/sections/homelisting/view/homelisting-list-view';
// sections

// ----------------------------------------------------------------------

export default function HomeListingListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Home Listing List</title>
      </Helmet>

      <HomelistingListView />
    </>
  );
}
