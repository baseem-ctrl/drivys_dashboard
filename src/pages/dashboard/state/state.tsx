import { Helmet } from 'react-helmet-async';
import StateListView from 'src/sections/state/view/state-list-view';

// ----------------------------------------------------------------------

export default function StateListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: State List</title>
      </Helmet>

      <StateListView />
    </>
  );
}
