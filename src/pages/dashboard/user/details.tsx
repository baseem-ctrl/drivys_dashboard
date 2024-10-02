import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
// sections
import UserDetailsView from 'src/sections/user/view/user-details-view';

// ----------------------------------------------------------------------

export default function UserDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Job Details</title>
      </Helmet>

      <UserDetailsView id={`${id}`} />
    </>
  );
}
