import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
// sections
import SchoolDetailsView from 'src/sections/school/view/school-details-view';

// ----------------------------------------------------------------------

export default function SchoolDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Job Details</title>
      </Helmet>

      <SchoolDetailsView id={`${id}`} />
    </>
  );
}
