import isEqual from 'lodash/isEqual';
import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import AddIcon from '@mui/icons-material/Add';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types
//
import { IDeliveryItem } from 'src/types/product';
import { useSnackbar } from 'src/components/snackbar';
import NotificationTableRow from '../notifications-table-row';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  TableCell,
  TableRow,
} from '@mui/material';
import { useGetAllLanguage } from 'src/api/language';
import { sendNotification, useGetNotificationList } from 'src/api/notification';
import NotificationDetails from './notifications-details';
import SendNotificationForm from '../send-notification-form';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------



const defaultFilters: any = {
  name: '',
  is_active: '',
  display_order: 0,
  catalogue_type: '',
  locale: '',
};

// ----------------------------------------------------------------------

export default function NotificationlistingListView() {
  const table = useTable({ defaultRowsPerPage: 15, defaultOrderBy: 'id', defaultOrder: 'desc' });

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const { t } = useTranslation()

  const TABLE_HEAD = [
    { id: 'user_id', label: t('User ID') },
    { id: 'title', label: t('Title') },
    { id: 'description', label: t('Description') },

    { id: 'user_type', label: t('User Type') },

    { id: 'trainer_name', label: t('Trainer Name') },
    { id: '', label: t('Sent At') },
  ];

  const [tableData, setTableData] = useState<IDeliveryItem[]>();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // State to manage view mode
  const [filters, setFilters] = useState(defaultFilters);
  const [openPopup, setOpenPopup] = useState(false); // State to manage the popup visibility

  const {
    notifications,
    totalpages,
    notificationsError,
    notificationsLoading,
    revalidateNotifications,
  } = useGetNotificationList({ page: table?.page, limit: table?.rowsPerPage });

  const { language } = useGetAllLanguage(0, 1000);
  useEffect(() => {
    if (notifications?.length) {
      setTableData(notifications);
    } else {
      setTableData([]);
    }
  }, [notifications]);

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData?.length && canReset) || !tableData?.length;

  // const handleDeleteRow = async (id: string) => {
  //   try {
  //     const response = await deleteHomeListing(id);
  //     // revalidateHomeListing();
  //     enqueueSnackbar(response?.message);
  //   } catch (error) {
  //     enqueueSnackbar(error?.message, { variant: 'error' });
  //   }
  // };

  // const handleEditRow = useCallback(
  //   (e: any, id: string) => {
  //     e.stopPropogation();
  //     router.push(paths.dashboard.notification.edit);
  //   },
  //   [router]
  // );

  // const renderResults = (
  //   <JobFiltersResult
  //     filters={filters}
  //     onResetFilters={handleResetFilters}
  //     //
  //     canReset={canReset}
  //     onFilters={handleFilters}
  //     //
  //     results={dataFiltered.length}
  //   />
  // );
  // const handleViewRow = useCallback(
  //   (id: string) => {
  //     router.push(paths.dashboard.homelisting.details(id));
  //   },
  //   [router]
  // );

  const handleRowClick = (row) => {
    setSelectedNotification(row);
    setViewMode('detail');
  };
  const handleOpenPopup = () => setOpenPopup(true);
  const handleClosePopup = () => setOpenPopup(false);
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading={t("Notification List")}
          links={[
            { name: t('Dashboard'), href: paths.dashboard.root },
            {
              name: t('Notification List'),
              href: paths.dashboard.notification.root,
              onClick: (event) => {
                setViewMode('table');
              },
            },
            { name: t('List') },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {viewMode === 'table' && (
          <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenPopup}
              endIcon={<AddIcon />}
            >
              {t("Send Notification")}
            </Button>
          </Box>
        )}

        <Card
          sx={{
            marginTop: 10,
          }}
        >
          {/* <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_roles}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={tableData.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}

          {viewMode === 'table' && (
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={tableData?.length}
                // onSelectAllRows={(checked) =>
                //   table.onSelectAllRows(checked, tableData?.map((row) => row?.id))
                // }
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
                    headLabel={TABLE_HEAD}
                    rowCount={tableData?.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(checked, tableData?.map((row) => row.id))
                  // }
                  />

                  <TableBody>
                    {notificationsLoading
                      ? Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={TABLE_HEAD?.length || 6}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        </TableRow>
                      ))
                      : tableData?.map((row) => (
                        <NotificationTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => handleRowClick(row)}
                        // onDeleteRow={() => handleDeleteRow(row.id)}
                        // onEditRow={(e: any) => handleEditRow(e, row.id)}
                        // revalidateHomeListing={revalidateNotifications}
                        // onViewRow={() => handleRowClick(row)}
                        />
                      ))}

                    {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
                  /> */}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          {viewMode === 'table' && (
            <TablePaginationCustom
              count={totalpages}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          )}
        </Card>
        {viewMode === 'detail' && selectedNotification && (
          <NotificationDetails
            selectedNotification={selectedNotification}
            setViewMode={setViewMode}
          // onEdit={handleEditClick}
          // onBack={handleBackToList}
          // reload={revalidateCities}
          // cityId={rowId}
          // index={index}
          // setOpenEditPopup={setOpenEditPopup}
          />
        )}
      </Container>
      <Dialog open={openPopup} onClose={handleClosePopup} fullWidth>
        <DialogTitle>{t("Send Notification")}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <SendNotificationForm
            revalidateNotifications={revalidateNotifications}
            selectedNotification={selectedNotification}
            setViewMode={setViewMode}
            handleClosePopup={handleClosePopup}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------
