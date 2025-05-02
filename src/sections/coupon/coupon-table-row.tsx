// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { ICouponItem } from 'src/types/language';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import LanguageCreateEditForm from './coupon-create-update';
import { deleteLanguage } from 'src/api/language';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ICouponItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  reload: VoidFunction;
};

export default function LanguageTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  reload,
}: Props) {
  const { t } = useTranslation();
  const {
    name,
    coupon_code,
    discount_type_id,
    use_percentage,
    value,
    starting_date,
    ending_date,
    limitation_times,
    is_active,
    categories,
    id,
    is_applicable_to_transport_fee,
  } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const discount_type_text =
    discount_type_id === 0 ? 'All' : discount_type_id === 1 ? 'Package' : 'Category';

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell>
          {name}
          {/* <Label sx={{ mb: 1, mt: 1 }} variant="soft" color="primary">
            linked to  {products?.length} products
          </Label> */}
          {discount_type_id === 1 ? (
            <Label variant="soft" color="info">
              {t('linked to')} {row?.package?.length} {t('packages')}
            </Label>
          ) : discount_type_id === 2 ? (
            <Label variant="soft" color="info">
              {t('linked to')} {categories?.length} {t('categories')}
            </Label>
          ) : (
            ''
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{coupon_code}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {is_applicable_to_transport_fee ? 'Pickup' : discount_type_text}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {use_percentage === 1 ? (
            <>{Number(value).toFixed(0)}%</>
          ) : (
            <>
              <span className="dirham-symbol">&#x00EA;</span> {value}
            </>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{starting_date}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ending_date}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{limitation_times}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label variant="soft" color={is_active === 1 ? 'success' : 'error'}>
            {is_active === 1 ? t('Active') : t('In Active')}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <LanguageCreateEditForm
        title={t('Edit Coupon')}
        updateValue={row}
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
          {t('Delete')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('Edit')}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('Delete')}
        content={t('Are you sure want to delete?')}
        onConfirm={() => {
          confirm.onFalse();
          onDeleteRow();
        }}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('Delete')}
          </Button>
        }
      />
    </>
  );
}
