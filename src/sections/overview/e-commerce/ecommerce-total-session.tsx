import { ApexOptions } from 'apexcharts';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card, { CardProps } from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useLocales } from 'src/locales';
import Chart, { useChart } from 'src/components/chart';
import { useGetTrainerInsights } from 'src/api/anlytics';
import { Select, MenuItem, FormControl, InputLabel, Autocomplete, TextField } from '@mui/material';

interface Props extends CardProps {
  title?: string;
  subheader?: string;
}

export default function TotalTrainersSession({ title, subheader, ...other }: Props) {
  const { t } = useLocales();
  const theme = useTheme();
  const { trainerInsights, trainerInsightsLoading } = useGetTrainerInsights();
  const sessionsPerTrainer = trainerInsights?.sessionsPerTrainer || [];

  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  useEffect(() => {
    if (sessionsPerTrainer.length > 0) {
      setSelectedTrainer(sessionsPerTrainer[0].trainer_name);
    }
  }, [sessionsPerTrainer]);
  // Prepare chart data
  const chart = useMemo(() => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const series = sessionsPerTrainer.map((trainer) => {
      const monthlyData = Array(12).fill(0); // Initialize data for 12 months
      trainer.sessions.forEach((session) => {
        const monthIndex = new Date(session.month).getMonth();
        monthlyData[monthIndex] = session.session_count;
      });

      return {
        name: trainer.trainer_name,
        data: monthlyData,
      };
    });

    return { months, series };
  }, [sessionsPerTrainer]);

  const chartOptions = useChart({
    chart: {
      type: 'bar',
      height: 400,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '15%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    xaxis: {
      categories: chart.months,
    },
    yaxis: {
      title: {
        text: t('session_count'),
      },
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.info.main],
    legend: {
      position: 'top',
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} sessions`,
      },
    },
  });

  const filteredSeries = selectedTrainer
    ? chart.series.filter((trainer) => trainer.name === selectedTrainer)
    : chart.series;

  if (trainerInsightsLoading) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box sx={{ p: 3, textAlign: 'center' }}>Loading...</Box>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ mt: 3, mx: 3 }}>
        <Box sx={{ mt: 3, mx: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {' '}
          <FormControl sx={{ mb: 2, width: 250 }}>
            <Autocomplete
              value={selectedTrainer}
              onChange={(event, newValue) => setSelectedTrainer(newValue || '')}
              options={sessionsPerTrainer.map((trainer) => trainer.trainer_name)}
              renderInput={(params) => <TextField {...params} label="Select Trainer" />}
              isOptionEqualToValue={(option, value) => option === value}
              disableClearable
            />
          </FormControl>
        </Box>

        <Chart dir="ltr" type="bar" series={filteredSeries} options={chartOptions} height={394} />
      </Box>
    </Card>
  );
}
