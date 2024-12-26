// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fShortenNumber } from 'src/utils/format-number';
// types
import { IUserCard } from 'src/types/user';
// _mock
import { _socials } from 'src/_mock';
// assets
import { AvatarShape } from 'src/assets/illustrations';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Link } from '@mui/material';
// ----------------------------------------------------------------------

type Props = {
  user: any;
};

export default function UserCard({ user }: Props) {
  const theme = useTheme();

  const router = useRouter();

  const {
    id,
    name,
    photo_url,
    dob,
    country_code,
    email,
    gender,
    is_active,
    user_preference,
    phone,
    locale,
  } = user;

  return (
    <Card sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
            bottom: -26,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={name}
          src={photo_url}
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            left: 0,
            right: 0,
            bottom: -32,
            mx: 'auto',
            position: 'absolute',
          }}
        />

        <Image
          src={photo_url}
          alt={photo_url}
          ratio="16/9"
          overlay={alpha(theme.palette.grey[900], 0.48)}
        />
      </Box>
      <Stack>
        <Link
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push(paths.dashboard.user.details(id))}
        >
          <ListItemText
            sx={{ mt: 7, mb: 1, cursor: 'pointer' }}
            primary={name}
            secondary={email}
            primaryTypographyProps={{ typography: 'subtitle1' }}
            secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
          />
        </Link>

        {locale !== 'undefined' && locale && (
          <Label color="info">{(locale === 'undefined' ? '' : locale) ?? 'N/A'}</Label>
        )}
      </Stack>

      {/* <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2.5 }}>
        {_socials.map((social) => (
          <IconButton
            key={social.name}
            sx={{
              color: social.color,
              '&:hover': {
                bgcolor: alpha(social.color, 0.08),
              },
            }}
          >
            <Iconify icon={social.icon} />
          </IconButton>
        ))}
      </Stack> */}

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        sx={{ py: 3, typography: 'subtitle1' }}
      >
        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Date of birth
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={{ mb: 0.5, color: 'text.secondary', fontWeight: '700' }}
          >
            {dob?.split('T')[0]}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Phone
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={{ mb: 0.5, color: 'text.secondary', fontWeight: '700' }}
          >
            {country_code + '-' + phone}
          </Typography>
        </div>

        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Gender
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={{ mb: 0.5, color: 'text.secondary', fontWeight: '700' }}
          >
            {gender}
          </Typography>
        </div>
      </Box>
    </Card>
  );
}
