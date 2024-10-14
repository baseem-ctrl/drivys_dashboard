import { Helmet } from 'react-helmet-async';
import SchoolListView from 'src/sections/school/view/school-list-view';
// sections

// ----------------------------------------------------------------------

export default function SchoolListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: School List</title>
      </Helmet>

      <SchoolListView />
    </>
  );
}
