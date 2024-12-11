// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// types
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { createSchool, createUpdateSchoolAddress, useGetSchoolAdmin } from 'src/api/school';
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
import marker from 'react-map-gl/dist/esm/components/marker';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetAllLanguage } from 'src/api/language';
import { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  details: any;
  loading?: any;
  reload: VoidFunction;
};

export default function SchoolAdminDetailsContent({ details, loading, reload }: Props) {
  // const [selectedLanguage, setSelectedLanguage] = useState(
  //   details?.vendor_translations?.length > 0 ? details?.vendor_translations[0]?.locale : ''
  // );
  const [editMode, setEditMode] = useState(false);

  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Scrollbar>
        <Stack spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
          {[
            ...(details?.vendor_translations?.flatMap((itm: any) => [
              { label: `Name (${itm?.locale})`, value: itm?.name ?? 'N/A' },
            ]) || []),
            // { label: 'Name', value: items?.name ?? 'N/A' },
            { label: 'Email', value: details?.email ?? 'NA' },
            { label: 'Phone Number', value: details?.phone_number ?? 'NA' },
            { label: 'Commission in (%)', value: details?.commission_in_percentage ?? 'NA' },

            { label: 'License Expiry', value: details?.license_expiry ?? 'NA' },
            {
              label: 'License File',
              value: details?.license_file ? (
                <a
                  href={details?.license_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                >
                  {details?.license_file}
                </a>
              ) : (
                'N/A'
              ),
            },
            {
              label: 'Website',
              value: details?.website ? (
                <a
                  href={details?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                >
                  {details?.website}
                  {details?.website && (
                    <img src="/assets/icons/navbar/ic_link.svg" alt="" width={22} height={22} />
                  )}
                </a>
              ) : (
                'N/A'
              ),
            },
            { label: 'Status', value: details?.status ?? 'NA' },
            {
              label: 'Is Active',
              value:
                details?.is_active === '1' ? (
                  <Iconify color="green" icon="bi:check-square-fill" />
                ) : (
                  <Iconify color="red" icon="bi:x-square-fill" />
                ),
            },
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', width: '100%' }}>
              <Box component="span" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                {item.label}
              </Box>
              <Box component="span" sx={{ minWidth: '100px', fontWeight: 'bold' }}>
                :
              </Box>
              <Box component="span" sx={{ flex: 1 }}>
                {item.value ?? 'N/A'}
              </Box>
              {/* <Box component="span">{loading ? 'Loading...' : item.value}</Box> */}
            </Box>
          ))}
        </Stack>
      </Scrollbar>
    </Stack>
  );
  //Address ///////////////////////////////

  // const renderAddress = (
  //   <Stack component={Card} spacing={3} sx={{ p: 3, mt: 2, width: '100%' }}>
  //     <Scrollbar>
  //       <Box>
  //         <Button
  //           variant="contained"
  //           onClick={() => {
  //             setNewAddress({});
  //             setEditingIndex(null);
  //             reset();
  //           }}
  //           sx={{ mb: 2 }}
  //         >
  //           Add New Address
  //         </Button>
  //       </Box>

  //       {/* Form for Adding or Editing an Address */}
  //       {!newAddress && editingIndex === null && (
  //         <Stack spacing={4} alignItems="flex-start" sx={{ typography: 'body2', mt: 2 }}>
  //           {details?.vendor_addresses
  //             ?.slice(0, showAllAddresses ? details.vendor_addresses.length : maxVisibleAddresses)
  //             ?.map((details, index) => {
  //               // Map center position for each address
  //               const defaultCenter = {
  //                 lat: parseFloat(details?.latitude) || 0,
  //                 lng: parseFloat(details?.longitude) || 0,
  //               };

  //               return (
  //                 <Box key={details.id} sx={{ width: '100%' }}>
  //                   {/* Address Section Title */}
  //                   <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
  //                     Branch {index + 1}
  //                   </Typography>

  //                   {/* Address Details and Map */}
  //                   <Box
  //                     component={Card}
  //                     sx={{
  //                       p: 3,
  //                       mb: 2,
  //                       mt: 2,
  //                       boxShadow: 3,
  //                       borderRadius: 2,
  //                       border: '1px solid #ddd',

  //                       display: 'grid',
  //                       gridTemplateColumns: {
  //                         sm: '1fr',
  //                         md: '1fr 3fr',
  //                       },
  //                       gap: 2,
  //                     }}
  //                   >
  //                     {/* Address Details */}
  //                     <Box>
  //                       {[
  //                         { label: 'Street Address', value: details?.street_address ?? 'N/A' },
  //                         { label: 'City', value: details?.city ?? 'N/A' },
  //                         { label: 'State', value: details?.state ?? 'N/A' },
  //                         { label: 'Country', value: details?.country ?? 'N/A' },
  //                       ].map((item, idx) => (
  //                         <Box key={idx} sx={{ display: 'flex', mb: 1 }}>
  //                           <Box sx={{ minWidth: '150px', fontWeight: 'bold' }}>{item.label}</Box>
  //                           <Box>{item.value}</Box>
  //                         </Box>
  //                       ))}
  //                     </Box>

  //                     {/* Map on the right */}
  //                     <Box>
  //                       {isLoaded && load ? (
  //                         <GoogleMap
  //                           mapContainerStyle={mapContainerStyle}
  //                           center={defaultCenter}
  //                           zoom={12}
  //                         >
  //                           <Marker position={defaultCenter} />
  //                         </GoogleMap>
  //                       ) : (
  //                         <div>Loading Map...</div>
  //                       )}
  //                     </Box>
  //                     <Button
  //                       variant="contained"
  //                       onClick={() => {
  //                         setEditingIndex(index);
  //                         reset(defaultValues); // Load address into form fields
  //                       }}
  //                       sx={{ mt: 2, display: editingIndex !== null ? 'none' : '' }}
  //                     >
  //                       Edit
  //                     </Button>
  //                   </Box>
  //                 </Box>
  //               );
  //             })}
  //         </Stack>
  //       )}

  //       {(newAddress || editingIndex !== null) && (
  //         <Box component="form" onSubmit={onSubmit} sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}>
  //           <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
  //             {newAddress ? 'Add New Address' : `Edit Address ${editingIndex + 1}`}
  //           </Typography>
  //           <Grid container spacing={2}>
  //             <Grid item xs={12} md={6}>
  //               {[
  //                 { label: 'Street Address', name: 'street_address' },
  //                 { label: 'City', name: 'city' },
  //                 { label: 'State', name: 'state' },
  //                 { label: 'Country', name: 'country' },
  //                 { label: 'Latitude', name: 'latitude' },
  //                 { label: 'Longitude', name: 'longitude' },
  //               ].map((item, idx) => (
  //                 <Controller
  //                   key={idx}
  //                   name={item.name}
  //                   control={control}
  //                   render={({ field }) => (
  //                     <TextField
  //                       {...field}
  //                       label={item.label}
  //                       variant="outlined"
  //                       sx={{ my: 1, width: '100%' }}
  //                     />
  //                   )}
  //                 />
  //               ))}

  //               {/* Map Component for Selecting Location */}

  //               <Box sx={{ mt: 2 }}>
  //                 <Button variant="contained" type="submit" sx={{ mr: 1 }}>
  //                   Save
  //                 </Button>
  //                 <Button
  //                   variant="outlined"
  //                   onClick={() => {
  //                     setEditingIndex(null);
  //                     setNewAddress(null);
  //                     reset(defaultValues);
  //                   }}
  //                 >
  //                   Cancel
  //                 </Button>
  //               </Box>
  //             </Grid>

  //             {/* Map Section */}
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
  //                 Select Location on Map
  //               </Typography>
  //               <Box sx={{ height: 300 }}>
  //                 {isLoaded && load ? (
  //                   <GoogleMap
  //                     mapContainerStyle={mapContainerStyle}
  //                     center={markerPosition}
  //                     zoom={12}
  //                     onClick={handleMapClick}
  //                   >
  //                     {markerPosition && (
  //                       <Marker
  //                         position={markerPosition}
  //                         icon={{
  //                           url:
  //                             marker && typeof marker === 'string'
  //                               ? marker
  //                               : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  //                           scaledSize: new window.google.maps.Size(50, 50), // Adjust the size of the marker image as needed
  //                         }}
  //                       />
  //                     )}
  //                     {(defaultValues?.latitude || defaultValues?.longitude) && (
  //                       <Marker
  //                         position={{
  //                           lat: Number.isNaN(Number(defaultValues?.latitude))
  //                             ? 0
  //                             : Number(defaultValues?.latitude), // Convert to number
  //                           lng: Number.isNaN(Number(defaultValues?.longitude))
  //                             ? 0
  //                             : Number(defaultValues?.longitude), // Convert to number
  //                         }}
  //                         icon={{
  //                           url:
  //                             marker && typeof marker === 'string'
  //                               ? marker
  //                               : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  //                           scaledSize: new window.google.maps.Size(50, 50),
  //                         }}
  //                       />
  //                     )}
  //                   </GoogleMap>
  //                 ) : (
  //                   <div>Loading Map...</div>
  //                 )}
  //               </Box>
  //             </Grid>
  //           </Grid>
  //         </Box>
  //       )}

  //       {details?.vendor_addresses?.length > maxVisibleAddresses && (
  //         <Box sx={{ mt: 3 }}>
  //           <Button variant="outlined" onClick={() => setShowAllAddresses(!showAllAddresses)}>
  //             {showAllAddresses ? 'Show Less' : 'Show More'}
  //           </Button>
  //         </Box>
  //       )}
  //     </Scrollbar>
  //   </Stack>
  // );
  return (
    <>
      {loading ? (
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
      ) : (
        <Grid container spacing={1} rowGap={1}>
          <Grid xs={12} md={8}>
            {renderContent}
          </Grid>
          <Grid item xs={12}>
            {/* {renderAddress} */}
          </Grid>
        </Grid>
      )}
    </>
  );
}
