import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface Student {
  id: number;
  name: string;
  email?: string;
  avatarUrl?: string;
  photo_url?: string;
  is_active?: boolean;
}

interface StudentStepProps {
  students: Student[];
  selectedStudentId: number | null;
  setSelectedStudentId: (id: number) => void;
  isLoading: boolean;
  setSearchTerm: (value: string) => void;
  searchTerm: string;
  setSelectedStudent: (student: Student) => void;
}

const StudentStep: React.FC<StudentStepProps> = ({
  students,
  selectedStudentId,
  setSelectedStudentId,
  isLoading,
  setSearchTerm,
  searchTerm,
  setSelectedStudent,
}) => {
  const { i18n } = useTranslation();

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      <Box mb={3} sx={{ width: '100%', maxWidth: 500 }}>
        <TextField
          label="Search Students"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress />
          </Grid>
        ) : (
          students.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setSelectedStudent(student);
                }}
                sx={{
                  borderRadius: 5,
                  boxShadow: 4,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  border: student.id === selectedStudentId ? '2px solid #e36c1e' : 'none',
                }}
              >
                <Box
                  sx={{
                    height: 100,
                    background: 'linear-gradient(to right, #e36c1e, #e99562)',
                    position: 'relative',
                  }}
                >
                  <Chip
                    label={student?.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    variant="outlined"
                    sx={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      color: student?.is_active ? '#388e3c' : '#d32f2f',
                      fontWeight: 600,
                      borderColor: 'rgba(255,255,255,0.5)',
                    }}
                  />

                  <Avatar
                    src={student.photo_url || student.avatarUrl}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '3px solid white',
                      position: 'absolute',
                      bottom: -40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#eee',
                      fontSize: 24,
                      color: '#444',
                    }}
                  >
                    {getInitials(student.name)}
                  </Avatar>
                </Box>

                <CardContent sx={{ mt: 5, textAlign: 'center' }}>
                  <Typography fontWeight={600} sx={{ fontSize: '16px' }}>
                    {student.name || 'N/A'}
                  </Typography>
                  <Typography sx={{ fontSize: '13px' }} color="text.secondary">
                    {student.email || 'N/A'}
                  </Typography>

                  <Divider
                    sx={{
                      my: 2,
                      borderBottomWidth: 2,
                      borderColor: '#1976d2',
                      width: '80%',
                      mx: 'auto',
                    }}
                  />

                  <Stack spacing={1} sx={{ fontSize: '13px', textAlign: 'left', px: 2 }}>
                    <Typography sx={{ fontSize: '13px', mx: 'auto' }}>
                      <strong>Type:</strong> {student?.user_preference?.gear || 'N/A'}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', mx: 'auto' }}>
                      <strong>Languages:</strong>{' '}
                      {student?.languages?.length > 0
                        ? student?.languages
                            .map((lang: any) => lang.dialect?.language_name)
                            .filter(Boolean)
                            .join(', ')
                        : 'N/A'}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', mx: 'auto' }}>
                      <strong>Category:</strong>{' '}
                      {student?.user_preference?.vehicle_type?.category_translations?.find(
                        (t) => t?.locale?.toLowerCase() === i18n.language.toLowerCase()
                      )?.name ||
                        student?.user_preference?.vehicle_type?.category_translations?.[0]?.name ||
                        'N/A'}{' '}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
};

export default StudentStep;
