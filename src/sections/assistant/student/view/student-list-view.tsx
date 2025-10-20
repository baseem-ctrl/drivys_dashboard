import { useState, useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import {
  Box,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Typography,
  MenuItem,
  Select,
  TableHead,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useGetRevenueReportsDownload } from 'src/api/reportDownload';

import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types

import { useGetAllLanguage } from 'src/api/language';
import { useAuthContext } from 'src/auth/hooks';
import { useGetBookingReports, useGetRevenueReports } from 'src/api/reportPreview';
import { useTranslation } from 'react-i18next';
import StudentRow from '../student-table-row';
import StudentFilter from '../student-filters';
import { useGetStudentList } from 'src/api/assistant';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function StudentListView() {
  const { user } = useAuthContext();
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 15 });
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const openFilters = useBoolean();
  const [tableData, setTableData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [viewMode, setViewMode] = useState('table');
  const [localeFilter, setLocaleFilter] = useState('');
  const [searchTermStudent, setSearchTermStudent] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(undefined);
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    category_id?: any;
  }>({});

  const TABLE_HEAD = [
    { id: 'id', label: '#ID', width: 100 },
    { id: 'name', label: t('name'), width: 200 },
    { id: 'school-revenue', label: t('preferred_language'), width: 200 },
    { id: 'email', label: t('email'), width: 200 },
    { id: 'phone', label: t('Phone'), width: 200 },
    { id: 'active', label: t('active'), width: 200 },
  ];

  const { students, studentListLoading, totalStudentPages, revalidateStudentList } =
    useGetStudentList({
      page: table.page,
      limit: table.rowsPerPage,
      search: searchTermStudent,
    });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const { language } = useGetAllLanguage(0, 1000);

  const localeOptions = (language || []).map((lang) => ({
    value: lang.language_culture,
    label: lang.name,
  }));

  useEffect(() => {
    if (students?.length) {
      setTableData(students);
    } else {
      setTableData([]);
    }
  }, [students]);

  // Filter data based on booking status
  useEffect(() => {
    if (!tableData.length) {
      setFilteredData([]);
      return;
    }

    let filtered = [...tableData];

    // Apply booking status filter
    if (bookingStatusFilter) {
      filtered = filtered.filter((student) => {
        if (bookingStatusFilter === 'active') {
          return student.is_active === true || student.is_active === 1;
        }
        if (bookingStatusFilter === 'inactive') {
          return student.is_active === false || student.is_active === 0;
        }
        return true;
      });
    }

    setFilteredData(filtered);
  }, [tableData, bookingStatusFilter]);

  const handleRowClick = (row) => {
    // setRowId(row.id);
    // // setViewMode('detail');
    //No Need on click
  };

  const handleFilters = useCallback(
    // (name: string) => {
    //   table.onResetPage();
    //   setFilters((prevState) => ({
    //     ...prevState,
    //     [name]: value,
    //   }));
    // },
    [table]
  );

  const handleClickNewStudent = () => {
    router.push(paths.dashboard.assistant.student.addNew);
  };

  const handleOrderChange = (event) => {
    const value = event.target.value;

    if (value === '') {
      setSelectedOrder(undefined);
      setLocaleFilter('');
      // setFilters(defaultFilters);
    } else {
      setSelectedOrder(value);
    }
  };

  const handleLocaleFilterChange = (locale: string) => {
    setLocaleFilter(locale);
  };

  // const canReset = !isEqual(defaultFilters, filters);

  const handleResetFilters = useCallback(() => {
    setSelectedOrder(undefined);
    setLocaleFilter('');
    setBookingStatusFilter('');
    // setFilters(defaultFilters);
  }, []);

  const handleClearSearch = () => {
    setSearchTermStudent('');
  };

  const handleBookingStatusChange = (event) => {
    setBookingStatusFilter(event.target.value);
    table.onResetPage(); // Reset to first page when filter changes
  };

  // Use filtered data for display
  const displayData = bookingStatusFilter ? filteredData : tableData;

  return (
    <Box sx={{ p: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t('Students')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Home')} / <span style={{ color: '#ff6b35' }}>{t('Students')}</span>
        </Typography>
      </Box>

      {/* White Card Container */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('student_list')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              placeholder={t('search_students') || 'Search...'}
              size="small"
              value={searchTermStudent}
              onChange={(e) => setSearchTermStudent(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTermStudent && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fafafa',
                },
              }}
            />

            {/* Booking Status Filter */}
            <Select
              size="small"
              value={bookingStatusFilter}
              onChange={handleBookingStatusChange}
              displayEmpty
              sx={{
                minWidth: 150,
                bgcolor: '#fafafa',
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              <MenuItem value="">{t('Booking Status')}</MenuItem>
              <MenuItem value="active">{t('Active')}</MenuItem>
              <MenuItem value="inactive">{t('Inactive')}</MenuItem>
            </Select>

            {/* Clear Filter Button (optional) */}
            {bookingStatusFilter && (
              <IconButton size="small" onClick={() => setBookingStatusFilter('')}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}

            {/* Add New Student Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleClickNewStudent}
              sx={{
                bgcolor: '#ff6b35',
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  bgcolor: '#e55a2b',
                },
              }}//this code costing latgger
            >
              {t('add_new')}
            </Button>
          </Box>
        </Box>

        {/* Table with TableSelectedAction */}
        {viewMode === 'table' && (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={displayData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  displayData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={displayData.length}
                  numSelected={table.selected.length}
                  sx={{
                    '& .MuiTableCell-head': {
                      bgcolor: '#f8f8f8',
                      fontWeight: 600,
                      color: '#333',
                    },
                  }}
                />
                <TableBody>
                  {studentListLoading
                    ? Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={TABLE_HEAD?.length || 6}>
                          <Skeleton animation="wave" height={40} />
                        </TableCell>
                      </TableRow>
                    ))
                    : displayData?.map((row) => (
                      <StudentRow
                        key={row.id}
                        userType={user?.user?.user_type}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => handleRowClick(row)}
                        reload={revalidateStudentList}
                        t={t}
                      />
                    ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        {/* Pagination */}
        {viewMode === 'table' && (
          <Box
            sx={{
              borderTop: '1px solid #f0f0f0',
              px: 2,
              py: 1,
            }}
          >
            <TablePaginationCustom
              count={totalStudentPages}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
