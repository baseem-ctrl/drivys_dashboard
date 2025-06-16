import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { Controller, useFormContext } from 'react-hook-form';

interface RHFDatePickerProps
  extends Omit<DatePickerProps<any>, 'value' | 'onChange' | 'renderInput'> {
  name: string;
  label: string;
}

export default function RHFDatePicker({ name, label, ...other }: RHFDatePickerProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          label={label}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message,
            },
          }}
          {...other}
        />
      )}
    />
  );
}
