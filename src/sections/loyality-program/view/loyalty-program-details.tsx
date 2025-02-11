import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Paper,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
// API Hook
import { useGetEligibleRewardTrainerList } from 'src/api/loyality';
import { paths } from 'src/routes/paths';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { TableHeadCustom, useTable } from 'src/components/table';
import PendingRewardTableRow from 'src/sections/todo/refund/pending-rewards-table-row';
import RewardTableRow from '../reward-table-row';

const TABLE_HEAD = [
  { id: 'trainer-name', label: 'Trainer', width: 180 },
  { id: 'reward-amount', label: 'Reward Amount', width: 180 },
  { id: 'is-periodic', label: 'Periodic', width: 220 },
  { id: 'start-date', label: 'Start Date', width: 220 },
  { id: 'end-date', label: 'End Date', width: 220 },
  { id: 'notes', label: 'Notes', width: 250 },
  { id: 'achieved-date', label: 'Achieved Date', width: 200 },
  { id: 'action', label: '', width: 250 },
];

export default function LoyaltyProgramDetails() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const { id } = useParams<{ id: string }>();
  const [tabIndex, setTabIndex] = useState(0);

  const {
    eligibleRewardTrainers,
    eligibleRewardTrainersLoading,
    revalidateEligibleRewardTrainers,
  } = useGetEligibleRewardTrainerList({
    limit: table.rowsPerPage,
    page: table.page,
    trainer_reward_id: id,
    status: tabIndex === 0 ? 'pending' : 'claimed',
  });

  const pendingTrainers = eligibleRewardTrainers || [];
  const claimedTrainers = eligibleRewardTrainers || [];

  return (
    <Box sx={{ p: 3 }}>
      <CustomBreadcrumbs
        heading="Loyalty Program Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Loyalty', href: paths.dashboard.loyality.root },
          {
            name: `${eligibleRewardTrainers[0]?.trainer_reward?.trainer_reward_translation[0]?.name}`,
          },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)}>
        <Tab label="Pending Requests" />
        <Tab label="Claimed Requests" />
      </Tabs>

      {eligibleRewardTrainersLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tabIndex === 0 ? pendingTrainers.length : claimedTrainers.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
            />
            <TableBody>
              {eligibleRewardTrainersLoading &&
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={TABLE_HEAD.length}>
                      <Skeleton animation="wave" height={40} />
                    </TableCell>
                  </TableRow>
                ))}

              {tabIndex === 0 ? (
                pendingTrainers.length > 0 ? (
                  pendingTrainers.map((trainer) => (
                    <PendingRewardTableRow
                      key={trainer.id}
                      row={trainer}
                      selected={table.selected.includes(trainer.id)}
                      onSelectRow={() => handleRowClick(trainer)}
                      reload={revalidateEligibleRewardTrainers}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center">
                      <Typography variant="h6" color="textSecondary">
                        No pending requests
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              ) : claimedTrainers.length > 0 ? (
                claimedTrainers.map((trainer) => (
                  <RewardTableRow
                    key={trainer.id}
                    row={trainer}
                    selected={table.selected.includes(trainer.id)}
                    onSelectRow={() => handleRowClick(trainer)}
                    reload={revalidateEligibleRewardTrainers}
                    tabIndex={tabIndex}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={TABLE_HEAD.length} align="center">
                    <Typography variant="h6" color="textSecondary">
                      No claimed requests
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
