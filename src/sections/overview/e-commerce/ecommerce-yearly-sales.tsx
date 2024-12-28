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
}
export default function EcommerceYearlySales({
  title,
  subheader,
  chart,
  revenue,
  revenueLoading,
  revalidateAnalytics,
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
    },
    // ...options,
  });
  useEffect(() => {
    if (revenue && !revenueLoading) {
      const transformedData = transformRevenueData(revenue, seriesData);
      setChartData({ series: transformedData });
    }
  }, [revenue, revenueLoading, seriesData]);
  function transformRevenueData(revenue, seriesData) {
    const currentYearData =
      revenue && Array.isArray(revenue.currentYear)
        ? revenue.currentYear.map((item) => Object.values(item)[0])
        : [];

    const lastYear = (parseInt(seriesData) - 1).toString();
    const lastYearData =
      revenue && Array.isArray(revenue.lastYear)
        ? revenue.lastYear.map((item) => Object.values(item)[0])
        : [];
    return [
      {
        year: seriesData,
        data: [
          {
            name: 'Current Year Revenue',
            data: currentYearData,
          },
          {
            name: 'Last Revenue',
            data: lastYearData.map(() => 0), // Placeholder for expenses
          },
        ],
      },
    ];
  }

  const handleYearChange = useCallback(
    (newDate: any) => {
      const selectedYear = newDate?.getFullYear().toString();
      if (selectedYear) {
        setSeriesData(selectedYear);
        popover.onClose();
        revalidateAnalytics(selectedYear);
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

        {chartData?.series ? (
          chartData?.series.map((item) => (
            <Box key={item?.year} sx={{ mt: 3, mx: 3 }}>
              {item?.year === seriesData && (
                <Chart
                  dir="ltr"
                  type="area"
                  series={item.data}
                  options={chartOptions}
                  height={364}
                />
              )}
            </Box>
          ))
        ) : (
          <Box>No revenue data found</Box>
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
