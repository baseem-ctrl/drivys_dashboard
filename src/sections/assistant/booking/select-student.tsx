/* eslint-disable no-nested-ternary */
import React, { useMemo, useEffect } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  Pagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

interface Student {
  id: number;
  name: string;
  name_ar?: string;
  email?: string;
  avatarUrl?: string;
  photo_url?: string;
  is_active?: boolean;
  user_preference?: any;
  languages?: any[];
  locale?: string; // Added locale to interface
}

interface StudentStepProps {
  students: Student[];
  selectedStudentId: number | null;
  setSelectedStudentId: (id: number) => void;
  isLoading: boolean;
  setSearchTerm: (value: string) => void;
  searchTerm: string;
  setSelectedStudent: (student: Student) => void;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
}

const ITEMS_PER_PAGE = 9;

const StudentStep: React.FC<StudentStepProps> = ({
  students,
  selectedStudentId,
  setSelectedStudentId,
  isLoading,
  setSearchTerm,
  searchTerm,
  setSelectedStudent,
  totalPages: externalTotalPages,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  totalCount: externalTotalCount,
}) => {
  const { i18n, t } = useTranslation();
  const [internalPage, setInternalPage] = React.useState(0);

  // Determine if using external or internal pagination
  const useExternalPagination = externalOnPageChange !== undefined;

  const currentPage = useExternalPagination ? (externalCurrentPage || 0) : internalPage;

  // Calculate pagination for client-side
  const { paginatedStudents, totalPages, totalCount } = useMemo(() => {
    if (useExternalPagination) {
      // Use external pagination - display all students passed from parent
      return {
        paginatedStudents: students,
        totalPages: externalTotalPages || 1,
        totalCount: externalTotalCount || students.length,
      };
    }

    // Client-side pagination
    const total = students.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = students.slice(startIndex, endIndex);

    return {
      paginatedStudents: paginated,
      totalPages: pages,
      totalCount: total,
    };
  }, [students, currentPage, useExternalPagination, externalTotalPages, externalTotalCount]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (!useExternalPagination) {
      setInternalPage(0);
    }
  }, [searchTerm, useExternalPagination]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (useExternalPagination && externalOnPageChange) {
      externalOnPageChange(0);
    } else {
      setInternalPage(0);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newPage = page - 1; // Convert to 0-indexed

    if (useExternalPagination && externalOnPageChange) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box>

      {/* Search Bar */}
      <Box mb={3} sx={{ width: '100%', maxWidth: 500 }}>
        <TextField
          placeholder={t('search') || 'Search...'}
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

      </Box>


      {/* Student Cards Grid */}
      <Grid container spacing={2}>
        {isLoading ? (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress />
          </Grid>
        ) : paginatedStudents.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
              <Typography>{t('no_students_found') || 'No students found'}</Typography>
            </Box>
          </Grid>
        ) : (
          paginatedStudents.map((student) => {
            const studentName =
              i18n.language === 'ar'
                ? student?.name_ar || student?.name
                : student?.name;
            const gear = student?.user_preference?.gear;
            const vehicleCategory =
              student?.user_preference?.vehicle_type?.category_translations?.find(
                (trans: any) => trans?.locale?.toLowerCase() === i18n.language.toLowerCase()
              )?.name ||
              student?.user_preference?.vehicle_type?.category_translations?.[0]?.name ||
              'N/A';

            // FIXED: Get language from student.locale directly or from languages array
            const languages = student?.locale
              ? student.locale
              : student?.languages?.length > 0
                ? student.languages
                    .map((lang: any) => lang.locale)
                    .filter(Boolean)
                    .join(', ')
                : 'N/A';

            return (
              <Grid item xs={12} sm={6} md={4} lg={4} key={student.id}>
                <Card
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setSelectedStudent(student);
                  }}
                  sx={{
                    borderRadius: 3,
                    border:
                      student.id === selectedStudentId
                        ? '3px solid #f97316'
                        : '1px solid #e5e7eb',
                    boxShadow:
                      student.id === selectedStudentId
                        ? '0 4px 12px rgba(249, 115, 22, 0.2)'
                        : '0 1px 3px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Avatar */}
                    <Avatar
                      src={student.photo_url || student.avatarUrl}
                      sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto 16px',
                        bgcolor: '#f3f4f6',
                        color: '#6b7280',
                        fontSize: 28,
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(studentName)}
                    </Avatar>

                    {/* Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#1f2937',
                        mb: 0.5,
                        minHeight: 24,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {studentName || t('n/a')}
                    </Typography>

                    {/* Email */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 13,
                        color: '#6b7280',
                        mb: 2,
                        minHeight: 20,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {student.email || t('n/a')}
                    </Typography>

                    {/* Manual/Automatic Badges */}
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      mb={2}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ minHeight: 32 }}
                    >
                      {(gear === 'Manual' ||
                        gear === 1 ||
                        gear?.toLowerCase?.() === 'manual') && (
                        <Chip
                          label={t('manual') || 'Manual'}
                          size="small"
                          sx={{
                            bgcolor: '#3b82f6',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 11,
                            height: 26,
                          }}
                        />
                      )}
                      {(gear === 'Automatic' ||
                        gear === 0 ||
                        gear?.toLowerCase?.() === 'automatic') && (
                        <Chip
                          label={t('automatic') || 'Automatic'}
                          size="small"
                          sx={{
                            bgcolor: '#f97316',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 11,
                            height: 26,
                          }}
                        />
                      )}
                    </Stack>

                    {/* Spacer to push content to bottom */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Vehicle Category */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        minHeight: 20,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 13, color: '#6b7280' }}
                      >
                        {t('Vehicle Category') || 'Vehicle category'}:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 13,
                          color: '#1f2937',
                          fontWeight: 500,
                          maxWidth: '50%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {vehicleCategory}
                      </Typography>
                    </Box>

                    {/* Language */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: 20,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 13, color: '#6b7280' }}
                      >
                        {t('language') || 'Language'}:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 13,
                          color: '#1f2937',
                          fontWeight: 500,
                          maxWidth: '50%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {languages}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            mt: 4,
            pb: 2,
          }}
        >
          {/* Page Info */}
          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: 14 }}>
            {t('page') || 'Page'} {currentPage + 1} {t('of') || 'of'} {totalPages}
            {' • '}
            {t('showing') || 'Showing'} {paginatedStudents.length} {t('of') || 'of'} {totalCount}
          </Typography>

          {/* Pagination Controls */}
          <Pagination
            count={totalPages}
            page={currentPage + 1}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: 14,
                fontWeight: 500,
                minWidth: 40,
                height: 40,
              },
              '& .Mui-selected': {
                bgcolor: '#f97316 !important',
                color: 'white',
                '&:hover': {
                  bgcolor: '#ea580c !important',
                },
              },
              '& .MuiPaginationItem-root:hover': {
                bgcolor: '#fef3c7',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default StudentStep;
