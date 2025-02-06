import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { InputAdornment, Button } from '@mui/material';
import { useRef } from 'react';

type Props = Omit<TextFieldProps, 'type'> & {
  name: string;
  label?: string;
  helperText?: string;
};

export default function RHFFileUpload({ name, label, helperText, ...other }: Props) {
  const { control } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <TextField
            ref={fileInputRef}
            type="file"
            // hidden
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              field.onChange(file); // Update the field value
            }}
          />
          {error && (
            <div style={{ marginTop: '4px', fontSize: '14px', color: '#d32f2f' }}>
              {error.message}
            </div>
          )}
        </>
      )}
    />
  );
}
