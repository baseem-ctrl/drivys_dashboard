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
import { Box, CircularProgress } from '@mui/material';
import HeatMap from '../ecommerce-heat-map';
import TrainerMap from '../ecommerce-tainer-map';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { user } = useAuthContext();

  const theme = useTheme();

  const settings = useSettingsContext();
  const { analytics, analyticsLoading } = useGetAnalytics();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {user?.user?.user_type && !analyticsLoading ? (
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
              chart={{
                colors: [theme.palette.info.light, theme.palette.info.main],
              }}
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
            <EcommerceWidgetSummary
              title="Sales Profit"
              percent={0.6}
              total={4876}
              chart={{
                colors: [theme.palette.warning.light, theme.palette.warning.main],
                series: [40, 70, 75, 70, 50, 28, 7, 64, 38, 27],
              }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <EcommerceWidgetSummary
              title="Total Bookings"
              total={analytics?.bookingsCount ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <EcommerceWidgetSummary
              title="Confirmed Bookings"
              total={analytics?.bookingsCount ?? '0'}
            />
          </Grid>{' '}
          <Grid xs={12} md={4}>
            <EcommerceWidgetSummary
              title="Cancelled Bookings"
              total={analytics?.bookingsCount ?? '0'}
            />
          </Grid>
          {/* <Grid xs={12} md={6} lg={6}>
            <TrainerMap />
          </Grid> */}
          <Grid xs={12} md={12} lg={12}>
            <HeatMap />
          </Grid>
          <Grid xs={12} md={6} lg={4}>
            <EcommerceSaleByGender
              title="Trainers By Gender"
              total={analytics?.trainerCount ?? 0}
              chart={{
                series: [
                  { label: 'Mens', value: analytics?.maleTrainers?.length ?? 0 },
                  { label: 'Womens', value: analytics?.femaleTrainers?.length ?? 0 },
                  {
                    label: 'Other',
                    value:
                      Number(analytics?.trainerCount) -
                        (Number(analytics?.femaleTrainers?.length) +
                          Number(analytics?.maleTrainers?.length)) ?? 0,
                  },
                ],
              }}
            />
          </Grid>
          <Grid xs={12} md={6} lg={8}>
            <EcommerceYearlySales
              title="Yearly Revenue"
              // subheader="(+43%) than last year"
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
              }}
            />
          </Grid>
          {/* <Grid xs={12} md={6} lg={8}>
          <EcommerceSalesOverview title="Sales Overview" data={_ecommerceSalesOverview} />
        </Grid> */}
          <Grid xs={12} md={12} lg={12}>
            <EcommerceBestSalesman
              title="Top Trending Trainers"
              tableData={analytics?.topTrendingTrainers}
              tableLabels={[
                { id: 'name', label: 'Name' },
                { id: 'email', label: 'Email' },
                { id: 'total_bookings', label: 'Total Bookings' },
              ]}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6}>
            <EcommerceLatestProducts title="Top Packages" list={analytics?.mostBookedPackages} />
          </Grid>
          <Grid xs={12} md={6} lg={6}>
            <PendingRequests />
          </Grid>
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh', // Full viewport height
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
