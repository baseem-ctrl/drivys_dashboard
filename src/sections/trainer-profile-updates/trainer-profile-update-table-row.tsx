import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import { Button } from '@mui/material';
import { Tooltip, Typography, Chip, Box } from '@mui/material';
import { unverifyTrainerProfile } from 'src/api/trainerProfileUpdates';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';

export default function TrainerProfileUpdateRow({ row, selected, reload }) {
  const router = useRouter();
  const { t } = useLocales();

  const { enqueueSnackbar } = useSnackbar();

  const updatedFields = row?.updated_fields || {};

  const handleUnverifyTrainer = async (trainer_id) => {
    const formData = new FormData();
    formData.append('trainer_id', trainer_id);

    try {
      const response = await unverifyTrainerProfile(formData);
      enqueueSnackbar(response.message ?? t('trainer_status_changed_successfully'), {
        variant: 'success',
      });

      reload();
    } catch (error) {
      reload();
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
    }
  };
  const handleClickDetails = (id) => {
    router.push(paths.dashboard.user.details(id));
  };
  return (
    <TableRow hover selected={selected}>
      <TableCell
        onClick={() => {
          if (row?.user) {
            handleClickDetails(row?.user_id);
          }
        }}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {row?.user?.name || 'N/A'}
      </TableCell>

      <TableCell>
        <Box
          component="div"
          sx={{
            padding: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}
        >
          {updatedFields &&
            updatedFields.length > 0 &&
            Object.keys(updatedFields).map((section) =>
              Object.keys(updatedFields[section]).map((field) => {
                const change = updatedFields[section][field];
                return (
                  <Box
                    key={field}
                    display="flex"
                    alignItems="center"
                    sx={{
                      marginBottom: '0.8rem',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      backgroundColor: '#f1f1f1',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#e7e7e7',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      color="primary"
                      sx={{
                        fontWeight: 'bold',
                        marginRight: '1rem',
                        fontSize: '1.225rem',
                      }}
                    >
                      •
                    </Typography>
                    {change ? (
                      <>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            fontWeight: 'bold',
                            marginRight: '3px',
                            color: '#333',
                          }}
                        >
                          {field.toLocaleUpperCase()}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ color: '#555' }}>
                          {t('changed_from')}{' '}
                        </Typography>

                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            color: 'red',
                            fontWeight: 'bold',
                            ml: '3px',
                            mr: '3px',
                          }}
                        >
                          {change.old || 'N/A'}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ color: '#555' }}>
                          {t('to')}
                        </Typography>

                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            color: 'green',
                            fontWeight: 'bold',
                            ml: '3px',
                          }}
                        >
                          {change.new || 'N/A'}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" component="span" sx={{ color: '#888' }}>
                        {t('no_changes')}
                      </Typography>
                    )}
                  </Box>
                );
              })
            )}
        </Box>
      </TableCell>

      <TableCell>
        <Box display="flex" alignItems="center">
          <Chip
            label={row?.user?.verified_at ? t('yes') : t('no')}
            color={row?.user?.verified_at ? 'success' : 'error'}
            variant="contained"
          />
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Tooltip
            title={!row?.user?.verified_at ? 'Only verified users can be unverified.' : ''}
            arrow
          >
            <span>
              {' '}
              <Button
                variant="outlined"
                color="error"
                size="small"
                disabled={!row?.user?.verified_at}
                onClick={() => handleUnverifyTrainer(row?.user_id)}
                sx={{
                  textTransform: 'none',
                  '&.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                    color: 'error',
                    borderColor: 'red',
                    cursor: 'not-allowed',
                  },
                }}
              >
                {t('unverify')}{' '}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}
