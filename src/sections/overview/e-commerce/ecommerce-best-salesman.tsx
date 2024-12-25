// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fCurrency } from 'src/utils/format-number';
//
import Scrollbar from 'src/components/scrollbar';
import { ColorPreview } from 'src/components/color-utils';
import Package from '../../../../public/logo/package-icon.svg';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Container, Typography } from '@mui/material';
import { ASSETS_API } from 'src/config-global';

// ----------------------------------------------------------------------

type ItemProps = {
  id: string;
  name: string;
  coverUrl: string;
  price: number;
  priceSale: number;
  colors: string[];
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  list: ItemProps[];
}

export default function EcommerceBestTrainer({ title, subheader, list, ...other }: Props) {
  // Empty state
  if (!list || list.length === 0) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No {title} at the moment.
        </Typography>
      </Container>
    );
  }
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, minWidth: 360 }} height={'400px'} overflow={'auto'}>
          {list?.map((product) => <ProductItem key={product?.id} product={product} />)}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ProductItemProps = {
  product: any;
};

function ProductItem({ product }: ProductItemProps) {
  const { package_translations, id } = product;
  const CoverUrl = `${ASSETS_API}/assets/images/avatar/avatar_2.jpg`;

  return (
    <Stack direction="row" spacing={2}>
      <Avatar
        variant="rounded"
        alt={CoverUrl}
        src={CoverUrl}
        sx={{ width: 48, height: 48, flexShrink: 0 }}
      />

      <ListItemText
        primary={
          <Link
            sx={{ color: 'text.primary', typography: 'subtitle2' }}
            component={RouterLink}
            href={paths.dashboard.user.details(product?.id)}
          >
            {product.name ?? 'NA'}
          </Link>
        }
        secondary={
          <>
            <Box component="span" sx={{ mr: 0.5 }}>
              {product?.email ?? 'NA'}
            </Box>
            <Box
            // component="span"
            >
              Total Bookings: {product?.total_bookings}
            </Box>
          </>
        }
        primaryTypographyProps={{
          noWrap: true,
        }}
        secondaryTypographyProps={{
          mt: 0.5,
        }}
      />

      {/* <ColorPreview limit={3} colors={product.colors} /> */}
    </Stack>
  );
}
