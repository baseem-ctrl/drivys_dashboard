import { ApexOptions } from 'apexcharts';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';
// utils
import { fNumber, fPercent } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  percent?: number;
  chart?: {
    colors?: string[];
    series?: number[];
    options?: ApexOptions;
  };
}

export default function EcommerceWidgetSummary({
  title,
  percent,
  total,
  chart,
  sx,
  icon,
  bgcolor = 'background.paper',
  textColor = 'text.primary',
  ...other
}: Props) {
  const theme = useTheme();
  const percentageBgColor = percent < 0 ? 'rgba(255, 99, 71, 0.2)' : 'rgba(144, 238, 144, 0.2)';
  // const chartOptions = useChart({
  //   colors: [colors[1]],
  //   fill: {
  //     type: 'gradient',
  //     gradient: {
  //       colorStops: [
  //         { offset: 0, color: colors[0] },
  //         { offset: 100, color: colors[1] },
  //       ],
  //     },
  //   },
  //   chart: {
  //     animations: {
  //       enabled: true,
  //     },
  //     sparkline: {
  //       enabled: true,
  //     },
  //   },
  //   tooltip: {
  //     x: {
  //       show: false,
  //     },
  //     y: {
  //       formatter: (value: number) => fNumber(value),
  //       title: {
  //         formatter: () => '',
  //       },
  //     },
  //     marker: {
  //       show: false,
  //     },
  //   },
  //   ...options,
  // });

  // const renderTrending = (
  //   <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
  //     <Iconify
  //       icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
  //       sx={{
  //         mr: 1,
  //         p: 0.5,
  //         width: 24,
  //         height: 24,
  //         borderRadius: '50%',
  //         color: 'success.main',
  //         bgcolor: alpha(theme.palette.success.main, 0.16),
  //         ...(percent < 0 && {
  //           color: 'error.main',
  //           bgcolor: alpha(theme.palette.error.main, 0.16),
  //         }),
  //       }}
  //     />

  //     <Typography variant="subtitle2" component="div" noWrap>
  //       {percent > 0 && '+'}

  //       {fPercent(percent)}

  //       <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
  //         {' than last week'}
  //       </Box>
  //     </Typography>
  //   </Stack>
  // );

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: bgcolor,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-5px)',
        },
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            color: 'text.secondary',
            mb: 0.5,
            fontWeight: 600,
            fontSize: '1rem',
            // textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        ></Box>
        <Typography
          variant="h4"
          sx={{
            color: textColor,
            fontWeight: 'bold',
            fontSize: '1.1rem',
            lineHeight: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: 1, // Adds space between the total and percentage
          }}
        >
          <span>{fNumber(total)}</span>
          <Typography
            component="span"
            sx={{
              fontSize: '0.85rem',
              fontWeight: 'medium',
              color: 'text.secondary',
              backgroundColor: percentageBgColor,
              borderRadius: 1,
              px: 1,
            }}
          >
            {fPercent(percent)}
          </Typography>
        </Typography>
      </Box>

      {icon && (
        <Iconify
          icon={icon}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        />
      )}
    </Card>
  );
}
