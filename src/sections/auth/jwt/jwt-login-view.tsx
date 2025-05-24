import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'src/components/snackbar';
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
import { CollectorLogin, ForgotPassword, VerifyOTP } from 'src/api/auth';
import emailInboxIcon from 'src/assets/icons/email-inbox-icon';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

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
    password: showOtpField ? Yup.string() : Yup.string().required('Password is required'),
    otp: showOtpField ? Yup.string().required('OTP is required') : Yup.string(),
    new_password: isOtpVerified ? Yup.string().required('New Password is required') : Yup.string(),
  });

  const defaultValues = {
    email: '',
    password: '',
    otp: '',
    new_password: '',
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
      } else if (selectedTab === 2) {
        await login?.(data.email, data.password, 'COLLECTOR');
      } else {
        await login?.(data.email, data.password, 'ASSISTANT');
      }

      const userType = localStorage.getItem('user_type');

      if (userType === 'COLLECTOR') {
        router.push(PATH_AFTER_LOGIN_COLLECTOR);
      } else if (userType === 'ASSISTANT') {
        router.push(PATH_AFTER_LOGIN_ASSISTANT);
      } else {
        router.push(returnTo || PATH_AFTER_LOGIN);
      }

      window.location.reload();
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
  const handleClickForgotPassword = async (data: any) => {
    try {
      let userType = '';

      if (selectedTab === 0) {
        userType = 'ADMIN';
      } else if (selectedTab === 1) {
        userType = 'SCHOOL_ADMIN';
      } else if (selectedTab === 2) {
        userType = 'COLLECTOR';
      } else {
        userType = 'ASSISTANT';
      }
      const mapRole = {
        email: data.email,
        user_type: userType,
      };
      const response = await ForgotPassword(mapRole);
      if (response.status === 'success') {
        enqueueSnackbar('OTP Sent to your Email!', {
          variant: 'success',
        });
        setShowOtpField(true);
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const handleVerifyOTP = async (data: any) => {
    try {
      let userType = '';

      if (selectedTab === 0) {
        userType = 'ADMIN';
      } else if (selectedTab === 1) {
        userType = 'SCHOOL_ADMIN';
      } else if (selectedTab === 2) {
        userType = 'COLLECTOR';
      } else {
        userType = 'ASSISTANT';
      }
      const mapRole = {
        email: data.email,
        user_type: userType,
        otp_code: data?.otp,
        new_password: data?.new_password,
      };
      const response = await VerifyOTP(mapRole);
      if (response.status === 'success') {
        enqueueSnackbar('OTP Verified successfully!', {
          variant: 'success',
        });
        setShowOtpField(false);
        setIsOtpVerified(false);
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };
  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <RHFTextField name="email" label="Email address" disabled={showOtpField} />
      {!showOtpField && (
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
      )}

      {showOtpField && <RHFTextField name="otp" label="Enter OTP" />}
      {isOtpVerified && <RHFTextField name="new_password" label="Enter New Password" />}

      <Link
        variant="body2"
        color="inherit"
        underline="always"
        sx={{
          alignSelf: 'flex-end',
          cursor: 'pointer',
          transition: 'color 0.3s',
          '&:hover': {
            color: '#cf5a0d',
            textDecoration: 'underline',
          },
        }}
        onClick={() => handleClickForgotPassword(methods.getValues())}
      >
        Forgot password?
      </Link>

      {!showOtpField && (
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
      )}
      {showOtpField && !isOtpVerified && (
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="button"
          variant="contained"
          onClick={() => setIsOtpVerified(true)}
        >
          Verify OTP
        </LoadingButton>
      )}

      {isOtpVerified && (
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="button"
          variant="contained"
          onClick={() => handleVerifyOTP(methods.getValues())}
        >
          Set New Password
        </LoadingButton>
      )}
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
      {/* <Alert severity="info" sx={{ mb: 3 }}>
        Use email : <strong>admin@drivys.com</strong> / password :<strong> mvp@12345</strong>
      </Alert> */}
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
          <MenuItem value={3}>Login As Assistant</MenuItem>
        </Select>
      </Box>
      {renderForm}
    </FormProvider>
  );
}
