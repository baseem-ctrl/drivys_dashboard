// @mui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import {
  _ecommerceNewProducts,
  _ecommerceSalesOverview,
  _ecommerceBestSalesman,
  _ecommerceLatestProducts,
} from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { MotivationIllustration } from 'src/assets/illustrations';
//
import EcommerceWelcome from '../ecommerce-welcome';
import EcommerceNewProducts from '../ecommerce-new-products';
import EcommerceYearlySales from '../ecommerce-yearly-sales';
import EcommerceBestSalesman from '../ecommerce-best-salesman';
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';
import EcommerceSalesOverview from '../ecommerce-sales-overview';
import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceLatestProducts from '../ecommerce-latest-products';
import EcommerceCurrentBalance from '../ecommerce-current-balance';
import PendingRequests from '../ecommerce-pending-trainer-request';
import { useAuthContext } from 'src/auth/hooks';
import { useGetAnalytics } from 'src/api/anlytics';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { user } = useAuthContext();

  const theme = useTheme();

  const settings = useSettingsContext();
  const { analytics } = useGetAnalytics({ year: '2024' });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <EcommerceWelcome
            title={`Congratulations! \n ${user?.user?.name}`}
            description="Let’s start as school and manage your drivers."
            // img={<MotivationIllustration />}
            // action={
            //   <Button variant="contained" color="primary">
            //     Go Now
            //   </Button>
            // }
          />
        </Grid>

        {/* <Grid xs={12} md={4}>
          <EcommerceNewProducts list={_ecommerceNewProducts} />
        </Grid> */}

        <Grid xs={12} md={4}>
          <EcommerceWidgetSummary
            title="Total Trainers"
            // percent={2.6}
            total={analytics?.trainerCount ?? '0'}
            // chart={{
            //   series: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
            // }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <EcommerceWidgetSummary
            title="Total Students"
            percent={-0.1}
            total={analytics?.studentCount ?? '0'}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <EcommerceWidgetSummary title="Total Bookings" total={analytics?.bookingsCount ?? '0'} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <EcommerceSaleByGender
            title="Trainers By Gender"
            total={2324}
            chart={{
              series: [
                { label: 'Mens', value: 44 },
                { label: 'Womens', value: 75 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <EcommerceYearlySales
            title="Yearly Revenue"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  year: '2019',
                  data: [
                    {
                      name: 'Total Income',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Total Expenses',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2020',
                  data: [
                    {
                      name: 'Total Income',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Total Expenses',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={8}>
          <EcommerceSalesOverview title="Sales Overview" data={_ecommerceSalesOverview} />
        </Grid> */}

        <Grid xs={12} md={12} lg={12}>
          <EcommerceBestSalesman
            title="Best Trainers"
            tableData={_ecommerceBestSalesman}
            tableLabels={[
              { id: 'name', label: 'Seller' },
              { id: 'category', label: 'Product' },
              { id: 'country', label: 'Country', align: 'center' },
              { id: 'totalAmount', label: 'Total', align: 'right' },
              { id: 'rank', label: 'Rank', align: 'right' },
            ]}
          />
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <PendingRequests />
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <EcommerceLatestProducts title="Trending Packages" list={_ecommerceLatestProducts} />
        </Grid>
      </Grid>
    </Container>
  );
}
