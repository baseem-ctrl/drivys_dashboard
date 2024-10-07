import { Helmet } from 'react-helmet-async';
import PackageListView from 'src/sections/packages/view/package-list-view';

// sections

// ----------------------------------------------------------------------

export default function PackageListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Package List</title>
      </Helmet>

      <PackageListView />
    </>
  );
}
