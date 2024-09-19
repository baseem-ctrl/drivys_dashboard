import { Helmet } from 'react-helmet-async';

import { JobListView } from 'src/sections/job/view';
// sections

// ----------------------------------------------------------------------

export default function JobListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Category List</title>
      </Helmet>

      <JobListView />
    </>
  );
}
