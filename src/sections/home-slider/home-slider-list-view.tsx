import { useState, useEffect, useCallback } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Scrollbar from 'src/components/scrollbar';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { enqueueSnackbar } from 'notistack';
import Iconify from 'src/components/iconify';
import {
  deleteHomeSlider,
  useGetHomeSlider,
  useGetHomeSliderById,
  EditSlider,
} from 'src/api/home-slider';

import {
  useTable,
  TableNoData,
  TablePaginationCustom,
  // eslint-disable-next-line import/no-duplicates
} from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
// import ProductDialog from '../productDialog';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { ISliderItem } from 'src/types/slider';

import { useSettingsContext } from 'src/components/settings';
import { Avatar } from '@mui/material';
import Label from 'src/components/label';
import { useTranslation } from 'react-i18next';
import HomeSliderDialog from './home-slider-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'DisplayOrder', label: 'Order' },
  { id: 'picture', label: 'Picture' },
  { id: 'name', label: 'Name' },

  { id: 'published', label: 'Published' },
  // { id: 'ISMonthly', label: 'Is Monthly' },
  { id: 'show_until', label: 'Show until' },
  // { id: 'Type', label: 'Type' },
  { id: 'actions', label: '' },
];

// ----------------------------------------------------------------------

export default function HomeSliderListView() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const [tableData, setTableData] = useState<ISliderItem[]>([]);
  const { homeSlider, totalpages, revalidateHomeSlider, homeSliderError } = useGetHomeSlider(
    table.page,
    table.rowsPerPage
  );

  const sliderUpdate = useBoolean(false);
  const confirm = useBoolean(false);

  useEffect(() => {
    if (homeSlider.length) {
      setTableData(homeSlider);
    }
  }, [homeSlider]);

  const [deleteId, setDeleteId] = useState<string>('');

  const handleDeleteRow = async () => {
    try {
      if (deleteId) {
        const response = await deleteHomeSlider(deleteId);
        if (response) {
          enqueueSnackbar(response?.message, { variant: 'success' });
          revalidateHomeSlider();
          confirm.onFalse();
          setDeleteId('');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [updateValue, setUpdateValue] = useState<string>('');

  const handleEditRow = async (id: any) => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const res = await useGetHomeSliderById(id);
      console.log('respose', res);

      if (res) {
        // Update the state based on the response
        setUpdateValue(res.data); // Assuming res contains the updated value
        sliderUpdate.onTrue();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error if needed
    }
  };

  const settings = useSettingsContext();

  const { t } = useTranslation();

  const reorder = (list: [], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = useCallback(
    async (result) => {
      if (!result.destination) {
        return;
      }

      const newItems = reorder(tableData, result.source.index, result.destination.index);
      for (let i = 0; i < newItems.length; i++) {
        const currentItem = newItems[i];
        if (currentItem.display_order !== i + 1) {
          currentItem.display_order = i + 1;
          EditSlider({ slider_id: currentItem?.id, display_order: currentItem.display_order });
        }
      }

      setTableData(newItems);
      revalidateHomeSlider();
    },
    [tableData, revalidateHomeSlider]
  );

  return (
    <>
      {homeSliderError ? (
        <div>{homeSliderError?.message}</div>
      ) : (
        <Container maxWidth={settings.themeStretch ? false : 'xxl'}>
          <CustomBreadcrumbs
            heading={t('Home Slider List')}
            links={[
              { name: t('Dashboard'), href: paths.dashboard.root },
              { name: t('Home Slider'), href: paths.dashboard.slider.root },
              { name: t('List') },
            ]}
            action={
              <Button
                href={paths.dashboard.slider.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                {t('New Slider')}
              </Button>
            }
          />
          <Card sx={{ mt: 3 }}>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHead>
                    <TableRow>
                      {TABLE_HEAD.map((headCell) => (
                        <TableCell key={headCell.id}>{t(headCell.label)}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                      {(provided) => (
                        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                          {tableData.map((row: any, index: number) => (
                            <Draggable key={row.id} draggableId={row.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <TableRow
                                  key={row.id}
                                  hover
                                  // selected={selected}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps.style}
                                >
                                  <TableCell>{row.display_order}</TableCell>
                                  <TableCell>
                                    <Avatar
                                      alt={row.name}
                                      src={row?.pictures[0]?.picture?.virtual_path}
                                      sx={{ mr: 2 }}
                                    />
                                  </TableCell>

                                  <TableCell>{row.name}</TableCell>

                                  <TableCell>
                                    <Label
                                      variant="soft"
                                      color={row.published === '1' ? 'success' : 'warning'}
                                    >
                                      {row.published === '1' ? 'Yes' : 'No'}
                                    </Label>
                                  </TableCell>
                                  {/* <TableCell>
                                    <Label
                                      variant="soft"
                                      color={row.is_monthly === true ? 'primary' : 'warning'}
                                    >
                                      {row.is_monthly === true ? 'Yes' : 'No'}
                                    </Label>
                                  </TableCell> */}
                                  <TableCell>{row.show_until}</TableCell>

                                  {/* <TableCell>{row?.type}</TableCell> */}

                                  <TableCell>
                                    <IconButton
                                      onClick={() => {
                                        confirm.onTrue();
                                        setDeleteId(row?.id);
                                      }}
                                    >
                                      <Iconify icon="eva:trash-2-outline" />
                                    </IconButton>
                                    <IconButton onClick={() => handleEditRow(row.id)}>
                                      <Iconify icon="eva:edit-outline" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <TableNoData notFound={!tableData.length} />
                        </TableBody>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={totalpages}
              page={table.page ?? 0}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Container>
      )}

      <HomeSliderDialog
        open={sliderUpdate.value}
        onClose={sliderUpdate.onFalse}
        title={t('Update Home Slider')}
        updateValue={updateValue}
        onReload={revalidateHomeSlider}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('Delete')}
        content={t('Are you sure want to delete?')}
        onConfirm={() => {
          if (deleteId) {
            handleDeleteRow();
          }
        }}
      />
    </>
  );
}
