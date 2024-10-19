import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
// sections
import UserDetailsViewAdmin from 'src/sections/school/login_school_admin/school-admin-user-details-view';

// ----------------------------------------------------------------------

export default function UserDetailsAdminPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Trainer Details</title>
      </Helmet>

      <UserDetailsViewAdmin id={`${id}`} />
    </>
  );
}
