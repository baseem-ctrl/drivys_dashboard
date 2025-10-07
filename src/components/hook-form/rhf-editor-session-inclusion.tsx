import { Controller, useFormContext } from 'react-hook-form';
import { TextField, FormHelperText, Box } from '@mui/material';

interface Props {
  name: string;
  label?: string;
  helperText?: string;
  minRows?: number;
}

export default function RHFMultilineTextField({ name, label, helperText, minRows = 3 }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <TextField
            {...field}
            fullWidth
            multiline
            minRows={minRows}
            label={label}
            error={!!error}
          />
          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error.message : helperText}</FormHelperText>
          )}
        </Box>
      )}
    />
  );
}
