// @mui
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import MenuItem from '@mui/material/MenuItem';
import { ConfirmDialog } from 'src/components/custom-dialog';
import UserQuickEditForm from './user-quick-edit-form';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import NewImagesForm from './new-image-upload-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  setSelectedImageIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedImageIds: any;
  reload: any;
};

export default function ImageTableRow({ row, setSelectedImageIds, selectedImageIds, reload }: Props) {
  const { name, is_active, id, profile_image, user_phone, user_type } = row;
  const imageUpdate = useBoolean();

  const [isChecked, setIsChecked] = useState(false);

  // Update the checkbox state based on selectedImageIds
  useEffect(() => {
    setIsChecked(selectedImageIds.includes(id));
  }, [selectedImageIds, id]);


  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    setSelectedImageIds((prev) => (checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)));
  };



  return (
    <>
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <CardActions
          sx={{
            position: 'absolute',
            top: 1,
            right: 8,
          }}
        >
          <Tooltip title="Select Image" placement="top" arrow>
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange}
              inputProps={{ 'aria-label': 'select row' }}
            />
          </Tooltip>
        </CardActions>
        <CardContent >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <img onClick={() => imageUpdate.onTrue()} alt={name} src={row?.virtual_path} style={{ width: '90%', height: '100%', objectFit: "contain", cursor: 'pointer' }} />
            </Grid>

          </Grid>
        </CardContent>
      </Box>



      <NewImagesForm currentImage={row} open={imageUpdate.value} onClose={imageUpdate.onFalse} reload={reload} />
    </>
  );
}
