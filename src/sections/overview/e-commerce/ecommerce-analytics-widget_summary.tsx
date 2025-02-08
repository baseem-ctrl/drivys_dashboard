import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CardProps } from '@mui/material/Card';
// theme
import { bgGradient } from 'src/theme/css';
// utils
import { fPercent, fShortenNumber } from 'src/utils/format-number';
// theme
import { ColorSchema } from 'src/theme/palette';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  icon: React.ReactNode;
  color?: ColorSchema;
  percentageChange?: number;
}

export default function AnalyticsWidgetSummary({
  title,
  total,
  icon,
  percentageChange,
  color = 'primary',
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  // SVG Icons
  const upIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M21 7a.8.8 0 0 0 0-.21a.6.6 0 0 0-.05-.17a1 1 0 0 0-.09-.14a.8.8 0 0 0-.14-.17l-.12-.07a.7.7 0 0 0-.19-.1h-.2A.7.7 0 0 0 20 6h-5a1 1 0 0 0 0 2h2.83l-4 4.71l-4.32-2.57a1 1 0 0 0-1.28.22l-5 6a1 1 0 0 0 .13 1.41A1 1 0 0 0 4 18a1 1 0 0 0 .77-.36l4.45-5.34l4.27 2.56a1 1 0 0 0 1.27-.21L19 9.7V12a1 1 0 0 0 2 0z"
      ></path>
    </svg>
  );

  const downIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M21 7a.8.8 0 0 0 0-.21a.6.6 0 0 0-.05-.17a1 1 0 0 0-.09-.14a.8.8 0 0 0-.14-.17l-.12-.07a.7.7 0 0 0-.19-.1h-.2A.7.7 0 0 0 20 6h-5a1 1 0 0 0 0 2h2.83l-4 4.71l-4.32-2.57a1 1 0 0 0-1.28.22l-5 6a1 1 0 0 0 .13 1.41A1 1 0 0 0 4 18a1 1 0 0 0 .77-.36l4.45-5.34l4.27 2.56a1 1 0 0 0 1.27-.21L19 9.7V12a1 1 0 0 0 2 0z"
      ></path>
    </svg>
  );

  return (
    <Stack
      alignItems="center"
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette[color].light, 0.3),
          endColor: alpha(theme.palette[color].main, 0.2),
        }),
        py: 3,
        borderRadius: 2,
        textAlign: 'center',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      {percentageChange !== undefined && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,

            color: theme.palette[color]?.main || '#000',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            fontSize: 18,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {percentageChange > 0 ? upIcon : downIcon}
          {percentageChange > 0 ? '+' : ''}
          {fPercent(percentageChange)}
        </Box>
      )}

      {icon && <Box sx={{ width: 64, height: 64, mb: 1 }}>{icon}</Box>}

      <Typography variant="h3">{Number(total) === 0 ? 0 : fShortenNumber(total)}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.64 }}>
        {title}
      </Typography>
    </Stack>
  );
}
