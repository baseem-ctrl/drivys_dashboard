import { forwardRef } from 'react';
// @mui
import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';
// routes
import { RouterLink } from 'src/routes/components';
import LogoSVG from '../../../public/logo/logo_single.png';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const is_user_type_school_admin = localStorage.getItem('user_type') === 'SCHOOL_ADMIN';
    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          marginRight: '20px',
          display: 'inline-flex',
          ...sx,
        }}
        {...other}
      >
        <img src={LogoSVG} alt="logo" />
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href={'/'} sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
