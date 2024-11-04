import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
// components
import { TablePaginationCustom, useTable } from 'src/components/table';
import { Typography } from '@mui/material';
import { useGetStudents } from 'src/api/student';
import { UserCardsView } from './view';
import { useEffect, useState } from 'react';
// ----------------------------------------------------------------------

type Props = {
  id: number | string;
};

export default function StudentDetailsContent({ id }: Props) {
  const [tableData, setTableData] = useState([]);
  const table = useTable({ defaultRowsPerPage: 5, defaultOrderBy: 'id', defaultOrder: 'desc' });
  const { students, studentsLoading, studentsLength, revalidateStudents } = useGetStudents({
    page: table.page,
    limit: table.rowsPerPage,
    trainer_id: id,
  });

  useEffect(() => {
    if (students?.length > 0) {
      setTableData(students);
    } else {
      setTableData([]);
    }
  }, [students]);

  return (
    <>
      {studentsLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            margin: '10px',
            alignSelf: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : students?.length > 0 ? (
        <>
          <UserCardsView users={tableData} />

          <TablePaginationCustom
            count={studentsLength}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </>
      ) : (
        <Typography color="textSecondary" sx={{ color: '#CF5A0D' }}>
          No students under this trainer
        </Typography>
      )}
    </>
  );
}
