import React, { useState, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  Box,
  Link,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Student {
  id: number;
  name: string;
  email?: string;
  avatarUrl?: string;
  photo_url?: string;
}

interface StudentStepProps {
  students: Student[];
  selectedStudentId: number | null;
  setSelectedStudentId: (id: number) => void;
  isLoading: boolean;
  setSearchTerm: any;
  searchTerm: any;
  setSelectedStudent: any;
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
      {/* Search Bar */}
      <Box mb={2} sx={{ width: '60%' }}>
        <TextField
          label="Search Students"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end" aria-label="clear search">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {/* Student Grid */}
      <Grid container spacing={2}>
        {isLoading ? (
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <CircularProgress />
          </Grid>
        ) : (
          students.map((student) => (
            <Grid item xs={12} sm={6} md={6} key={student.id}>
              <Card
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setSelectedStudent(student);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                  border:
                    student.id === selectedStudentId ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  boxShadow: '0px 1px 6px rgba(0,0,0,0.1)',
                }}
              >
                <Avatar
                  src={student.photo_url || student.avatarUrl}
                  sx={{
                    width: 56,
                    height: 56,
                    marginRight: 2,
                    bgcolor: '#f5f5f5',
                    fontSize: 18,
                    color: '#333',
                  }}
                >
                  {getInitials(student.name)}
                </Avatar>

                <Box flexGrow={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {student.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.email || 'N/A'}
                  </Typography>
                  <Link
                    underline="none"
                    sx={{
                      mt: 1,
                      display: 'inline-block',
                      color: '#1976d2',
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    View
                  </Link>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
};

export default StudentStep;
