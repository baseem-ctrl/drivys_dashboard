import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { ILanguageItem } from 'src/types/language';
import Label from 'src/components/label';
import moment from 'moment';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import PickupCreateEditForm from './pickup-new-edit-form';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ILanguageItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  reload: VoidFunction;
};

export default function PickupTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  reload,
}: Props) {
  const { city_id, end_date, end_time, start_date, start_time, status } = row;
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const router = useRouter();

  const formattedStartDate = moment(start_date).format('YYYY-MM-DD');
  const formattedStartTime = moment.utc(start_time).format('HH:mm A');
  const formattedEndDate = moment(end_date).format('YYYY-MM-DD');
  const formattedEndTime = moment.utc(end_time).format('HH:mm A');

  const handleClick = () => {
    router.push(paths.dashboard.system.viewDetails(city_id));
  };
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell
          onClick={handleClick}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {city_id}
        </TableCell>
        <TableCell>{formattedStartDate}</TableCell>
        <TableCell>{formattedStartTime}</TableCell>
        <TableCell>{formattedEndDate}</TableCell>
        <TableCell>{formattedEndTime}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={status === true ? 'success' : 'error'}
            style={{ cursor: 'pointer' }}
          >
            {status === true ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>
        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <PickupCreateEditForm
        title="Edit Pickup"
        currentPickup={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={reload}
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
    </>
  );
}
