import { Helmet } from 'react-helmet-async';
import NotificationlistingListView from 'src/sections/notifications/view/notifications-list-view';
// sections

// ----------------------------------------------------------------------

export default function NotificationsListingListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Notifications List</title>
      </Helmet>

      <NotificationlistingListView />
    </>
  );
}
