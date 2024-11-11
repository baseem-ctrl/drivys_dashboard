import { useEffect, useState } from 'react';
import { Box, Checkbox, Tooltip, CardActions, CardContent, Grid } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import NewImagesForm from './new-image-upload-dialog';

type Props = {
  row: any;
  setSelectedImageIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedImageIds: number[];
  reload: () => void;
};

export default function ImageTableRow({
  row,
  setSelectedImageIds,
  selectedImageIds,
  reload,
}: Props) {
  const { id, name, virtual_path } = row;
  const imageUpdate = useBoolean();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(selectedImageIds?.includes(id));
  }, [selectedImageIds, id]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setIsChecked(checked);
    setSelectedImageIds((prev) => {
      if (Array.isArray(prev)) {
        return checked ? [...prev, id] : prev.filter((rowId) => rowId !== id);
      } else {
        console.error('prev is not an array', prev);
        return checked ? [id] : [];
      }
    });
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <CardActions sx={{ position: 'absolute', top: 1, right: 8 }}>
          <Tooltip title="Select Image" placement="top" arrow>
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange}
              inputProps={{ 'aria-label': 'select row' }}
            />
          </Tooltip>
        </CardActions>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <img
                onClick={imageUpdate.onTrue}
                alt={name}
                src={virtual_path}
                style={{ width: '90%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Box>

      <NewImagesForm
        currentImage={row}
        open={imageUpdate.value}
        onClose={imageUpdate.onFalse}
        reload={reload}
      />
    </>
  );
}
