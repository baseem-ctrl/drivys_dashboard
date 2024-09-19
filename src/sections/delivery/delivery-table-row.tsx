// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import { IDeliveryItem } from 'src/types/product';
import DeliveryQuickEditForm from './delivery-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IDeliveryItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  revalidateDeliverey: VoidFunction;
};

export default function DeliveryTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  revalidateDeliverey,
}: Props) {
  const { translations, day_of_week, max_orders, published, start_time, end_time } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{translations[0]?.name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{translations[0]?.description}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{translations[0]?.locale}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{day_of_week}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{max_orders}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={(published === '1' && 'success') || (published === '0' && 'error') || 'default'}
          >
            {published === '0' ? 'No' : 'Yes'}
          </Label>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{start_time}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{end_time}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton
            color="error"
            onClick={() => {
              confirm.onTrue();
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <DeliveryQuickEditForm
        currentDelivery={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        revalidateDeliverey={revalidateDeliverey}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        onConfirm={() => {
          confirm.onFalse();
          onDeleteRow();
        }}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
