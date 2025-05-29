import { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Avatar,
  Box,
  Switch,
  Button,
  Popover,
  TextField,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuthContext } from 'src/auth/hooks';
import { useGetGenderEnum } from 'src/api/users';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

const OverviewAssistant = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  const { genderData, genderLoading } = useGetGenderEnum();
  const [formData, setFormData] = useState({
    name: user?.user?.name || '',
    email: user?.user?.email || '',
    phone: user?.user?.phone || '',
    dob: user?.user?.dob || '',
    status: user?.user?.is_active || '',
    gender: '',
    profileUrl: user?.user?.photo_url || '',
  });

  useEffect(() => {
    if (genderData && genderData?.length && user?.user?.gender) {
      const matchedGender = genderData.find(
        (option) => option.name.toLowerCase() === user.user.gender.toLowerCase()
      )?.value;

      if (matchedGender) {
        setFormData((prev) => ({ ...prev, gender: matchedGender }));
      }
    }
  }, [genderData, user?.user?.gender]);
  const [isActive, setIsActive] = useState(user?.user?.is_active || false);

  const handleToggle = (event) => {
    setIsActive(event.target.checked);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClickSave = () => {
    router.push(paths.dashboard.assistant.edit);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        p: 4,
        minHeight: '100vh',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Card
          elevation={4}
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: '#ffffff',
          }}
        >
          <Box
            sx={{
              height: 140,
              background: 'linear-gradient(to right, #ff9a8b, #ff6a88, #ff99ac)',
              position: 'relative',
              color: 'white',
              textAlign: 'center',

              pt: 3,
            }}
          >
            <Avatar
              src={user?.user?.photo_url || '/static/images/avatar_placeholder.png'}
              sx={{
                width: 96,
                height: 96,
                border: '4px solid white',
                position: 'absolute',
                bottom: -28,
                left: '50%',
                transform: 'translateX(-50%)',
                boxShadow: 2,
                background: '#fff0f0',
              }}
            />
          </Box>

          <Box
            sx={{
              mt: 3,
              mx: 1,
              display: 'flex',
              gap: 5,
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                flex: 1,
                p: 1.8,
                borderRadius: 4,
                bgcolor: '#fff7f5',
                textAlign: 'center',
                cursor: 'default',
              }}
            >
              <Typography
                fontWeight={600}
                color="primary.main"
                sx={{ letterSpacing: 0.5, fontSize: '12px' }}
              >
                {user?.user?.name?.toUpperCase() || 'N/A'}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 1.8,
                borderRadius: 4,
                bgcolor: '#fff0f0',
                textAlign: 'center',
                cursor: 'default',
              }}
            >
              <Typography
                fontWeight={600}
                color="primary.main"
                sx={{ letterSpacing: 0.5, fontSize: '12px' }}
              >
                {user?.user?.user_type || 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 30px 1fr',
              alignItems: 'center',
              rowGap: 2,
              fontSize: '16px !important',
              color: 'black',
              mt: 4,
              p: 5,
            }}
          >
            <Typography sx={{ textAlign: 'left', fontWeight: 600, fontSize: '16px' }}>
              Gender
            </Typography>
            <Typography sx={{ textAlign: 'center', fontSize: '16px' }}>:</Typography>
            <Typography sx={{ textAlign: 'right', fontSize: '16px' }}>
              {user?.user?.gender || 'N/A'}
            </Typography>

            <Typography sx={{ textAlign: 'left', fontWeight: 600, fontSize: '16px' }}>
              DOB
            </Typography>
            <Typography sx={{ textAlign: 'center', fontSize: '16px' }}>:</Typography>
            <Typography sx={{ textAlign: 'right', fontSize: '16px' }}>
              {user?.user?.dob || 'N/A'}
            </Typography>

            <Typography sx={{ textAlign: 'left', fontWeight: 600, fontSize: '16px' }}>
              Phone
            </Typography>
            <Typography sx={{ textAlign: 'center', fontSize: '16px' }}>:</Typography>
            <Typography sx={{ textAlign: 'right', fontSize: '16px' }}>
              +971 {user?.user?.phone || 'N/A'}
            </Typography>

            <Typography sx={{ textAlign: 'left', fontWeight: 600, fontSize: '16px' }}>
              Status
            </Typography>
            <Typography sx={{ textAlign: 'center', fontSize: '16px' }}>:</Typography>
            <Typography sx={{ textAlign: 'right', fontSize: '16px' }}>
              <Switch
                checked={user?.user?.is_active}
                onChange={handleToggle}
                color="primary"
                disabled
              />
            </Typography>
          </Box>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleClickSave}
              sx={{
                color: '#ff99ac',
                px: 3,
                borderRadius: 8,
                textTransform: 'none',
                fontSize: '12px',
                '&:hover': {
                  background: 'linear-gradient(to right, #ff4e77, #ff89a1)',
                },
              }}
            >
              Edit Profile
            </Button>
            {/* <EditProfilePopover
              formData={formData}
              setFormData={setFormData}
              genderData={genderData}
            /> */}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewAssistant;
