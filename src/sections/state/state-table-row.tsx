import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import StateCreateEditForm from './state-create-update';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: any;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  reload: VoidFunction;
};

export default function StateTableRow({
  row,
  selected,
  onEditRow,
  setProvinceID,
  onSelectRow,
  onDeleteRow,
  reload,
}: Props) {
  const { id, is_published, order, translations } = row;
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const zerothIndex = 0;

  const handleRowClick = (stateId: string) => {
    setProvinceID(stateId);
    onSelectRow();
  };
  console.log('row', row);
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {translations[zerothIndex].name}
        </TableCell>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {translations[zerothIndex].locale}
        </TableCell>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {translations[zerothIndex].state_province_id}
        </TableCell>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          <Label variant="soft" color={is_published === '1' ? 'success' : 'error'}>
            {is_published === '1' ? 'Published' : 'Unpublished'}
          </Label>
        </TableCell>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {/* {order} */}
        </TableCell>
        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
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
      <StateCreateEditForm
        title="Edit State"
        currentState={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={reload}
      />
    </>
  );
}
