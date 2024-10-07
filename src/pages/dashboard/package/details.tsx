import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
import PackageDetailsView from 'src/sections/packages/view/package-details-view';
// sections

// ----------------------------------------------------------------------

export default function PackageDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Package Details</title>
      </Helmet>

      <PackageDetailsView id={`${id}`} />
    </>
  );
}
