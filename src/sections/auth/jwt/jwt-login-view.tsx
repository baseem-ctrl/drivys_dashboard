import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { useSearchParams, useRouter } from 'src/routes/hooks';
// config
import { PATH_AFTER_LOGIN, PATH_AFTER_LOGIN_COLLECTOR } from 'src/config-global';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, MenuItem, Select } from '@mui/material';
import Logo from 'src/components/logo';
import { CollectorLogin } from 'src/api/auth';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const password = useBoolean();
  const theme = useTheme();

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event) => {
    setSelectedTab(event.target.value);
  };

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (selectedTab === 0) {
        await login?.(data.email, data.password, 'ADMIN');
      } else if (selectedTab === 1) {
        await login?.(data.email, data.password, 'SCHOOL_ADMIN');
      } else {
        await login?.(data.email, data.password, 'COLLECTOR');
      }
      if (localStorage.getItem('user_type') === 'COLLECTOR') {
        console.log('PATH_AFTER_LOGIN_COLLECTOR', PATH_AFTER_LOGIN_COLLECTOR);
        // alert('Collector');
        // router.push(PATH_AFTER_LOGIN_COLLECTOR);
      } else {
        // router.push(returnTo || PATH_AFTER_LOGIN);
      }
    } catch (error) {
      console.error(error);
      reset(defaultValues);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">
        Sign in to <span style={{ color: '#CF5A0D' }}>Drivys</span>
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="email" label="Email address" />

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );
  const renderLogo = (
    <Logo
      sx={{
        // zIndex: 9,
        // position: 'absolute',
        margin: 0,
      }}
    />
  );
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}
      <Alert severity="info" sx={{ mb: 3 }}>
        Use email : <strong>admin@drivys.com</strong> / password :<strong> mvp@12345</strong>
      </Alert>
      <Box sx={{ borderColor: 'divider', mb: 2, width: '100%' }}>
        <Select
          fullWidth
          value={selectedTab}
          onChange={handleTabChange}
          displayEmpty
          sx={{
            backgroundColor: '#fff',
            color: '#000',
            fontWeight: '600',
            height: 56,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#cf5a0d',
            },
            '& .MuiSelect-select': {
              padding: '14px',
            },
          }}
        >
          <MenuItem value={0}>Login As Admin</MenuItem>
          <MenuItem value={1}>Login As School</MenuItem>
          <MenuItem value={2}>Login As Collector</MenuItem>
        </Select>
      </Box>
      {renderForm}
    </FormProvider>
  );
}
