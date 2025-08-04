import { Box, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { updateValue } from 'src/api/app-settings';
import Editor from 'src/components/editor';
import { enqueueSnackbar } from 'src/components/snackbar';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PrivacyPolicyTextEditor from 'src/components/editor/privacy-policy-editor';

const PrivacyPolicy = ({
  item,
  selectedLocale,
  formData,
  revalidateAppSettings,
  setEditedFields,
}) => {
  const [editedData, setEditedData] = useState(item.value);
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState(formData); // Store backup for cancel
  const handleEditorChange = (newContent) => {
    setIsEditing(true);
    setEditedData(newContent);
  };

  const handleSave = async (id) => {
    try {
      const body = {
        key: item.key,
        value: editedData,
        id: item?.id,
      };
      const response = await updateValue(body);
      if (response) {
        enqueueSnackbar(response.message, { variant: 'success' });
        revalidateAppSettings();
        setEditedFields((prev) => ({ ...prev, [id]: false }));
        setIsEditing(false);
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    } finally {
      revalidateAppSettings();
    }
  };

  const handleCancel = () => {
    setEditedData(backupData);
    setIsEditing(false);
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Box
      display="flex"
      flexDirection="column"
      overflow="auto"
      border="1px solid #ddd"
      padding="10px"
      position="relative"
    >
      {mounted && (
        <PrivacyPolicyTextEditor
          id="terms-and-conditions-editor"
          defaultValue={item.value}
          onChange={(content) => handleEditorChange(content, 0, item.id)}
        />
      )}

      {isEditing && (
        <Box position="absolute" top={5} right={10} display="flex" gap={1}>
          <IconButton onClick={handleSave} color="success">
            <SaveIcon />
          </IconButton>
          <IconButton onClick={handleCancel} color="error">
            <CancelIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default PrivacyPolicy;
