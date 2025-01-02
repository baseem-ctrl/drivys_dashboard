import { Container, Grid } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import RefundListView from './view/refund-list-view';
import PendingRequests from 'src/sections/overview/e-commerce/ecommerce-pending-trainer-request';
import PendingSchoolAdminRefundListView from './view/refund-list-view';

export default function ToDoListViewRefundSchoolAdmin() {
  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="To Do List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'To Do', href: paths.dashboard.todo.pendingRefund },
          { name: 'List' },
        ]}
        sx={{ mb: 3 }}
      />
      <Grid>
        <PendingSchoolAdminRefundListView />
      </Grid>
    </Container>
  );
}
