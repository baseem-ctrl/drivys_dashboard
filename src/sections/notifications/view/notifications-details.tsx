import { Typography, Box, Stack, Card, Grid, Button, Popover } from '@mui/material';
import NotificationDetailsToolbar from '../notification-details-toolbar';
import { useState } from 'react';
import { sendNotification } from 'src/api/notification';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialogSend from 'src/components/custom-dialog/confirm-dailog-send';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function NotificationDetails({ selectedNotification, setViewMode }) {
  const { t } = useTranslation();
  const { user, title, description, data, sent_at } = selectedNotification;
  const { email, user_type, phone, locale } = user;
  const { no_of_sessions, session_dates, pickup_location, trainer_details } =
    typeof data === 'string' ? JSON.parse(data) : data;

  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleSendNotification = async () => {
    const notificationData = {
      user_ids: [user.id],
      user_type,
      title,
      description,
      send_all: 0,
    };

    try {
      setLoading(true);

      const response = await sendNotification(notificationData);
      enqueueSnackbar(t('Notification sent successfully!'), {
        variant: 'success',
      });
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setConfirmDialogOpen(false);
      handleClosePopover();
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <NotificationDetailsToolbar backLink={() => setViewMode('table')} orderNumber={user?.id} />
      <Card sx={{ p: 3, boxShadow: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '320px',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'primary.main',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  marginBottom: 5,
                  pb: 1,
                }}
              >
                {t('User Details')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body2">
                      <strong>{t('User ID')}:</strong> {user.id ?? t('n/a')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Name:')}</strong> {user.name ?? t('n/a')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Email:')}</strong> {email ?? t('n/a')}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body2">
                      <strong>{t('Phone')}:</strong> {phone ?? t('n/a')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('User Type')}:</strong> {user_type ?? t('n/a')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Locale')}:</strong> {locale ?? t('n/a')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ width: '100%' }}>
                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={2}
                  sx={{ mt: 5, width: '100%' }}
                >
                  {/* Conditionally render based on the sent_at field */}
                  {sent_at ? (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled
                      onClick={() => setConfirmDialogOpen(true)}
                      sx={{ color: 'success.main', width: '90%' }}
                    >
                      {t('Sent')}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setConfirmDialogOpen(true)}
                      sx={{ width: '90%' }}
                    >
                      {t('Send')}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '320px',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'primary.main',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  marginBottom: 5,
                  pb: 1,
                }}
              >
                {t('Notification Details')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body2">
                      <strong>{t('Title')}:</strong> {title ?? t('n/a')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Description')}:</strong> {description ?? t('n/a')}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body2">
                      <strong>{t('No. of Sessions')}:</strong> {no_of_sessions ?? t('n/a')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Pickup Location')}:</strong> {pickup_location ?? t('n/a')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Trainer Name')}:</strong> {trainer_details?.name ?? t('n/a')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body2">
                      <strong>{t('Session Start Time')}:</strong>{' '}
                      {session_dates?.start_time ?? t('n/a')}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body2">
                      <strong>{t('Session End Time')}:</strong>{' '}
                      {session_dates?.end_time ?? t('n/a')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Card>
      <ConfirmDialogSend
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title={t('Send Notification')}
        content={t('Are you sure you want to send this notification?')}
        onConfirm={handleSendNotification}
        loading={loading}
      />
    </Box>
  );
}
