import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { useChart } from 'src/components/chart';
import Chart from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: { label: string; data: number }[];
    }[];
    options?: ChartOptions;
  };
};

export function AnalyticsConversionRates({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();
  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    hexAlpha(theme.palette.primary.dark, 0.24),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    legend: { show: false },
    tooltip: {
      enabled: true,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const seriesData = chart.series[seriesIndex]?.data[dataPointIndex];

        if (seriesData && seriesData.label !== undefined && seriesData.data !== undefined) {
          const { label, data } = seriesData;

          return `<div class="tooltip">${label}: ${data}</div>`;
        } else {
          return '<div class="tooltip">No data available</div>';
        }
      },
    },
    xaxis: {
      categories: chart.categories,
    },

    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 600,
        },
        formatter(value) {
          console.log('value', value, typeof value);
          if (typeof value === 'string') {
            const lastWord = value.split(/(?=[A-Z])/).pop();
            return lastWord.charAt(0).toUpperCase() + lastWord.slice(1);
          }
          return value;
        },
      },
      title: {
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function formatter(val, { w, seriesIndex, dataPointIndex }) {
        const seriesData = chart.series[seriesIndex]?.data[dataPointIndex];

        if (seriesData) {
          const { label, data } = seriesData;
          return label.charAt(0).toUpperCase() + label.slice(1);
        }
        return 'No data available';
      },
      style: {
        fontSize: '11px',
        colors: ['#FFFFFF'],
      },
      offsetX: 0,
      offsetY: 0,
    },

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 3,
        barHeight: '80%',

        dataLabels: { position: 'center' },
      },
    },
    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="bar"
        series={chart.series.map((item) => ({
          name: item.name,
          data: item.data.map((entry) => entry.data),
        }))}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{
          pl: 2.1,
          py: 2.1,
          pr: 1.8,
          maxHeight: '400px', // Set max height
          overflowY: 'auto',
        }}
      />
    </Card>
  );
}
