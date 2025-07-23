import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
// _mock
import { _userList, _roles, USER_STATUS_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types
import { IUserItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
//
import { deleteLanguage, useGetAllLanguage } from 'src/api/language';
import { enqueueSnackbar } from 'src/components/snackbar';
import {
  Avatar,
  ListItemText,
  MenuItem,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  RemoveTrainerFromSchool,
  useGetSchoolTrainerList,
  useGetSchoolTrainers,
} from 'src/api/school';
import moment from 'moment';
import { updateUserVerification } from 'src/api/school-admin';
import TrainerCreateEditForm from './trainer-create-update';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import TrainerSearch from 'src/sections/user/trainer-search';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const defaultFilters: IUserTableFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function SchoolTrainersListView() {
  const table = useTable({ defaultRowsPerPage: 15 });
  const { t } = useTranslation();
  const TABLE_HEAD = [
    { id: 'name', label: '' },
    { id: 'name', label: t('name') },
    { id: 'vehicle_number', label: t('category') },
    { id: 'dob', label: t('DOB') },
    { id: 'status', label: t('Status') },
    { id: 'verification_status', label: t('Date') },
    { id: '', label: '' },
  ];

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const [tableData, setTableData] = useState<any>([]);

  const {
    schoolTrainersList,
    schoolTrainersLoading,
    schoolTrainersError,
    totalPages,
    revalidateTrainers,
    revalidateSearch,
  } = useGetSchoolTrainerList({
    page: table?.page + 1,
    limit: table?.rowsPerPage,
  });

  useEffect(() => {
    if (schoolTrainersList?.length) {
      setTableData(schoolTrainersList);
    } else {
      setTableData([]);
    }
  }, [schoolTrainersList]);

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      revalidateSearch(value);
    },
    [table]
  );
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const handleRowClick = (e: any, user_id: string) => {
    e.stopPropagation();

    router.push(paths.dashboard.school.detailsadmin(user_id));
  };
  const handleVerify = async (e: any, user_id: string) => {
    e.stopPropagation();
    const body = {
      trainer_id: user_id,
      verify: 1,
    };
    const response = await updateUserVerification(body);
    if (response) {
      enqueueSnackbar(response?.message ?? 'Trainer Verified Successfully');
      revalidateTrainers();
    }
  };
  const createTrainer = useBoolean();
  const popover = usePopover();
  const editTrainer = useBoolean();
  const [trainerDetails, setTrainerDetails] = useState(null);
  const handlePopoverOpen = (e: any, trainer_details: any) => {
    e.stopPropagation();

    setTrainerDetails(trainer_details);
    popover.onOpen(e);
  };
  const handleClose = () => {
    createTrainer.onFalse();
    editTrainer.onFalse();
    popover.onClose();
    revalidateTrainers();
    setTrainerDetails(null);
  };

  const handleRemoveTrianer = async () => {
    try {
      if (trainerDetails?.id) {
        const response = await RemoveTrainerFromSchool(trainerDetails?.id);
        if (response) {
          enqueueSnackbar(response?.message ?? 'Trainer Removed Successfully');
          setTrainerDetails(null);
          revalidateTrainers();
          confirm.onFalse();
        }
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <TrainerSearch query={filters.name} results={filters} onSearch={handleFilters} />
    </Stack>
  );
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('list')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('trainers'), href: paths.dashboard.school.trainer },
            { name: t('list') },
          ]}
          action={
            <Button
              onClick={() => {
                createTrainer.onTrue();
              }}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('create')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Stack
            spacing={2.5}
            sx={{
              m: 1,
            }}
          >
            {renderFilters}
          </Stack>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  // onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     tableData.map((row) => row.id)
                  //   )
                  // }
                />

                <TableBody>
                  {schoolTrainersLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                    : tableData &&
                      tableData?.length > 0 &&
                      tableData?.map((row) => (
                        <TableRow
                          hover
                          onClick={(e) => handleRowClick(e, row?.user?.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              alt={row?.user?.name}
                              src={row?.user?.photo_url}
                              sx={{ mr: 2 }}
                            />
                          </TableCell>

                          <TableCell>
                            <ListItemText
                              primary={row?.user?.name ?? 'Nِ'}
                              secondary={row?.user?.email ?? t('n/a')}
                            />
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {row?.vehicle_number ?? t('n/a')}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {row?.user?.dob?.split('T')[0] ?? t('n/a')}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Label
                              variant="soft"
                              color={!!row?.user?.is_active ? 'success' : 'error'}
                            >
                              {!!row?.user?.is_active ? t('active') : t('inactive')}
                            </Label>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {!row?.user?.school_verified_at ? (
                              <Button
                                startIcon={<Iconify icon="solar:verified-check-bold" />}
                                variant="outlined"
                                onClick={(e: any) => {
                                  handleVerify(e, row?.user?.id);
                                }}
                              >
                                {t('verify')}
                              </Button>
                            ) : (
                              moment(row?.user?.school_verified_at).format('lll')
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                            <IconButton
                              color={popover.value ? 'inherit' : 'default'}
                              onClick={(e) => handlePopoverOpen(e, row)}
                            >
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalPages}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
        <TrainerCreateEditForm
          open={createTrainer.value}
          onClose={handleClose}
          reload={revalidateTrainers}
          // currentUser={''}
        />
        <TrainerCreateEditForm
          open={editTrainer.value}
          onClose={handleClose}
          reload={revalidateTrainers}
          currentUser={trainerDetails}
        />
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="right-top"
          sx={{ width: 140 }}
        >
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {t('remove')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              editTrainer.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t('edit')}
          </MenuItem>
        </CustomPopover>
        <ConfirmDialog
          open={confirm.value}
          onClose={confirm.onFalse}
          title="Remove"
          content={t('confirm_remove_trainer')}
          onConfirm={handleRemoveTrianer}
          action={
            <Button variant="contained" color="error">
              Remove
            </Button>
          }
        />
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------
