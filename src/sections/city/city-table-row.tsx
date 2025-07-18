import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import { useBoolean } from 'src/hooks/use-boolean';
import { ILanguageItem } from 'src/types/language';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CityCreateEditForm from './city-create-update';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ILanguageItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  reload: VoidFunction;
  selectedCityIds: string[];
  handleCheckboxClick: (event: React.ChangeEvent<HTMLInputElement>, cityId: string) => void;
};

export default function CityTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  reload,
  handleCheckboxClick,
}: Props) {
  const { t, i18n } = useTranslation();
  const { is_published, display_order, city_translations, max_slot } = row;
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const zerothIndex = 0;

  const handleRowClick = (cityId: string) => {
    onSelectRow();
    // navigate(paths.dashboard.system.viewDetails(cityId));
  };
  const handleCheckboxClickWrapper = (event: React.MouseEvent) => {
    // Prevent the click event from propagating to the row click
    event.stopPropagation();
    handleCheckboxClick(event, row.id);
  };
  const matchedTranslation =
    city_translations.find((t) => t.locale.toLowerCase() === i18n.language.toLowerCase()) ||
    city_translations[0] ||
    t('n/a');
  return (
    <>
      <TableRow hover selected={selected}>
        {/* Uncomment if you want a checkbox for selection */}
        <TableCell padding="checkbox">
          <Checkbox onChange={handleCheckboxClickWrapper} checked={selected} />
        </TableCell>

        <TableCell onClick={() => handleRowClick(city_translations[zerothIndex].city_id)}>
          {matchedTranslation.name}
        </TableCell>
        <TableCell onClick={() => handleRowClick(city_translations[zerothIndex].city_id)}>
          {matchedTranslation.locale}
        </TableCell>

        <TableCell onClick={() => handleRowClick(city_translations[zerothIndex].city_id)}>
          {max_slot ?? t('n/a')}
        </TableCell>

        <TableCell onClick={() => handleRowClick(city_translations[zerothIndex].city_id)}>
          <Label
            variant="soft"
            color={is_published === 1 ? 'success' : 'error'} // Using color based on the published status
            style={{ cursor: 'pointer' }} // Adding pointer cursor to indicate it's clickable
          >
            {is_published === 1 ? t('Published') : t('Unpublished')}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
