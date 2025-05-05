import { useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// types
import { IJobItem } from 'src/types/job';
//
import LoyalityProgramItem from './loyality-program-item';
import { useGetLoyaltyProgramList } from 'src/api/loyality';

// ----------------------------------------------------------------------

type Props = {
  jobs: IJobItem[];
  tableData: any;
  reload: any;
  setTableData: any;
  setAddOnlyOneCategory: boolean;
  // parentCategoryValues: any;
};

export default function LoyalityProgramList({
  tableData,
  reload,
  setTableData,
  setAddOnlyOneCategory,
}: Props) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const {
    loyaltyPrograms,
    loyaltyProgramsLoading,
    loyaltyProgramsError,
    totalpages,
    revalidateLoyaltyPrograms,
  } = useGetLoyaltyProgramList({ limit: 1000, page: 0, search: searchValue ?? '' });
  // const { category, categoryLoading, totalpages, categoryError, revalidateCategory } =
  //   useGetAllCategory({
  //     limit: 1000,
  //     page: 1,
  //     search: searchValue ?? '',
  //     has_child: 1,
  //   });

  const handleEdit = useCallback(
    (id: string) => {
      router.push(paths.dashboard.job.edit(id));
    },
    [router]
  );
  const handleView = (id) => {
    router.push(paths.dashboard.loyality.details(id));
  };

  const handleDelete = useCallback((id: string) => {
    console.info('DELETE', id);
  }, []);
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };
  return (
    <Box
      gap={3}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      }}
    >
      {tableData.map((categoryItem: any) => (
        <Box
          onClick={(e) => {
            const tagName = e.target.tagName;
            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'LABEL'].includes(tagName)) {
              e.stopPropagation();
              return;
            }
            handleView(categoryItem.id);
          }}
          sx={{
            cursor: 'pointer',
            transition: '0.3s',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              transform: 'scale(1.02)',
            },
          }}
        >
          {' '}
          <LoyalityProgramItem
            key={categoryItem.id}
            category={categoryItem}
            onEdit={() => handleEdit(categoryItem.id)}
            onDelete={() => handleDelete(categoryItem.id)}
            reload={reload}
            setTableData={setTableData}
            setAddOnlyOneCategory={setAddOnlyOneCategory}
            parentCategoryValues={loyaltyPrograms}
            searchCategory={handleSearch}
            setSearchValue={setSearchValue}
          />
        </Box>
      ))}
    </Box>
  );
}
