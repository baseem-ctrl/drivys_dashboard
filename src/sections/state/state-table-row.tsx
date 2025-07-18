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
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const { id, is_published, order, translations, city } = row;
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const zerothIndex = 0;
  const handleRowClick = (stateId: string) => {
    setProvinceID(stateId);
    onSelectRow();
  };
  const activeTranslation =
    translations.find((t: any) => t.locale?.toLowerCase() === i18n.language.toLowerCase()) ||
    translations[0];
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {activeTranslation.name}
        </TableCell>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {activeTranslation.locale}
        </TableCell>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {city?.city_translations?.find(
            (c: any) => c.locale?.toLowerCase() === i18n.language.toLowerCase()
          )?.name ||
            city?.city_translations?.[0]?.name ||
            t('n/a')}
        </TableCell>

        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          <Label variant="soft" color={is_published === 1 ? 'success' : 'error'}>
            {is_published === 1 ? t('Published') : t('Unpublished')}
          </Label>
        </TableCell>
        <TableCell onClick={() => handleRowClick(translations[zerothIndex].state_province_id)}>
          {order}
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
        content={t('Are you sure you want to delete?')}
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
      <StateCreateEditForm
        title="Edit Area"
        currentState={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        reload={reload}
      />
    </>
  );
}
