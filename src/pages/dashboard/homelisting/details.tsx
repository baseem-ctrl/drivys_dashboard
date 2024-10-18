import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
// sections
import HomeListingDetailsView from 'src/sections/homelisting/view/homelisting-details-view';


// ----------------------------------------------------------------------

export default function HomeListingDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Job Details</title>
      </Helmet>

      <HomeListingDetailsView id={`${id}`} />
    </>
  );
}
