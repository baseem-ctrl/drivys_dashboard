// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import { IJobCandidate } from 'src/types/job';
// components
import Iconify from 'src/components/iconify';
import { useGetSchoolTrainers } from 'src/api/school';
import { TablePaginationCustom, useTable } from 'src/components/table';
import { Button, CircularProgress, MenuItem, Typography } from '@mui/material';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

type Props = {
  candidates: any;
};

export default function SchoolTrainers({ candidates }: Props) {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const { schoolTrainersList, schoolTrainersLoading, schoolTrainersError, totalPages } =
    useGetSchoolTrainers({
      page: table?.page + 1,
      limit: table?.rowsPerPage,
      vendor_id: candidates?.id,
    });
  const popover = usePopover();
  const confirm = useBoolean();
  return (
    <Box
      gap={3}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
      }}
    >
      {!schoolTrainersLoading ? (
        schoolTrainersList?.length > 0 ? (
          schoolTrainersList?.map((trainer: any) => (
            <Stack component={Card} direction="column" spacing={2} key={trainer?.id} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} key={trainer?.id}>
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={popover.onOpen}
                >
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>

                <Avatar
                  alt={trainer?.user?.name ?? 'NA'}
                  src={trainer?.user?.photo_url}
                  sx={{ width: 48, height: 48 }}
                />

                <Stack spacing={1}>
                  <ListItemText
                    primary={trainer?.user?.name}
                    secondary={trainer?.user?.email}
                    secondaryTypographyProps={{
                      mt: 0.5,
                      component: 'span',
                      typography: 'caption',
                      color: 'text.disabled',
                    }}
                  />

                  {/* <Stack direction="column"> */}
                  {/* <IconButton
                  size="small"
                  color="error"
                  sx={{
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
                    },
                  }}
                >
                  <Iconify width={18} icon="solar:phone-bold" />
                </IconButton>

                <IconButton
                  size="small"
                  color="info"
                  sx={{
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.16),
                    },
                  }}
                >
                  <Iconify width={18} icon="solar:chat-round-dots-bold" />
                </IconButton>

                <IconButton
                  size="small"
                  color="primary"
                  sx={{
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                    },
                  }}
                >
                  <Iconify width={18} icon="fluent:mail-24-filled" />
                </IconButton>

                <Tooltip title="Download CV">
                  <IconButton
                    size="small"
                    color="secondary"
                    sx={{
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
                      },
                    }}
                  >
                    <Iconify width={18} icon="eva:cloud-download-fill" />
                  </IconButton>
                </Tooltip> */}
                  {/* </Stack> */}
                </Stack>
                {/* <TablePaginationCustom
              count={totalPages}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            /> */}
              </Stack>
              <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
                {[
                  // { label: 'Name', value: items?.name ?? 'N/A' },
                  {
                    label: 'Phone Number',
                    value: trainer?.user?.country_code
                      ? `${trainer?.user?.country_code}-${trainer?.user?.phone}`
                      : trainer?.user?.phone ?? 'NA',
                  },
                  { label: 'Hand Cash Allowed', value: trainer?.max_cash_in_hand_allowed ?? 'NA' },

                  { label: 'Cash in Hand', value: trainer?.cash_in_hand ?? 'NA' },
                  {
                    label: 'Cash Clearance Date',
                    value: trainer?.cash_clearance_date ?? 'NA',
                  },
                  {
                    label: 'Last Booking',
                    value: trainer?.last_booking_was ?? 'NA',
                  },
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                    <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                      {item.label}
                    </Box>
                    <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                      :
                    </Box>
                    <Box component="span">{schoolTrainersLoading ? 'Loading...' : item.value}</Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          ))
        ) : (
          <Box>No Trainers Found</Box>
        )
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '10px',
            alignSelf: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={() => {
          confirm.onFalse();
        }}
        action={
          <Button variant="contained" color="error">
            Delete
          </Button>
        }
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            // router.push(paths.dashboard.school.details(row?.id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            confirm.onTrue();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </Box>
  );
}
