// @mui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { useMemo, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { useGetAnalytics, useGetRevenue, useGetStudentInsights } from 'src/api/anlytics';
import { Box, CircularProgress, Typography } from '@mui/material';
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
// import EcommerceBestSalesman from '../ecommerce-best-salesman';
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';
import EcommerceSalesOverview from '../ecommerce-sales-overview';
import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceLatestProducts from '../ecommerce-latest-products';
import EcommerceCurrentBalance from '../ecommerce-current-balance';
import PendingRequests from '../ecommerce-pending-trainer-request';

import HeatMap from '../ecommerce-heat-map';
// import TrainerMap from '../ecommerce-school-admin-map';
import SchoolAdminMap from '../ecommerce-school-admin-map';
import AnalyticsActiveUsers from '../analytics-active-users';
import EcommerceBestTrainer from '../ecommerce-best-salesman';
import BookingStatistics from '../ecommerce-statistics';
import { transformData } from '../helper-functions/transform-certificate-date';
import PaymentMethodRevenue from '../ecommerce-payment-method';
import EnrollmentTrendsChart from '../ecommerce-enrollment-trend';
import RevenueByPackagePieChart from '../ecommerce-revenue-by-package-pie-chart';
import TotalTrainersSession from '../ecommerce-total-session';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { user } = useAuthContext();
  const settings = useSettingsContext();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [applyClicked, setApplyClicked] = useState(false);

  const { analytics, analyticsLoading } = useGetAnalytics({
    startDate: applyClicked ? startDate : undefined,
    endDate: applyClicked ? endDate : undefined,
  });
  const theme = useTheme();
  const { revenue, revenueLoading, revalidateAnalytics, paymentMethods, revenueByPackage } =
    useGetRevenue();
  const [issuedCerificateSeriesData, setIssuedCertificateSeriesData] = useState('Yearly');
  const [sessionSeriesData, setSessionSeriesData] = useState('Yearly');
  const {
    studentInsights,
    studentInsightsError,
    studentInsightsLoading,
    revalidateStudentInsights,
  } = useGetStudentInsights();

  const chartData = {
    colors: ['#34C38F', '#FF7D1E'],
    series: [
      { label: 'Active Trainers', value: analytics.activeTrainers },
      { label: 'Inactive Trainers', value: analytics.inactiveTrainers },
    ],
    options: {
      labels: ['Active Trainers', 'Inactive Trainers'],
    },
  };

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
  const chartCompletedSessionData = transformData(
    monthlyCompletedSessions,
    yearlyCompletedSessions,
    weeklyCompletedSessions,
    sessionSeriesData
  );
  const transformedRevenueByPaymentMethodData = paymentMethods.map((item) => ({
    label: item.payment_method,
    value: parseFloat(item.total_amount),
  }));
  const chartConfigRevenueByPaymentMethodData = {
    colors: ['#7a4ec9', '#fb7c63', '#ffbe57', '#5dc7e1', '#59bb90'],
    series: transformedRevenueByPaymentMethodData,
    options: {},
  };
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
  const transformedDataRevenueByPackage = revenueByPackage.map((item) => ({
    label: item.package_name,
    value: parseFloat(item.total_revenue),
  }));

  const chartConfig = {
    colors: ['#008FFB', '#FF4560'],
    series: transformedDataRevenueByPackage,
    options: {},
  };

  const enrollmentChart = {
    colors: ['#ffab00', '#0da670'],
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
    // options: {
    //   chart: {
    //     type: 'area',
    //   },
  };
  const handleApply = () => {
    setApplyClicked(true);
  };
  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setApplyClicked(true);
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
            />
          </Grid>
          <Box
            sx={{
              padding: 4,
              borderRadius: 2,
            }}
          >
            {' '}
            <Typography variant="h6" align="center" gutterBottom>
              Analytics Filter
            </Typography>
            <Grid container spacing={3} justifyContent="center" alignItems="center">
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
                md={10}
                marginTop={1}
                marginBottom={2}
              >
                <Grid item>
                  <Box display="flex" justifyContent="flex-start">
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => {
                        setStartDate(newValue);
                        setApplyClicked(false);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                </Grid>
                <Grid item>
                  <Box display="flex" justifyContent="flex-start">
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => {
                        setEndDate(newValue);
                        setApplyClicked(false);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                </Grid>
                <Grid>
                  <Box display="flex" justifyContent="flex-start" gap={1}>
                    <Button variant="contained" color="primary" onClick={handleApply}>
                      Apply
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleClear}>
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* EcommerceWidgetSummary components in the next line */}
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(0, 204, 204, 0.1)"
                  textColor="rgba(0, 123, 255, 0.9)"
                  title="Total Revenue"
                  icon="mdi:account-cash"
                  total={analytics?.revenueGenerated ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  title="Total Trainers"
                  icon="eva:person-done-outline"
                  total={analytics?.trainerCount ?? '0'}
                  bgcolor="rgba(0, 123, 255, 0.1)"
                  textColor="rgba(0, 123, 255, 0.9)"
                  chart={{
                    colors: [theme.palette.info.light, theme.palette.info.main],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  title="Total Students"
                  icon="eva:person-fill"
                  bgcolor="rgba(40, 167, 69, 0.1)"
                  textColor="rgba(40, 167, 69, 0.9)"
                  total={analytics?.studentCount ?? '0'}
                  chart={{
                    colors: [theme.palette.info.light, theme.palette.info.main],
                    series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  icon="mdi:steering"
                  bgcolor="rgba(255, 193, 7, 0.1)"
                  textColor="rgba(220, 53, 69, 0.9)"
                  title="Total School"
                  total={analytics?.schoolCount ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(220, 53, 69, 0.1)"
                  title="Total Bookings"
                  icon="mdi:ticket"
                  textColor="rgba(255, 165, 0, 0.9)"
                  total={analytics?.bookingsCount ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(155, 89, 182, 0.1)"
                  textColor="rgba(138, 43, 226, 0.9)"
                  title="Confirmed Bookings"
                  icon="mdi:check-circle"
                  total={analytics?.confirmedBookingsCount ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(108, 117, 125, 0.1)"
                  textColor="rgba(108, 117, 125, 0.9)"
                  title="Cancelled Bookings"
                  icon="mdi:cancel-circle"
                  total={analytics?.canceledBookingsCount ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(0, 123, 255, 0.1)"
                  title="Pending Bookings"
                  icon="material-symbols:pending"
                  textColor="rgba(0, 123, 255, 0.9)"
                  total={analytics?.pendingBookingsCount ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(255, 165, 0, 0.1)"
                  textColor="rgba(255, 193, 7, 0.9)"
                  title="Completed Bookings"
                  icon="mdi:check-circle"
                  total={analytics?.completedBookingsCount ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(0, 204, 204, 0.1)"
                  textColor="rgba(0, 123, 255, 0.9)"
                  title="Refund Requests"
                  icon="mdi:cash-refund"
                  total={analytics?.refundReqs ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  title="Issued Certificates"
                  icon="mdi:file-certificate"
                  bgcolor="rgba(40, 167, 69, 0.1)"
                  textColor="rgba(40, 167, 69, 0.9)"
                  total={analytics?.issuedCertificates ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  title="Pending Certificates"
                  icon="mdi:seal"
                  total={analytics?.pendingCertificates ?? '0'}
                  bgcolor="rgba(0, 123, 255, 0.1)"
                  textColor="rgba(0, 123, 255, 0.9)"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  icon="mdi:calendar-check"
                  bgcolor="rgba(255, 193, 7, 0.1)"
                  textColor="rgba(220, 53, 69, 0.9)"
                  title="Rescheduled Booking Count"
                  total={analytics?.rescheduledBookingsCount ?? '0'}
                  percent={analytics?.rescheduledPercentage ?? 0}
                />
              </Grid>
            </Grid>
          </Box>
          <Grid item xs={12} md={6} lg={6}>
            <BookingStatistics
              title="Issued Certificates"
              chart={chartCertificateIssuedData}
              seriesData={issuedCerificateSeriesData}
              setSeriesData={setIssuedCertificateSeriesData}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <BookingStatistics
              title="Completed Session"
              chart={chartCompletedSessionData}
              seriesData={sessionSeriesData}
              setSeriesData={setSessionSeriesData}
            />
          </Grid>
          {user?.user?.user_type !== 'SCHOOL_ADMIN' ? (
            <Grid xs={12} md={12} lg={12}>
              <HeatMap />
            </Grid>
          ) : (
            <Grid xs={12} md={12} lg={12}>
              <SchoolAdminMap />
            </Grid>
          )}
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
            {' '}
            <EnrollmentTrendsChart
              title="Enrollment Trends"
              subheader="Overview of student enrollment trends"
              chart={enrollmentChart}
              enrollmentTrends={studentInsights.enrollmentTrends}
              enrollmentTrendsRegisteredStudents={
                studentInsights.enrollmentTrendsRegisteredStudents
              }
              enrollmentTrendsLoading={studentInsightsLoading}
              // enrollmentTrendsRegisteredStudentsLoading={studentInsightsRegisteredStudentsLoading}
              revalidateEnrollmentTrends={revalidateStudentInsights}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6}>
            <EcommerceYearlySales
              title="Yearly Revenue"
              revenue={revenue}
              revenueLoading={revenueLoading}
              revalidateAnalytics={revalidateAnalytics}
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
          <Grid xs={12} md={6} lg={6}>
            <PaymentMethodRevenue
              title="Payment Methods Revenue"
              subheader="Overview of payment method usage"
              chart={chartConfigRevenueByPaymentMethodData}
            />
          </Grid>
          <Grid xs={12} md={6} lg={8}>
            <TotalTrainersSession />
          </Grid>

          <Grid xs={12} md={6} lg={4}>
            {' '}
            <RevenueByPackagePieChart
              title="Revenue by Package"
              subheader="Overview of revenue distribution by package"
              chart={chartConfig}
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
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
