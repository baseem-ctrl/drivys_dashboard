import { Helmet } from 'react-helmet-async';
import DialectListView from 'src/sections/dilects/view/dialects-list-view';

// ----------------------------------------------------------------------

export default function DialectListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dialect List</title>
      </Helmet>

      <DialectListView />
    </>
  );
}
