import { Helmet } from 'react-helmet-async';
// sections
import { LanguageListView } from 'src/sections/language/view';

// ----------------------------------------------------------------------

export default function LanguageListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Language List</title>
      </Helmet>

      <LanguageListView />
    </>
  );
}
