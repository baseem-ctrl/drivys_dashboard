import { ApexOptions } from 'apexcharts';
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
// components
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    categories?: string[];
    colors?: string[];
    series: {
      type: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ApexOptions;
  };
}

const getWeekDateRange = (month, week) => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, month - 1, 1);

  const startOfWeek = new Date(startDate);
  startOfWeek.setDate(startDate.getDate() + (week - 1) * 7);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startDateString = `${startOfWeek.getDate()}/${
    startOfWeek.getMonth() + 1
  }/${currentYear.toString()}`;
  const endDateString = `${endOfWeek.getDate()}/${
    endOfWeek.getMonth() + 1
  }/${currentYear.toString()}`;

  return `${startDateString} `;
};

const getFilteredCategories = (categories, seriesData) => {
  if (seriesData === 'Weekly') {
    return categories.map((category) => {
      const weekNumber = parseInt(category.replace('Week ', ''), 10);

      return getWeekDateRange(1, weekNumber);
    });
  }
  return categories;
};

export default function BookingStatistics({
  title,
  subheader,
  chart,
  seriesData,
  setSeriesData,
  ...other
}: Props) {
  const { categories, colors, series, options } = chart;
  const popover = usePopover();
  const chartOptions = useChart({
    colors,
    stroke: {
      show: true,
      width: 2,
    },
    xaxis: {
      categories: getFilteredCategories(chart.categories, seriesData),
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '10px',
      },
    },
    ...options,
  });

  const handleChangeSeries = useCallback(
    (newValue: string) => {
      popover.onClose();
      setSeriesData(newValue);
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
        {series.map((item) => (
          <Box key={item.type} sx={{ mt: 3, mx: 3 }}>
            {item.type === seriesData && (
              <Chart
                dir="ltr"
                type="bar"
                series={[
                  {
                    name: item.type,
                    data: item.data,
                  },
                ]}
                options={chartOptions}
                height={400}
              />
            )}
          </Box>
        ))}
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {series.map((option) => (
          <MenuItem
            key={option.type}
            selected={option.type === seriesData}
            onClick={() => handleChangeSeries(option.type)}
          >
            {option.type}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
