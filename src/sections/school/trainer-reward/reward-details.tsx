import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
// sections
import CreateRewardForm from './create-trainer-reward';

// ----------------------------------------------------------------------

export default function RewardDetailsPage() {
  const params = useParams();

  const { id } = params;
  return (
    <>
      <Helmet>
        <title> Dashboard: reward Details</title>
      </Helmet>

      <CreateRewardForm id={`${id}`} />
    </>
  );
}
