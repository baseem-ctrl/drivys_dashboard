// @mui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { enUS } from 'date-fns/locale';
import { useEffect, useMemo, useRef, useState } from 'react';
import './CustomDateRangePicker.css';
import Iconify from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import {
  useGetAnalytics,
  useGetRevenue,
  useGetStudentInsights,
  useGetTrainerInsights,
} from 'src/api/anlytics';
import {
  Autocomplete,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useLocales } from 'src/locales';

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
// import PieChartComponent from '../ecommerce-pie-chart';
import AnalyticsActiveUsers from '../analytics-active-users';
import EcommerceBestTrainer from '../ecommerce-best-salesman';
import BookingStatistics from '../ecommerce-statistics';
import { transformData } from '../helper-functions/transform-certificate-date';
import PaymentMethodRevenue from '../ecommerce-payment-method';
import EnrollmentTrendsChart from '../ecommerce-enrollment-trend';
import RevenueByPackagePieChart from '../ecommerce-revenue-by-package-pie-chart';
import TotalTrainersSession from '../ecommerce-total-session';
import ReviewedTrainer from '../ecomerce-reviewed-trainers';
import AnalyticsWidgetSummary from '../ecommerce-analytics-widget_summary';
import { AnalyticsConversionRates } from '../ecommerce-student-demographics';
import SessionOverview from '../ecommerce-session-overview';

import SchoolPerformanceDetails from '../ecommerce-school-performance';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { useGetAllCity } from 'src/api/city';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { t } = useLocales();

  const { user } = useAuthContext();
  const settings = useSettingsContext();

  const [startDate, setStartDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const handleSelect = (ranges: any) => {
    setSelectionRange(ranges.selection);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  const [endDate, setEndDate] = useState(null);
  const [applyClicked, setApplyClicked] = useState(false);
  const [filters, setFilters] = useState({ city_id: null });
  const { analytics, analyticsLoading } = useGetAnalytics({
    startDate: applyClicked ? startDate : undefined,
    endDate: applyClicked ? endDate : undefined,
    city_id: filters.city_id,
  });

  const { city, cityLoading } = useGetAllCity({
    limit: 1000,
    page: 0,
  });
  const theme = useTheme();
  const { revenue, revenueLoading, revalidateAnalytics, paymentMethods, revenueByPackage } =
    useGetRevenue({
      start_date: applyClicked ? startDate : undefined,
      end_date: applyClicked ? endDate : undefined,
      city_id: filters.city_id,
    });

  const { trainerInsights, trainerInsightsLoading } = useGetTrainerInsights({
    start_date: applyClicked ? startDate : undefined,
    end_date: applyClicked ? endDate : undefined,
    city_id: filters.city_id,
  });
  const sessionsData = trainerInsights?.sessionsPerTrainer;
  const totalSessions = sessionsData?.reduce(
    (sum, trainer) =>
      sum + trainer.sessions.reduce((trainerSum, session) => trainerSum + session.session_count, 0),
    0
  );
  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };
  const formattedSessionData = sessionsData?.map((trainer) => {
    const trainerTotalSessions = trainer?.sessions?.reduce(
      (trainerSum, session) => trainerSum + session.session_count,
      0
    );

    return {
      label: trainer.trainer_name,
      value: (trainerTotalSessions / totalSessions) * 100,
      totalAmount: trainerTotalSessions,
    };
  });

  const [issuedCerificateSeriesData, setIssuedCertificateSeriesData] = useState('Yearly');
  const [sessionSeriesData, setSessionSeriesData] = useState('Yearly');

  const {
    studentInsights,
    studentInsightsError,
    studentInsightsLoading,
    revalidateStudentInsights,
  } = useGetStudentInsights({
    start_date: applyClicked ? startDate : undefined,
    end_date: applyClicked ? endDate : undefined,
    city_id: filters.city_id,
  });

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
  const chartBookingData = {
    colors: ['#28a745', '#fd7e14', '#dc3545'],
    series: [
      { label: t('completed'), value: analytics.completedBookingsCount },
      { label: t('pending'), value: analytics.pendingBookingsCount },
      { label: t('canceled'), value: analytics.canceledBookingsCount },
    ],
    options: {
      labels: [t('completed'), t('pending'), t('canceled')],
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
  const transformedDataBooking = revenueByPackage.map((item) => ({
    label: item.package_name,
    value: parseFloat(item.total_revenue),
  }));
  const transformedRevenueByPaymentMethodData = paymentMethods?.map((item) => ({
    label: item?.payment_method,
    value: parseFloat(item?.total_amount),
  }));
  const chartConfigRevenueByPaymentMethodData = {
    colors: ['#7a4ec9', '#fb7c63', '#ffbe57', '#5dc7e1', '#59bb90'],
    series: transformedRevenueByPaymentMethodData,
    options: {},
  };
  const trainerChartData = {
    colors: ['#34C38F', '#FF7D1E'],
    series: [
      {
        label: t('active_trainers'),
        value: analytics?.activeTrainers || trainerInsights?.activeTrainers || 0,
      },
      {
        label: t('inactive_trainers'),
        value: analytics?.inactiveTrainers || trainerInsights?.inactiveTrainers || 0,
      },
    ],
    options: {
      labels: [t('active_trainers'), t('inactive_trainers')],
    },
  };

  const studentChartData = {
    colors: ['#FF6F61', '#6B5B95'],
    series: [
      { label: t('active_students'), value: analytics.activeStudents || 0 },
      { label: t('inactive_students'), value: analytics.inactiveStudents || 0 },
    ],
    options: {
      labels: [t('active_students'), t('inactive_students')],
    },
  };

  const transformedDataRevenueByPackage = revenueByPackage.map((item) => ({
    label: item.package_name,
    value: parseFloat(item.total_revenue),
  }));
  const categories = studentInsights?.studentsDemographics
    ? Object.keys(studentInsights.studentsDemographics)
    : [];

  const series = categories.map((category) => {
    const dataWithLabels = Object.entries(studentInsights.studentsDemographics[category]).map(
      ([label, value]) => ({
        label,
        data: value,
      })
    );

    return {
      name: category,
      data: dataWithLabels,
    };
  });
  const alignedSeries = categories.map((category, index) => {
    return {
      name: category,
      data: series.map((item) => {
        const labelData = item.data[index] || { label: 'N/A', data: 0 };
        return labelData;
      }),
    };
  });

  const chartConfigBooking = {
    colors: ['#008FFB', '#FF4560'],
    series: transformedDataBooking,
    options: {},
  };
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
    setStartDate(selectionRange?.startDate);
    setEndDate(selectionRange?.endDate);

    setApplyClicked(true);
  };
  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setApplyClicked(true);

    setFilters({
      city_id: null,
    });
  };

  const tableLabels = [
    { id: 'school_name', label: t('school_name') },
    { id: 'revenue', label: t('revenue') },
    { id: 'bookings', label: t('bookings') },
    { id: 'trainer_ratings', label: t('trainer_ratings') },
  ];

  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {user?.user?.user_type && !analyticsLoading ? (
        // <Grid container spacing={3}>

        <Grid container spacing={3}>
          {/* <EcommerceWelcome
              title={`Congratulations! \n ${user?.user?.name}`}
              description={
                user?.user?.user_type === 'SCHOOL_ADMIN'
                  ? 'Let’s start as school and manage your drivers.'
                  : 'Effortlessly manage users, schools, and operations with full control.'
              }
            /> */}
          {/* </Grid> */}
          <Grid item xs={12} sm={8} md={12}>
            {' '}
            <Typography
              variant="h4"
              sx={{
                mb: { xs: 2, md: 1 },
              }}
            >
              {t('hi_welcome_back')} 👋
            </Typography>
          </Grid>
          <Grid container item xs={12} sm={12} md={12}>
            {' '}
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title={t('total_revenue')}
                color="success"
                percentageChange={revenue?.earningsPercentChange}
                total={analytics?.revenueGenerated}
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title={t('total_booking')}
                total={analytics?.bookingsCount}
                color="info"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title={t('in_progress_booking')}
                total={analytics?.pendingBookingsCount}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title={t('issued_certificates')}
                total={analytics?.issuedCertificates}
                color="error"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              padding: 4,
              borderRadius: 2,
            }}
          >
            {' '}
            <Typography variant="h6" align="center" gutterBottom>
              {t('analytics_filter')}
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
                {showDatePicker && (
                  <Box
                    ref={datePickerRef}
                    sx={{
                      position: 'absolute',
                      top: '500px',
                      zIndex: 1000,
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                      padding: '16px',
                    }}
                  >
                    <DateRangePicker
                      ranges={[selectionRange]}
                      onChange={handleSelect}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      locale={enUS}
                      months={2} // Show two months side by side
                      direction="horizontal"
                    />
                  </Box>
                )}
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    options={
                      city?.map((item: any) => ({
                        label: item.city_translations
                          .map((translation: any) => translation.name)
                          .join(' - '),
                        value: item.id,
                      })) ?? []
                    }
                    getOptionLabel={(option) => option.label}
                    value={
                      city
                        ?.map((item: any) => ({
                          label: item.city_translations
                            .map((translation: any) => translation.name)
                            .join(' - '),
                          value: item.id,
                        }))
                        .find((option: any) => option.value === filters.city_id) || null
                    }
                    onChange={(event, newValue) => {
                      handleFilterChange('city_id', newValue ? newValue.value : null);
                    }}
                    renderInput={(params) => (
                      <TextField placeholder={t('select_city')} {...params} />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.value}>
                        {option.label}
                      </li>
                    )}
                    renderTags={(selected, getTagProps) =>
                      selected.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.value}
                          label={option.label}
                          size="small"
                          variant="soft"
                        />
                      ))
                    }
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={3}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={toggleDatePicker}
                    startIcon={<CalendarMonthIcon />}
                    sx={{
                      backgroundColor: 'transparent',
                      color: '#CF5A0D',
                      border: '1px solid #ccc',

                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                        borderColor: '#aaa',
                      },
                    }}
                  >
                    {t('select_date')}
                  </Button>
                </Grid>

                <Grid>
                  <Box display="flex" justifyContent="flex-start" gap={1}>
                    <Button variant="contained" color="primary" onClick={handleApply}>
                      {t('apply')}
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleClear}>
                      {t('clear')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* EcommerceWidgetSummary components in the next line */}
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  title={t('total_trainers')}
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
                  title={t('total_students')}
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
              {user?.user?.user_type !== 'SCHOOL_ADMIN' && (
                <Grid item xs={12} md={3}>
                  <EcommerceWidgetSummary
                    icon="mdi:steering"
                    bgcolor="rgba(255, 193, 7, 0.1)"
                    textColor="rgba(220, 53, 69, 0.9)"
                    title={t('total_school')}
                    total={analytics?.schoolCount ?? '0'}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(155, 89, 182, 0.1)"
                  textColor="rgba(138, 43, 226, 0.9)"
                  title={t('confirmed_bookings')}
                  icon="mdi:check-circle"
                  total={analytics?.confirmedBookingsCount ?? '0'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(255, 0, 0, 0.1)"
                  textColor="rgba(255, 0, 0, 0.9)"
                  title={t('failed_transactions')}
                  icon="mdi:close-circle"
                  total={analytics?.failedTransactions ?? '0'}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(108, 117, 125, 0.1)"
                  textColor="rgba(108, 117, 125, 0.9)"
                  title={t('cancelled_bookings')}
                  icon="mdi:cancel-circle"
                  total={analytics?.canceledBookingsCount ?? '0'}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  bgcolor="rgba(255, 165, 0, 0.1)"
                  textColor="rgba(255, 193, 7, 0.9)"
                  title={t('completed_bookings')}
                  icon="mdi:check-circle"
                  total={analytics?.completedBookingsCount ?? '0'}
                />
              </Grid>
              {user?.user?.user_type !== 'SCHOOL_ADMIN' && (
                <Grid item xs={12} md={3}>
                  <EcommerceWidgetSummary
                    bgcolor="rgba(0, 204, 204, 0.1)"
                    textColor="rgba(0, 123, 255, 0.9)"
                    title={t('refund_requests')}
                    icon="mdi:cash-refund"
                    total={analytics?.refundReqs ?? '0'}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={3}>
                <EcommerceWidgetSummary
                  title={t('pending_certificates')}
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
                  title={t('rescheduled_booking_count')}
                  total={analytics?.rescheduledBookingsCount ?? '0'}
                  percent={analytics?.rescheduledPercentage ?? '0'}
                />
              </Grid>
            </Grid>
          </Box>
          {user?.user?.user_type === 'ADMIN' && (
            <Grid xs={12} md={12} lg={12}>
              <HeatMap />
            </Grid>
          )}
          {/* <Grid xs={12} md={12} lg={12}>
              <SchoolAdminMap />
           </Grid> */}
          {analytics?.trainerCount > 0 &&
          trainerInsights &&
          trainerInsights?.activeTrainers !== null &&
          trainerInsights.inactiveTrainers !== null ? (
            <Grid xs={12} md={6} lg={4}>
              <AnalyticsActiveUsers
                title={t('trainer_analytics')}
                subheader={`${t('total_trainers')}: ${analytics?.trainerCount || 0}`}
                chart={trainerChartData}
              />
            </Grid>
          ) : (
            <Grid
              xs={12}
              md={6}
              lg={4}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Box sx={{ padding: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" color="textSecondary">
                  {t('no_trainers_available')}{' '}
                </Typography>
              </Box>
            </Grid>
          )}
          {trainerInsights?.maleTrainers &&
            trainerInsights?.femaleTrainers &&
            analytics?.trainerCount && (
              <Grid xs={12} md={6} lg={4}>
                <EcommerceSaleByGender
                  title={t('trainers_by_gender')}
                  total={analytics?.trainerCount ?? 0}
                  chart={{
                    series: [
                      {
                        label: t('male_trainers'),
                        value: trainerInsights?.maleTrainers?.length ?? 0,
                      },
                      {
                        label: t('female_trainers'),
                        value: trainerInsights?.femaleTrainers?.length ?? 0,
                      },
                      {
                        label: t('gender_not_specified'),
                        value:
                          Number(analytics?.trainerCount) -
                            (Number(trainerInsights?.femaleTrainers?.length) +
                              Number(trainerInsights?.maleTrainers?.length)) ?? 0,
                      },
                    ],
                  }}
                />
              </Grid>
            )}
          {analytics?.studentCount > 0 && analytics.activeStudents ? (
            <Grid xs={12} md={6} lg={4}>
              <AnalyticsActiveUsers
                title={t('student_analytics')}
                subheader={`${t('total_students')}: ${analytics?.studentCount || 0}`}
                chart={studentChartData}
              />
            </Grid>
          ) : (
            <Grid
              xs={12}
              md={6}
              lg={4}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Box sx={{ padding: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" color="textSecondary">
                  {t('no_students_available')}
                </Typography>
              </Box>
            </Grid>
          )}

          {user?.user?.user_type !== 'SCHOOL_ADMIN' && (
            <Grid xs={12} md={6} lg={6}>
              <SchoolPerformanceDetails
                title={t('school_performance')}
                subheader={t('school_performance_subheader')}
                tableLabels={tableLabels}
                tableData={analytics?.schoolsPerformance}
              />
            </Grid>
          )}

          {user?.user?.user_type !== 'SCHOOL_ADMIN' &&
            studentInsights.enrollmentTrends &&
            studentInsights.enrollmentTrendsRegisteredStudents && (
              <Grid xs={12} md={6} lg={6}>
                <EnrollmentTrendsChart
                  title={t('enrollment_trends')}
                  subheader={t('enrollment_trends_subheader')}
                  chart={enrollmentChart}
                  enrollmentTrends={studentInsights.enrollmentTrends}
                  enrollmentTrendsRegisteredStudents={
                    studentInsights.enrollmentTrendsRegisteredStudents
                  }
                  enrollmentTrendsLoading={studentInsightsLoading}
                  revalidateEnrollmentTrends={revalidateStudentInsights}
                />
              </Grid>
            )}

          <Grid item xs={12} md={12} lg={12}>
            <AnalyticsConversionRates
              title={t('student_categories_preferences')}
              subheader={t('student_categories_preferences_subheader')}
              chart={{
                categories: categories,
                series: alignedSeries,
                colors: ['#067b6c', '#9dc4be', '#067b6c'],
              }}
            />
          </Grid>

          <Grid xs={12} md={6} lg={6}>
            <ReviewedTrainer
              title={t('trainer_feedback')}
              subheader={t('trainer_feedback_subheader')}
              feedbackList={trainerInsights?.sessionFeedback}
            />
          </Grid>

          {/* <Grid xs={12} md={12} lg={12}>
            {' '}
            <SessionOverview
              title="Trainer Sessions Overview"
              subheader="Session distribution"
              data={formattedSessionData}
            />
          </Grid> */}

          <Grid xs={12} md={6} lg={6}>
            <RevenueByPackagePieChart
              title={t('revenue_by_package')}
              subheader={t('revenue_by_package_subheader')}
              chart={chartConfig}
            />
          </Grid>

          <Grid xs={12} md={6} lg={6}>
            <PaymentMethodRevenue
              title={t('payment_methods_revenue')}
              subheader={t('payment_methods_revenue_subheader')}
              chart={chartConfigRevenueByPaymentMethodData}
            />
          </Grid>

          <Grid xs={12} md={6} lg={6}>
            <Grid xs={12} md={6} lg={6}>
              <AnalyticsActiveUsers
                title={t('booking_analytics')}
                subheader={t('booking_analytics_subheader', {
                  count: analytics?.bookingsCount ?? 0,
                })}
                chart={chartBookingData}
                sx={{ height: 488 }}
              />
            </Grid>
          </Grid>
          {/* {trainerInsights?.sessionFeedback?.length > 0 && ( */}
          {/* )} */}
          <Grid xs={12} md={6} lg={8}>
            <TotalTrainersSession
              title={t('trainer_session')}
              subheader={t('trainer_session_subheader')}
            />
          </Grid>

          {/* <Grid xs={12} md={6} lg={8}>
            <EcommerceSalesOverview title="Sales Overview" data={_ecommerceSalesOverview} />
          </Grid> */}
          <Grid xs={12} md={6} lg={4}>
            <EcommerceBestTrainer title={t('top_trainers')} list={analytics?.topTrendingTrainers} />
          </Grid>
          <Grid xs={12} md={6} lg={12}>
            <EcommerceYearlySales
              title={t('yearly_revenue')}
              revenue={revenue}
              revenueLoading={revenueLoading}
              revalidateAnalytics={revalidateAnalytics}
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
            <EcommerceLatestProducts
              title={t('top_packages')}
              list={analytics?.mostBookedPackages}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6}>
            <PendingRequests height={'394px'} />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <BookingStatistics
              title={t('issued_certificates')}
              chart={chartCertificateIssuedData}
              seriesData={issuedCerificateSeriesData}
              setSeriesData={setIssuedCertificateSeriesData}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <BookingStatistics
              title={t('completed_session')}
              chart={chartCompletedSessionData}
              seriesData={sessionSeriesData}
              setSeriesData={setSessionSeriesData}
            />
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
