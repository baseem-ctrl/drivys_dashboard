import { Helmet } from 'react-helmet-async';
import PickupListView from 'src/sections/pickup/view/pickup-list-view';

// ----------------------------------------------------------------------

export default function PickupListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Pickup List</title>
      </Helmet>

      <PickupListView />
    </>
  );
}
