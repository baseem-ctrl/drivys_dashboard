// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  backLink: string;
  orderNumber: string;
  createdAt: Date;
};

export default function NotificationDetailsToolbar({ backLink, createdAt, orderNumber }: Props) {
  const { t, i18n } = useTranslation();

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      <Stack spacing={1} direction="row" alignItems="flex-start">
        <Box
          onClick={(event) => {
            event.preventDefault();
            backLink();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: 1,
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        > {i18n.language === 'en' ? (

          <Iconify
            icon="eva:arrow-ios-back-fill"
            sx={{
              marginTop: '-3px',
            }}
          />) : (
          <Iconify
            icon="eva:arrow-ios-back-fill"
            sx={{
              marginTop: '-3px',
              transform: 'rotate(180deg)',
            }}
          />
        )}
        </Box>

        <Stack spacing={0.5}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Typography variant="h6">
              {' '}
              {t('Notification_User_ID_')} {orderNumber}{' '}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {fDateTime(createdAt)}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
