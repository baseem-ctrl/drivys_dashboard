import { useState, useCallback } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useFormContext, Controller } from 'react-hook-form';
import FormHelperText from '@mui/material/FormHelperText';
import { UploadAvatar, UploadProps } from '../upload';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

interface Props extends Omit<UploadProps, 'file'> {
  name: string;
  aspect?: number;
}

export function RHFUploadAvatarWithCrop({ name, aspect = 1, ...other }: Props) {
  const { control, setValue } = useFormContext();
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setOpen(true);
      });
      reader.readAsDataURL(file);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setImageSrc(null);
    setCrop(undefined);
  };

  const handleSave = () => {
    if (imageRef && completedCrop) {
      getCroppedImg(imageRef, completedCrop).then((croppedImage) => {
        setValue(name, croppedImage);
        handleClose();
      });
    }
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div>
            <UploadAvatar error={!!error} file={field.value} onDrop={handleDrop} {...other} />

            {!!error && (
              <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                {error.message}
              </FormHelperText>
            )}
          </div>
        )}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Crop Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                  ref={setImageRef}
                  src={imageSrc}
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  alt="Crop preview"
                />
              </ReactCrop>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

async function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Could not create canvas context'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      },
      'image/jpeg',
      0.9
    );
  });
}
