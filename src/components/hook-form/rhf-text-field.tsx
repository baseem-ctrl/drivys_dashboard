import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { InputAdornment } from '@mui/material';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
  borderRadius?: string;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
};

export default function RHFTextField({
  name,
  borderRadius,
  maxLength,
  helperText,
  type,
  prefix,
  suffix,
  ...other
}: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          InputProps={{
            ...(prefix
              ? {
                  startAdornment: <InputAdornment position="start">{prefix}</InputAdornment>,
                }
              : {}),
            ...(suffix
              ? {
                  endAdornment: <InputAdornment position="start">{suffix}</InputAdornment>,
                }
              : {}),
            ...(!borderRadius
              ? {}
              : {
                  sx: {
                    borderRadius: borderRadius, // Apply borderRadius conditionally
                    paddingBottom: '2px',
                  },
                }),
          }}
          inputProps={{
            maxLength: maxLength,
          }}
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}
