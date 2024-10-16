import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Skeleton, TableCell, TableRow } from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

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

import StateTableRow from '../state-table-row';
import { enqueueSnackbar } from 'src/components/snackbar';
// import StateCreateEditForm from '../state-create-update';
import { deleteStateById, useGetStateList } from 'src/api/state';
import StateDetails from './state-details';
import StateNewEditForm from '../state-new-edit-form';
import StateCreateEditForm from '../state-create-update';
// import StateNewEditForm from '../state-new-edit-form';
// import StateDetails from './state-details';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'locale', label: 'Locale', width: 180 },
  { id: 'state_id', label: 'State ID', width: 220 },
  { id: 'is_published', label: 'Published', width: 180 },
  { id: 'action1', label: '', width: 180 },
  { id: 'action2', label: '', width: 88 },
];

// ----------------------------------------------------------------------

export default function StateListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const createState = useBoolean();

  const [tableData, setTableData] = useState<any>([]);
  const [selectedState, setSelectedState] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [rowId, setRowId] = useState(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [stateProvinceID, setProvinceID] = useState(null);
  const [index, setIndex] = useState(null);

  // Use the state hook instead of the city one
  const { states, revalidateStates, totalpages, stateLoading } = useGetStateList({
    limit: table.rowsPerPage,
    page: table.page,
  });
  useEffect(() => {
    if (states?.length) {
      setTableData(states);
    } else {
      setTableData([]);
    }
  }, [states]);

  // Function to delete a state row by state ID
  const handleDeleteRow = async (stateId: string) => {
    const response = await deleteStateById(stateId);
    if (response) {
      enqueueSnackbar(response?.message ?? 'Success');
      revalidateStates();
      setViewMode('table');
    } else {
      console.error('Error deleting state:', response.statusText);
    }
  };

  const handleRowClick = (row) => {
    setRowId(row.id);
    setSelectedState(row);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('table');
    setSelectedState(null);
  };

  const handleEditClick = () => {
    setOpenEditPopup(true);
  };

  const handleClosePopup = () => {
    setOpenEditPopup(false);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'State',
              href: paths.dashboard.system.state,
              onClick: (event) => {
                setViewMode('table');
              },
            },
            { name: 'List' },
          ]}
          action={
            viewMode === 'table' && (
              <Button
                onClick={() => {
                  createState.onTrue();
                }}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New State
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          {viewMode === 'table' && (
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
                  />
                  <TableBody>
                    {stateLoading
                      ? Array.from(new Array(5)).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={TABLE_HEAD?.length || 6}>
                              <Skeleton animation="wave" height={40} />
                            </TableCell>
                          </TableRow>
                        ))
                      : tableData?.map((row) => (
                          <StateTableRow
                            row={row}
                            setProvinceID={setProvinceID}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => handleRowClick(row)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            reload={revalidateStates}
                          />
                        ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          {viewMode === 'detail' && selectedState && (
            <StateDetails
              state={selectedState}
              onEdit={handleEditClick}
              onBack={handleBackToList}
              reload={revalidateStates}
              stateId={rowId}
              index={index}
            />
          )}

          <Dialog open={openEditPopup} onClose={handleClosePopup}>
            <DialogTitle>Edit State</DialogTitle>
            <DialogContent>
              {selectedState && (
                <StateNewEditForm
                  state={selectedState}
                  reload={revalidateStates}
                  setViewMode={setViewMode}
                  setSelectedState={setSelectedState}
                  handleClosePopup={handleClosePopup}
                  stateProvinceID={stateProvinceID}
                />
              )}
            </DialogContent>
          </Dialog>

          {viewMode === 'table' && (
            <TablePaginationCustom
              count={totalpages}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          )}
        </Card>
      </Container>

      <StateCreateEditForm
        title="Create State"
        open={createState.value}
        onClose={createState.onFalse}
        reload={revalidateStates}
      />
    </>
  );
}

// ----------------------------------------------------------------------
