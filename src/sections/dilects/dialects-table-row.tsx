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
import DilectCreateEditForm from './dialects-create-update';
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

export default function DilectTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  reload,
}: Props) {
  const { language_name, dialect_name, is_published, order, description, keywords } = row;
  const { t } = useTranslation();
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const handleRowClick = (rowId) => {
    onSelectRow(rowId);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{dialect_name || 'N/A'}</TableCell>
        <TableCell>{language_name}</TableCell>
        <TableCell>{description}</TableCell>
        <TableCell>{keywords}</TableCell>

        <TableCell>{order}</TableCell>
        <TableCell>
          <Label variant="soft" color={is_published === 1 ? 'success' : 'error'}>
            {is_published === 1 ? t('Published') : t('Unpublished')}
          </Label>
        </TableCell>
        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <DilectCreateEditForm
        title="Edit Dialect"
        currentDialect={row}
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
          {t("Delete")}
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t("Edit")}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t("Delete")}
        content={t("Are you sure you want to delete?")}
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
