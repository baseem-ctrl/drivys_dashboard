import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Box, MenuItem, Card } from '@mui/material';
import { useGetGearEnum, useGetGenderEnum } from 'src/api/users';
import { useGetAllLanguage } from 'src/api/language';

interface StudentFormData {
  name: string;
  password: string;
  email: string;
  phone: string;
  country_code: string;
  dob: string;
  user_type: string;
  gear: string | number;
  vehicle_type_id: string;
  gender: string;
  city_id: string;
  locale: string;
  area_id: string;
  traffic_file_number: string;
}

const initialFormState: StudentFormData = {
  name: '',
  password: '',
  email: '',
  phone: '',
  country_code: '',
  dob: '',
  user_type: '',
  gear: '',
  vehicle_type_id: '',
  gender: '',
  city_id: '',
  locale: '',
  area_id: '',
  traffic_file_number: '',
};

const vehicleTypes = ['1', '2', '3'];
const cityOptions = ['101', '102', '103'];
const localeOptions = ['en', 'ar'];
const areaOptions = ['A1', 'A2', 'A3'];

const AddNewStudent: React.FC = () => {
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const { gearData, gearLoading } = useGetGearEnum();
  const { genderData, genderLoading } = useGetGenderEnum();
  const { language } = useGetAllLanguage(0, 1000);

  console.log('language', language);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  };

  return (
    <Card sx={{ maxWidth: 800, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add New Student
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {Object.entries(formData).map(([key, value]) => {
            const label = key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

            let options: any[] = [];

            if (
              ['gear', 'vehicle_type_id', 'gender', 'city_id', 'locale', 'area_id'].includes(key)
            ) {
              if (key === 'gear' && Array.isArray(gearData)) {
                options = gearData;
              } else if (key === 'gender' && Array.isArray(genderData)) {
                options = genderData;
              } else if (key === 'vehicle_type_id') {
                options = vehicleTypes;
              } else if (key === 'city_id') {
                options = cityOptions;
              } else if (key === 'locale') {
                options = localeOptions;
              } else if (key === 'area_id') {
                options = areaOptions;
              }
            }

            if (
              ['gear', 'vehicle_type_id', 'gender', 'city_id', 'locale', 'area_id'].includes(key)
            ) {
              return (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    select
                    label={label}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={options.length === 0}
                  >
                    {options.length > 0 ? (
                      options.map((option: any) => (
                        <MenuItem key={option.value ?? option} value={option.value ?? option}>
                          {option.name ?? option}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading...</MenuItem>
                    )}
                  </TextField>
                </Grid>
              );
            }

            if (key === 'dob') {
              return (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={label}
                    type="date"
                    name={key}
                    value={value}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>
              );
            }

            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  type={key === 'password' ? 'password' : 'text'}
                  label={label}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            );
          })}

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
};

export default AddNewStudent;
