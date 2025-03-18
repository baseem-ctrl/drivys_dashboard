// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
//
import { ConfirmDialogProps } from './types';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  onConfirm,
  ...other
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && <DialogContent sx={{ typography: 'body2' }}> {content} </DialogContent>}

      <DialogActions>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {t("Delete")}
        </Button>

        <Button variant="outlined" color="inherit" onClick={onClose}>
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
