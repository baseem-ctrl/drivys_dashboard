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
import { useGetAnalytics, useGetRevenue } from 'src/api/anlytics';
import { Box, CircularProgress } from '@mui/material';
import HeatMap from '../ecommerce-heat-map';
import TrainerMap from '../ecommerce-school-admin-map';
import SchoolAdminMap from '../ecommerce-school-admin-map';
import EcommerceBestTrainer from '../ecommerce-best-salesman';
import BookingStatistics from '../ecommerce-statistics';
import { transformData } from '../helper-functions/transform-certificate-date';
import { useState } from 'react';
import AnalyticsActiveUsers from '../analytics-active-users';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { user } = useAuthContext();

  const theme = useTheme();
  const { revenue, revenueLoading, revalidateAnalytics } = useGetRevenue();
  const [issuedCerificateSeriesData, setIssuedCertificateSeriesData] = useState('Yearly');
  const [sessionSeriesData, setSessionSeriesData] = useState('Yearly');

  const settings = useSettingsContext();
  const { analytics, analyticsLoading } = useGetAnalytics();
  const monthlyIssuedCertificates = analytics?.monthlyIssuedCertificates || [];
  const yearlyIssuedCertificates = analytics?.yearlyIssuedCertificates || [];
  const weeklyIssuedCertificates = analytics?.weeklyIssuedCertificates || [];
  const monthlyCompletedSessions = analytics?.monthlyCompletedSessions || [];
  const yearlyCompletedSessions = analytics?.yearlyCompletedSessions || [];
  const weeklyCompletedSessions = analytics?.weeklyCompletedSessions || [];

  const chartCertificateIssuedData = transformData(
    monthlyIssuedCertificates,
    yearlyIssuedCertificates,
    weeklyIssuedCertificates,
    issuedCerificateSeriesData
  );
  console.log('yearlyCompletedSessions', yearlyCompletedSessions);
  const chartCompletedSessionData = transformData(
    monthlyCompletedSessions,
    yearlyCompletedSessions,
    weeklyCompletedSessions,
    sessionSeriesData
  );

  const trainerChartData = {
    colors: ['#34C38F', '#FF7D1E'],
    series: [
      { label: 'Active Trainers', value: analytics.activeTrainers },
      { label: 'Inactive Trainers', value: analytics.inactiveTrainers },
    ],
    options: {
      labels: ['Active Trainers', 'Inactive Trainers'],
    },
  };
  const studentChartData = {
    colors: ['#FF6F61', '#6B5B95'],

    series: [
      { label: 'Active Trainers', value: analytics.activeStudents },
      { label: 'Inactive Trainers', value: analytics.inactiveStudents },
    ],
    options: {
      labels: ['Active Trainers', 'Inactive Trainers'],
    },
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {user?.user?.user_type && !analyticsLoading ? (
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <EcommerceWelcome
              title={`Congratulations! \n ${user?.user?.name}`}
              description={
                user?.user?.user_type === 'SCHOOL_ADMIN'
                  ? 'Let’s start as school and manage your drivers.'
                  : 'Effortlessly manage users, schools, and operations with full control.'
              }
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
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              bgcolor="rgba(0, 204, 204, 0.1)"
              textColor="rgba(0, 123, 255, 0.9)"
              title="Total Revenue"
              percent={revenue?.earningsPercentChange}
              icon="mdi:account-cash"
              total={analytics?.revenueGenerated ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              title="Total Trainers"
              icon="eva:person-done-outline"
              // percent={2.6}
              total={analytics?.trainerCount ?? '0'}
              bgcolor="rgba(0, 123, 255, 0.1)"
              textColor="rgba(0, 123, 255, 0.9)"
              chart={{
                colors: [theme.palette.info.light, theme.palette.info.main],
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              title="Total Students"
              icon="eva:person-fill"
              bgcolor="rgba(40, 167, 69, 0.1)"
              textColor="rgba(40, 167, 69, 0.9)"
              // percent={-0.1}
              total={analytics?.studentCount ?? '0'}
              chart={{
                colors: [theme.palette.info.light, theme.palette.info.main],
                series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              icon="mdi:steering"
              bgcolor="rgba(255, 193, 7, 0.1)"
              textColor="rgba(220, 53, 69, 0.9)"
              title="Total School"
              total={analytics?.schoolCount ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              bgcolor="rgba(220, 53, 69, 0.1)"
              title="Total Bookings"
              icon="mdi:ticket"
              textColor="rgba(255, 165, 0, 0.9)"
              total={analytics?.bookingsCount ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              bgcolor="rgba(155, 89, 182, 0.1)"
              textColor="rgba(138, 43, 226, 0.9)"
              title="Confirmed Bookings"
              icon="mdi:check-circle"
              total={analytics?.confirmedBookingsCount ?? '0'}
            />
          </Grid>{' '}
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              bgcolor="rgba(108, 117, 125, 0.1)"
              textColor="rgba(108, 117, 125, 0.9)"
              title="Cancelled Bookings"
              icon="mdi:cancel-circle"
              total={analytics?.canceledBookingsCount ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              bgcolor="rgba(0, 123, 255, 0.1)"
              title="Pending Bookings"
              icon="material-symbols:pending"
              textColor="rgba(0, 123, 255, 0.9)"
              total={analytics?.pendingBookingsCount ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              bgcolor="rgba(255, 165, 0, 0.1)"
              textColor="rgba(255, 193, 7, 0.9)"
              title="Completed Bookings"
              icon="mdi:check-circle"
              total={analytics?.completedBookingsCount ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              bgcolor="rgba(0, 204, 204, 0.1)"
              textColor="rgba(0, 123, 255, 0.9)"
              title="Refund Requests"
              icon="mdi:cash-refund"
              total={analytics?.refundReqs ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              title="Issued Certificates"
              icon="mdi:file-certificate"
              bgcolor="rgba(40, 167, 69, 0.1)"
              textColor="rgba(40, 167, 69, 0.9)"
              total={analytics?.issuedCertificates ?? '0'}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              title="Pending Certificates"
              icon="mdi:seal"
              // percent={2.6}
              total={analytics?.pendingCertificates ?? '0'}
              bgcolor="rgba(0, 123, 255, 0.1)"
              textColor="rgba(0, 123, 255, 0.9)"
            />
          </Grid>
          <Grid xs={12} md={3}>
            <EcommerceWidgetSummary
              icon="mdi:calendar-check"
              bgcolor="rgba(255, 193, 7, 0.1)"
              textColor="rgba(220, 53, 69, 0.9)"
              title="Rescheduled Booking Count"
              total={analytics?.rescheduledBookingsCount ?? '0'}
              percent={analytics?.rescheduledPercentage ?? 0}
            />
          </Grid>
          {/* <Grid xs={12} md={6} lg={6}>
            <TrainerMap />
          </Grid> */}
          {user?.user?.user_type !== 'SCHOOL_ADMIN' ? (
            <Grid xs={12} md={12} lg={12}>
              <HeatMap />
            </Grid>
          ) : (
            <Grid xs={12} md={12} lg={12}>
              <SchoolAdminMap />
            </Grid>
          )}
          <Grid xs={12} md={6} lg={6}>
            {' '}
            <BookingStatistics
              title="Issued Certificates"
              chart={chartCertificateIssuedData}
              seriesData={issuedCerificateSeriesData}
              setSeriesData={setIssuedCertificateSeriesData}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6}>
            {' '}
            <BookingStatistics
              title="Completed Session"
              chart={chartCompletedSessionData}
              seriesData={sessionSeriesData}
              setSeriesData={setSessionSeriesData}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4}>
            <AnalyticsActiveUsers
              title="Trainer Analytics"
              subheader={`Total Trainers: ${analytics.trainerCount}`}
              chart={trainerChartData}
            />
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
          <Grid xs={12} md={6} lg={4}>
            <AnalyticsActiveUsers
              title="Student Analytics"
              subheader={`Total Students: ${analytics?.studentCount}`}
              chart={studentChartData}
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
          <Grid xs={12} md={6} lg={6}>
            <EcommerceBestTrainer title="Top Trainers" list={analytics?.topTrendingTrainers} />
          </Grid>
          <Grid xs={12} md={6} lg={6}>
            <EcommerceLatestProducts title="Top Packages" list={analytics?.mostBookedPackages} />
          </Grid>
          <Grid xs={12} md={12} lg={6}>
            <PendingRequests height={'400px'} />
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
