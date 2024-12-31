import { ApexOptions } from 'apexcharts';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card, { CardProps } from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chart, { useChart } from 'src/components/chart';
import { useGetTrainerInsights } from 'src/api/anlytics';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface Props extends CardProps {
  title?: string;
  subheader?: string;
}

export default function TotalTrainersSession({ title, subheader, ...other }: Props) {
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
        text: 'Session Count',
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
          <FormControl sx={{ mb: 2, width: 200 }}>
            <InputLabel id="trainer-select-label">Select Trainer</InputLabel>
            <Select
              labelId="trainer-select-label"
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              label="Select Trainer"
            >
              <MenuItem value="" disabled>
                <em>All Trainers</em>
              </MenuItem>

              {sessionsPerTrainer.map((trainer) => (
                <MenuItem key={trainer.trainer_name} value={trainer.trainer_name}>
                  {trainer.trainer_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Chart dir="ltr" type="bar" series={filteredSeries} options={chartOptions} height={394} />
      </Box>
    </Card>
  );
}
