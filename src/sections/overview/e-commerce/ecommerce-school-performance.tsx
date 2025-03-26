import { useEffect, useState, useCallback } from 'react';
import { ApexOptions } from 'apexcharts';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Autocomplete, TextField } from '@mui/material';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type RowProps = {
  school_id: number;
  school_name: string;
  revenue: string | number;
  bookings: number;
  trainer_ratings: string | null;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
}

export default function SchoolPerformanceDetails({ title, subheader, tableData, ...other }: Props) {
  const { t } = useLocales();

  const [selectedSchool, setSelectedSchool] = useState<RowProps | null>(null);
  const [seriesData, setSeriesData] = useState<string>('revenue');
  const popover = usePopover();

  // Set default school if available
  useEffect(() => {
    if (tableData.length > 0) {
      setSelectedSchool(tableData[0]);
    }
  }, [tableData]);

  // Handle school selection from dropdown
  const handleSchoolChange = (event: any, newValue: RowProps | null) => {
    setSelectedSchool(newValue);
  };

  const chartOptions = useChart({
    colors: ['#8884d8', '#82ca9d', '#ff8042'], // Different colors for each series
    stroke: {
      show: true,
      width: 2,
    },
    xaxis: {
      categories: selectedSchool ? [selectedSchool.school_name] : [], // Only display the selected school on x-axis
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '10px',
      },
    },
  });

  const chartData = {
    series: [
      {
        name: t('revenue'),
        data: selectedSchool ? [selectedSchool.revenue] : [],
      },
      {
        name: t('bookings'),
        data: selectedSchool ? [selectedSchool.bookings] : [],
      },
      {
        name: t('trainer_ratings'),
        data: selectedSchool ? [selectedSchool.trainer_ratings || 0] : [],
      },
    ],
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Autocomplete
            value={selectedSchool}
            onChange={handleSchoolChange}
            options={tableData}
            getOptionLabel={(option) => option.school_name}
            isOptionEqualToValue={(option, value) => option.school_id === value?.school_id}
            renderInput={(params) => <TextField {...params} label={t("Select School")} />}
            disableClearable
            sx={{ width: 250 }}
          />
        }
      />

      <Box sx={{ mt: 3, mx: 3 }}>
        <Chart dir="ltr" type="bar" series={chartData.series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
