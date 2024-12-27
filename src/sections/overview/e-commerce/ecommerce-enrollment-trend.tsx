import { ApexOptions } from 'apexcharts';
import { useState, useCallback, useEffect } from 'react';
// @mui
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
// components
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { DatePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    categories?: string[];
    colors?: string[];
    options?: ApexOptions;
  };
  enrollmentTrends: any[];
  enrollmentTrendsRegisteredStudents: any[];
  enrollmentTrendsLoading: boolean;
  enrollmentTrendsRegisteredStudentsLoading: boolean;
  revalidateEnrollmentTrends: () => void;
}

export default function EnrollmentTrendsChart({
  title,
  subheader,
  chart,
  enrollmentTrends,
  enrollmentTrendsRegisteredStudents,
  enrollmentTrendsLoading,
  enrollmentTrendsRegisteredStudentsLoading,
  revalidateEnrollmentTrends,
  ...other
}: Props) {
  const { colors, categories, options } = chart;
  const popover = usePopover();
  const [seriesData, setSeriesData] = useState('2024');
  const [chartData, setChartData] = useState({
    series: [],
  });

  const chartOptions = useChart({
    colors,
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    xaxis: {
      categories: categories || [
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
    },
    chart: {
      type: 'bar',
    },
    ...options,
  });

  useEffect(() => {
    if (
      enrollmentTrends &&
      enrollmentTrendsRegisteredStudents &&
      !enrollmentTrendsLoading &&
      !enrollmentTrendsRegisteredStudentsLoading
    ) {
      const enrollmentData = transformEnrollmentData(enrollmentTrends, seriesData);
      const registeredStudentsData = transformEnrollmentData(
        enrollmentTrendsRegisteredStudents,
        seriesData
      );
      setChartData({
        series: [
          {
            name: 'Students with Bookings',
            data: enrollmentData,
          },
          {
            name: 'Registered Students ',
            data: registeredStudentsData,
          },
        ],
      });
    }
  }, [
    enrollmentTrends,
    enrollmentTrendsRegisteredStudents,
    enrollmentTrendsLoading,
    enrollmentTrendsRegisteredStudentsLoading,
    seriesData,
  ]);

  function transformEnrollmentData(data, seriesData) {
    const currentYearData = Array(12).fill(0);

    data.forEach((item) => {
      if (item.year.toString() === seriesData) {
        const monthIndex = item.month - 1;
        currentYearData[monthIndex] = item.total_students;
      }
    });

    return currentYearData;
  }

  const handleYearChange = useCallback(
    (newDate: any) => {
      const selectedYear = newDate?.getFullYear().toString();
      if (selectedYear) {
        setSeriesData(selectedYear);
        popover.onClose();
        revalidateEnrollmentTrends();
      }
    },
    [popover]
  );

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          subheader={subheader}
          action={
            <ButtonBase
              onClick={popover.onOpen}
              sx={{
                pl: 1,
                py: 0.5,
                pr: 0.5,
                borderRadius: 1,
                typography: 'subtitle2',
                bgcolor: 'background.neutral',
              }}
            >
              {seriesData}

              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
        />

        {chartData?.series.length > 0 ? (
          <Box sx={{ mt: 3, mx: 3 }}>
            <Chart
              dir="ltr"
              type="area"
              series={chartData.series}
              options={chartOptions}
              height={364}
            />
          </Box>
        ) : (
          <Box>No enrollment data found</Box>
        )}
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        <DatePicker
          views={['year']}
          value={new Date(seriesData)}
          onChange={handleYearChange}
          renderInput={(params) => <MenuItem {...params} />}
        />
      </CustomPopover>
    </>
  );
}
