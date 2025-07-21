import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hooks';
import AssistantUserDetailsContent from 'src/sections/user/assistant-user-details-content';
import AssistantUserDetailsView from 'src/sections/user/view/assistant-user-details-view';
// sections
import UserDetailsView from 'src/sections/user/view/user-details-view';

// ----------------------------------------------------------------------

export default function AssistantDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Job Details</title>
      </Helmet>

      <AssistantUserDetailsView id={`${id}`} />
    </>
  );
}
