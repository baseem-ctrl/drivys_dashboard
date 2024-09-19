import { Helmet } from 'react-helmet-async';
import DeliveryListView from 'src/sections/delivery/view/delivery-list-view';
// sections

// ----------------------------------------------------------------------

export default function DeliveryListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Delivery List</title>
      </Helmet>

      <DeliveryListView />
    </>
  );
}
