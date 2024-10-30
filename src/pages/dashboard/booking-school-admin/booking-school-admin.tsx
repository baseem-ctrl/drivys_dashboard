import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
import BookingListView from 'src/sections/booking/view/booking-list-view';
// ----------------------------------------------------------------------
export default function BookingSchoolAdminDetailsPage() {
  const params = useParams();
  const { id } = params;
  return (
    <>
      <Helmet>
        <title> Dashboard: Booking Details</title>
      </Helmet>
      <BookingListView id={`${id}`} />
    </>
  );
}
