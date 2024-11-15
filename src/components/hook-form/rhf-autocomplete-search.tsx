import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField from '@mui/material/TextField';
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
import { useEffect } from 'react';
import Iconify from 'src/components/iconify';
import { IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// ----------------------------------------------------------------------

interface Props<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: React.ReactNode;
  defaultValue?: any;
  setSearchOwner?: any;
  loading?: boolean;
}

export default function RHFAutocompleteSearch<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>({
  name,
  label,
  placeholder,
  helperText,
  defaultValue,
  setSearchOwner,
  loading = false,
  ...other
}: Omit<Props<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'>) {
  const { control, setValue } = useFormContext();
  const router = useRouter();
  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue, { shouldValidate: true });
    }
  }, [defaultValue]);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          loading={loading}
          renderOption={(props, option: any) => {
            return (
              <li {...props}>
                {option.label}
                {/* {option.value} */}
              </li>
            );
          }}
          onChange={(event, newValue) => {
            setValue(name, newValue, { shouldValidate: true });
          }}
          renderInput={(params) => (
            <TextField
              label={label}
              placeholder={placeholder}
              onChange={(event, newValue) => {
                setTimeout(() => {
                  setSearchOwner(event.target.value);
                }, 2000);
              }}
              error={!!error}
              helperText={error ? error?.message : helperText}
              {...params}
            />
          )}
          {...other}
        />
      )}
    />
  );
}
//---------------------------------------------------------------------------------------------------
