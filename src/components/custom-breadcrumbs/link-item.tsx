import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// routes
import { RouterLink } from 'src/routes/components';
//
import { BreadcrumbsLinkProps } from './types';

// ----------------------------------------------------------------------

type Props = {
  link: BreadcrumbsLinkProps;
  activeLast?: boolean;
  disabled: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void; // Optional onClick prop
};

export default function BreadcrumbsLink({
  link,
  activeLast,
  disabled,
  onClick, // Accept the onClick handler
}: Props) {
  const { name, href, icon } = link;

  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
    ...(disabled &&
      !activeLast && {
        cursor: 'default',
        pointerEvents: 'none',
        color: 'text.disabled',
      }),
  };

  const renderContent = (
    <>
      {icon && (
        <Box
          component="span"
          sx={{
            mr: 1,
            display: 'inherit',
            '& svg': { width: 20, height: 20 },
          }}
        >
          {icon}
        </Box>
      )}

      {name}
    </>
  );

  if (href) {
    return (
      <Link component={RouterLink} href={href} sx={styles} onClick={onClick}>
        {renderContent}
      </Link>
    );
  }

  return (
    <Box sx={styles} onClick={onClick}>
      {renderContent}
    </Box>
  );
}
