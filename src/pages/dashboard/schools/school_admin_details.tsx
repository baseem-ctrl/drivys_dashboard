import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';

// sections
import SchoolAdminDetailsView from 'src/sections/school/login_school_admin/school-admin-details-view';

// ----------------------------------------------------------------------

export default function SchoolAdminDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Job Details</title>
      </Helmet>

      <SchoolAdminDetailsView id={`${id}`} />
    </>
  );
}
