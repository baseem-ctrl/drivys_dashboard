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
import CategoryItem from './category-item';
import { useGetAllCategory } from 'src/api/category';

// ----------------------------------------------------------------------

type Props = {
  jobs: IJobItem[];
  tableData: any;
  reload: any;
  setTableData: any;
  setAddOnlyOneCategory: boolean;
  // parentCategoryValues: any;
};

export default function CategoryList({
  jobs,
  tableData,
  reload,
  setTableData,
  setAddOnlyOneCategory, // parentCategoryValues,
}: Props) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const { category, categoryLoading, totalpages, categoryError, revalidateCategory } =
    useGetAllCategory({
      limit: 1000,
      page: 1,
      search: searchValue ?? '',
      has_child: 1,
    });

  const handleView = useCallback(
    (id: string) => {
      router.push(paths.dashboard.job.details(id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(paths.dashboard.job.edit(id));
    },
    [router]
  );

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
        <CategoryItem
          key={categoryItem.id}
          category={categoryItem}
          onView={() => handleView(categoryItem.id)}
          onEdit={() => handleEdit(categoryItem.id)}
          onDelete={() => handleDelete(categoryItem.id)}
          reload={reload}
          setTableData={setTableData}
          setAddOnlyOneCategory={setAddOnlyOneCategory}
          parentCategoryValues={category}
          searchCategory={handleSearch}
          setSearchValue={setSearchValue}
        />
      ))}
    </Box>
  );
}
