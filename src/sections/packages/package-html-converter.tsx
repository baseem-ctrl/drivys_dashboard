
import Markdown from 'src/components/markdown';
// ----------------------------------------------------------------------
type Props = {
  description: string;
};
export default function PackageDescription({ description }: Props) {
  return (
    <Markdown
      children={description}
    // sx={{
    //   paddingInline: 10, paddingTop: 5, paddingBottom: 5,
    //   '& p, li, ol': {
    //     typography: 'body2',
    //   },
    //   '& ol': {
    //     p: 0,
    //     display: { md: 'flex' },
    //     listStyleType: 'none',
    //     '& li': {
    //       '&:first-of-type': {
    //         minWidth: 240,
    //         mb: { xs: 0.5, md: 0 },
    //       },
    //     },
    //   },
    // }}
    />
  );
}
