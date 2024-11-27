import { Helmet } from 'react-helmet-async';
import { AppSettingsListView } from 'src/sections/app-settings/view';
// sections

// ----------------------------------------------------------------------

export default function AppSettingsListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Language List</title>
      </Helmet>

      <AppSettingsListView />
    </>
  );
}
