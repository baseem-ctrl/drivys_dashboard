import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';

// custom components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type LocaleOption = {
  value: string;
  label: string;
};

type Props = {
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  filters: Record<string, any>;
  onFilters?: (name: string, value: any) => void;
  canReset?: boolean;
  onResetFilters?: () => void;
  dialectFilterStates: {
    languageName: string;
    setLanguageName: (value: string) => void;
    dialectName: string;
    setDialectName: (value: string) => void;
    keyword: string;
    setKeyword: (value: string) => void;
    isPublished: string;
    setIsPublished: (value: string) => void;
  };
};

export default function DialectFilters({
  open,
  onOpen,
  onClose,
  filters,
  onFilters,
  canReset,
  onResetFilters,
  dialectFilterStates,
}: Props) {
  const { t } = useTranslation();
  const {
    languageName,
    setLanguageName,
    dialectName,
    setDialectName,
    keyword,
    setKeyword,
    isPublished,
    setIsPublished,
  } = dialectFilterStates;

  // Function to manage the language filter
  const handleFilterLanguage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('new value');
    const newValue = event.target.value;

    setLanguageName(newValue);
    if (onFilters) onFilters('language_name', newValue);
  };

  // Function to manage the dialect filter
  const handleFilterDialect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setDialectName(newValue); // Update state
    if (onFilters) onFilters('dialect_name', newValue);
  };

  // Function to manage the keyword
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setKeyword(newValue);
    if (onFilters) onFilters('keyword', newValue);
  };
  // Function to handle the publish status
  const handlePublishStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setIsPublished(newValue);
    if (onFilters) onFilters('is_published', newValue);
  };

  // Header section
  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t("Filters")}
      </Typography>

      <Tooltip title="Reset">
        <IconButton onClick={onResetFilters}>
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  // Language filtr
  const renderLanguage = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("Language Name")}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        value={languageName} // Use the state directly
        onChange={handleFilterLanguage}
        placeholder={t("Enter Language")}
      />
    </Stack>
  );

  // dilect filter scerion
  const renderDialect = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("Dialect Name")}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        value={dialectName} // Use the state directly
        onChange={handleFilterDialect}
        placeholder={t("Enter Dialect")}
      />
    </Stack>
  );

  // Keyword filter section
  const renderKeyword = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("Keyword")}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        value={keyword} // Use the state directly
        onChange={handleKeywordChange}
        placeholder={t("Enter keyword")}
      />
    </Stack>
  );

  // Status filter section
  const renderPublishStatus = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>
        {t("Publish Status")}
      </Typography>
      <FormControl>
        <FormControlLabel
          control={
            <Radio
              checked={isPublished === 'published'}
              onChange={handlePublishStatusChange}
              value="published"
            />
          }
          label={t("Show All Published")}
        />
        <FormControlLabel
          control={
            <Radio
              checked={isPublished === 'unpublished'}
              onChange={handlePublishStatusChange}
              value="unpublished"
            />
          }
          label={t("Show All Un Published")}
        />
      </FormControl>
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        {t("Filters")}
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        {renderHead}
        <Divider />
        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {renderLanguage}
            {renderDialect}
            {renderKeyword}
            {renderPublishStatus}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
