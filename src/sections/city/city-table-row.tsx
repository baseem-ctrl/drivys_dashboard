import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { ILanguageItem } from 'src/types/language';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CityCreateEditForm from './city-create-update';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ILanguageItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  reload: VoidFunction;
};

export default function CityTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  reload,
}: Props) {
  const { is_published, display_order, city_translations } = row;
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const handleRowClick = (cityId: string) => {
    onSelectRow();
    // navigate(paths.dashboard.system.viewDetails(cityId));
  };

  return (
    <>
      {city_translations.map((translation, index) => (
        <TableRow hover selected={selected} key={index}>
          {/* Uncomment if you want a checkbox for selection */}
          {/* <TableCell padding="checkbox">
            <Checkbox checked={selected} onClick={onSelectRow} />
          </TableCell> */}

          <TableCell onClick={() => handleRowClick(translation.city_id)}>
            {translation.name}
          </TableCell>
          <TableCell
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => handleRowClick(translation.city_id)}
          >
            {translation.locale}
          </TableCell>
          <TableCell
            sx={{ display: 'flex', alignItems: 'center' }}
            onClick={() => handleRowClick(translation.city_id)}
          >
            {translation.city_id}
          </TableCell>
          <TableCell
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => handleRowClick(translation.city_id)}
          >
            <Label variant="soft" color={is_published === '1' ? 'success' : 'error'}>
              {is_published === '1' ? 'Published' : 'Unpublished'}
            </Label>
          </TableCell>
          <TableCell
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => handleRowClick(translation.city_id)}
          >
            {display_order}
          </TableCell>
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}

      <CityCreateEditForm
        title="Edit City"
        currentCity={row}
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
