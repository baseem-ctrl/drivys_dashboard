import { Box, IconButton } from '@mui/material';
import { useState } from 'react';
import { updateValue } from 'src/api/app-settings';
import Editor from 'src/components/editor';
import { enqueueSnackbar } from 'src/components/snackbar';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const TermsAndConditions = ({
  item,
  selectedLocale,
  formData,
  revalidateAppSettings,
  setEditedFields,
}) => {
  const [editedData, setEditedData] = useState(item.value);
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState(formData); // Store backup for cancel

  const formattedContent = item.value
    .map(
      (section) => `
        <h6>${section.heading}</h6>
        <p>${section.content.replace(/\n/g, '<br/>')}</p>
      `
    )
    .join('');

  const handleEditorChange = (newContent, sectionIndex) => {
    console.log('editing');
    setIsEditing(true);
    setEditedData((prevData) =>
      prevData.map((section, index) =>
        index === sectionIndex ? { ...section, content: newContent } : section
      )
    );
  };

  const handleSave = async (id) => {
    console.log('saving');

    try {
      const editedField = editedData.find((item) => item.id === id);
      console.log('editedField', editedField);

      const body = {
        appsetting: [
          {
            key: item.key,
            value: editedData,
            locale: selectedLocale,
            display_order: item?.display_order,
          },
        ],
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      overflow="auto"
      border="1px solid #ddd"
      padding="10px"
      position="relative"
    >
      {/* Editor */}
      <Editor
        id="terms-and-conditions-editor"
        defaultValue={formattedContent}
        onChange={(content) => handleEditorChange(content, 0, item.id)}
      />

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

export default TermsAndConditions;
