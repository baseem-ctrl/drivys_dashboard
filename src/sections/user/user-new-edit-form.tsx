import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';

import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// types
import { IUserItem } from 'src/types/user';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
import {
  createTrainer,
  createUser,
  deleteUser,
  updateUser,
  useGetGearEnum,
  useGetGenderEnum,
  useGetUserDetails,
  useGetUserTypeEnum,
} from 'src/api/users';
import {
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetAllLanguage } from 'src/api/language';
import { useGetAllCategory } from 'src/api/category';
import { useGetAllCity } from 'src/api/city';
import { useGetAllDialect } from 'src/api/dialect';
import RHFAutocompleteSearch from 'src/components/hook-form/rhf-autocomplete-search';
import { useGetSchool } from 'src/api/school';
import { useLocales } from 'src/locales';

import moment from 'moment';
import { useGetStateList } from 'src/api/state';
import RHFFileUpload from 'src/components/hook-form/rhf-text-file';
import { InfoOutlined } from '@mui/icons-material';
import { useGetRoles } from 'src/api/roles-and-permission';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker';
import {
  useGetAreas,
  useGetCategories,
  useGetCities,
  useGetDialects,
  useGetLanguages,
} from 'src/api/enum';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: any;
  detailsLoading?: any;
  id?: any;
  revalidateDetails?: any;
};

const fluencyOptions = [
  { name: 'BASIC', value: 'BASIC' },
  { name: 'INTERMEDIATE', value: 'INTERMEDIATE' },
  { name: 'ADVANCED', value: 'ADVANCED' },
  { name: 'NATIVE', value: 'NATIVE' },
];
const docSideOptions = [
  { name: 'FRONT', value: 'FRONT' },
  { name: 'BACK', value: 'BACK' },
];
export default function UserNewEditForm({
  currentUser,
  detailsLoading,
  id,
  revalidateDetails,
}: Props) {
  // const { details, detailsLoading, revalidateDetails } = useGetUserDetails(id);
  // const currentUser = currentUser ?? "";
  const router = useRouter();
  const { user } = useAuthContext();
  const { t, currentLang } = useLocales();

  const { languages, languagesLoading } = useGetLanguages(0, 1000);

  const { roles, rolesLoading, rolesError, rolesTotalPages, revalidateRoles } = useGetRoles(
    0,
    1000
  );
  const { enumData, enumLoading } = useGetUserTypeEnum();
  const { genderData, genderLoading } = useGetGenderEnum();
  const { gearData, gearLoading } = useGetGearEnum();
  const [searchCategory, setSearchCategory] = useState('');
  const [filteredValues, setFilteredValues] = useState(
    user?.user?.user_type === 'SCHOOL_ADMIN' ? [{ value: 'TRAINER', label: 'Trainer' }] : enumData
  );
  const { enqueueSnackbar } = useSnackbar();
  const { i18n } = useTranslation();
  const { cities } = useGetCities(0, 1000);
  const { categories, categoriesLoading } = useGetCategories(0, 1000);

  const [searchValue, setSearchValue] = useState('');
  const { schoolList, schoolLoading, revalidateSchool } = useGetSchool({
    limit: 1000,
    search: searchValue ?? '',
  });

  const { dialects, dialectsLoading, dialectsError } = useGetDialects(1, 1000);

  const [selectedSchool, setSelectedSchool] = useState(null);
  useEffect(() => {
    if (enumData?.length > 0) {
      let updatedValues = [];

      if (user?.user?.user_type === 'SYSTEM_ADMIN') {
        // SYSTEM_ADMIN sees everything
        updatedValues = enumData;
      } else if (user?.user?.user_type === 'SCHOOL_ADMIN') {
        // SCHOOL_ADMIN gets only TRAINER option
        updatedValues = enumData.filter((item) => item.value === 'TRAINER');
      } else {
        // Everyone else → hide SYSTEM_ADMIN
        updatedValues = enumData.filter((item) => item.value !== 'SYSTEM_ADMIN');
      }

      // Update state with the filtered list
      setFilteredValues(updatedValues);
    }
  }, [enumData, user?.user?.user_type]);

  const [defaultOption, setDefaultOption] = useState<any>(null);
  const sanitizeText = (value: string | undefined | null) =>
    value
      ?.toString()
      .trim()
      .replace(/<[^>]+>/g, '') || '';

  const MAX_BIO_LENGTH = 500;
  const MAX_BIO_AR_LENGTH = 300;
  const MAX_BIO_UR_LENGTH = 300;
  // const [schoolOptions, setSchoolOptions] = useState();
  const NewUserSchema = Yup.object().shape({
    name: Yup.string()
      .transform((value) => sanitizeText(value))
      .required(t('name_required')),
    name_ar: Yup.string().transform((value) => sanitizeText(value)),
    certificate_expiry_date: Yup.mixed().test(
      'is-future-date',
      'Expiry date must be in future',
      (value) => {
        if (!value) return true;
        const date = new Date(value);
        return date > new Date();
      }
    ),
    cash_clearance_date: Yup.mixed(),

    email: Yup.string()
      .transform((value) => sanitizeText(value))
      .required(t('email_required'))
      .matches(/^[^@]+@[^@]+\.[^@]+$/, t('email_invalid')),

    password: Yup.lazy(() => {
      return currentUser?.id ? Yup.string() : Yup.string(); // adjust required logic if needed
    }),

    phone: Yup.string()
      .transform((value) => sanitizeText(value))
      .matches(/^5\d{0,8}$/, t('phone_invalid')),

    city_assigned: Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.mixed().required(t('city_id_required')),
          label: Yup.string().required(t('city_name_required')),
        })
      )
      .when('user_type', {
        is: (userType) => userType?.toUpperCase() === 'COLLECTOR',
        then: (schema) => schema.min(1, t('city_required')).required(t('city_required')),
        otherwise: (schema) => schema.notRequired(),
      }),

    dob: Yup.string()
      .nullable()
      .when('user_type', {
        is: (value) => ['STUDENT', 'TRAINER'].includes(value?.toUpperCase()),
        then: (schema) => schema.required(t('dob_required')),
      })
      .test('is-valid-date', t('dob_invalid'), (value) => !value || !isNaN(Date.parse(value)))
      .test(
        'is-before-today',
        t('dob_before_today'),
        (value) => !value || new Date(value) < new Date()
      )
      .test('is-18-or-older', t('dob_age_requirement'), (value) => {
        if (!value) return true;
        const today = new Date();
        const dob = new Date(value);
        const age = today.getFullYear() - dob.getFullYear();
        const monthDifference = today.getMonth() - dob.getMonth();
        return (
          age > 18 ||
          (age === 18 &&
            (monthDifference > 0 || (monthDifference === 0 && today.getDate() >= dob.getDate())))
        );
      }),

    locale: Yup.mixed().nullable(),
    school_ids: Yup.array().of(Yup.mixed().nullable()),
    user_type: Yup.string().required(t('user_type_required')),
    photo_url: Yup.mixed(),
    is_active: Yup.boolean(),

    gear: Yup.mixed()
      .nullable()
      .test('gear-required-for-trainer', t('gear_required'), function (value) {
        return this.parent.user_type === 'TRAINER' ? value != null && value !== '' : true;
      }),

    vehicle_type_id: Yup.mixed().nullable(),
    vendor_id: Yup.mixed().nullable(),
    gender: Yup.mixed().nullable(),
    user_gender: Yup.mixed().nullable(),
    city_id: Yup.mixed().nullable(),
    area_id: Yup.mixed().nullable(),

    languages: Yup.array().when('user_type', {
      is: (val) => val?.toUpperCase() === 'ASSISTANT',
      then: () => Yup.array().notRequired(),
      otherwise: () =>
        Yup.array()
          .of(
            Yup.object().shape({
              id: Yup.mixed().required(t('language_required')),
              fluency_level: Yup.mixed().required(t('fluency_required')),
            })
          )
          .required(t('languages_required')),
    }),

    school_name: Yup.string()
      .nullable()
      .transform((value) => sanitizeText(value))
      .test('school-name-required', t('school_name_required'), function (value) {
        const { user_type, vendor_id } = this.parent;
        if (user_type === 'TRAINER' && typeof vendor_id === 'object' && !vendor_id?.value) {
          return value != null && value !== '';
        }
        return true;
      }),

    vehicle_number: Yup.string().transform((value) => sanitizeText(value)),

    license: Yup.array().of(
      Yup.object().shape({
        license_file: Yup.mixed(),
        doc_side: Yup.mixed(),
      })
    ),

    cash_in_hand: Yup.string().transform((value) => sanitizeText(value)),
    max_cash_in_hand_allowed: Yup.string().transform((value) => sanitizeText(value)),
    collected_max_cash_in_hand_allowed: Yup.mixed(),

    vendor_commission_in_percentage: Yup.number().when('user_type', {
      is: 'TRAINER',
      then: (schema) => schema.required(t('school_commission_required')).min(0).max(100),
      otherwise: (schema) => schema.notRequired(),
    }),

    assistant_id_proof: Yup.object().when('user_type', {
      is: (val) => val?.toUpperCase() === 'ASSISTANT',
      then: (schema) =>
        schema.shape({
          front: Yup.mixed().required(t('front_id_required')),
          back: Yup.mixed().required(t('back_id_required')),
          expiry: Yup.date()
            .nullable()
            .required(t('expiry_required'))
            .test(
              'is-future-date',
              t('expiry_must_be_future'),
              (value) => !value || new Date(value) > new Date()
            ),
        }),
      otherwise: (schema) => schema.notRequired(),
    }),

    bio: Yup.string().nullable(),

    bio_ar: Yup.string().nullable(),

    bio_ur: Yup.string().nullable(),
  });
  const frontDoc = currentUser?.user_docs?.find(
    (doc) => doc.doc_type === 'ASSISTANT ID PROOF' && doc.doc_side === 'FRONT'
  );

  const backDoc = currentUser?.user_docs?.find(
    (doc) => doc.doc_type === 'ASSISTANT ID PROOF' && doc.doc_side === 'BACK'
  );

  const assistantIdExpiry = frontDoc?.expiry || backDoc?.expiry || '';

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      roles:
        currentUser?.roles?.map((r) => ({
          value: r.role?.id,
          label: r.role?.name || t('n/a'),
        })) || [],

      user_type:
        user?.user?.user_type === 'SCHOOL_ADMIN' ? 'TRAINER' : currentUser?.user_type || '',
      email: currentUser?.email || '',
      name_ar: currentUser?.name_ar || '',
      certificate_expiry_date: currentUser?.certificate_expiry_date || '',
      cash_clearance_date: currentUser?.cash_clearance_date
        ? new Date(currentUser.cash_clearance_date).toISOString().split('T')[0]
        : '',

      password: '',
      phone: currentUser?.phone || '',
      school_ids:
        currentUser?.mapped_schools?.map((school) => ({
          value: school.vendor_id,
          label: school.vendor_name_en || t('unknown'),
        })) || [],
      city_assigned:
        currentUser?.city_assigned?.map((c) => ({
          value:
            c.city?.city_translations?.find(
              (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
            )?.city_id || '',
          label:
            c.city?.city_translations?.find(
              (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
            )?.name || '',
        })) || [],

      dob: currentUser?.dob?.split('T')[0] || '',
      locale: languages
        ? languages?.find(
            (option) =>
              option?.language_culture?.toLowerCase() === currentUser?.locale?.toLowerCase()
          )
        : '',
      photo_url: currentUser?.photo_url || '',
      is_active: currentUser?.id ? (currentUser?.is_active ? 1 : 0) : 1,
      languages: dialects
        ? currentUser?.languages?.map((lang) => ({
            id:
              dialects?.length > 0
                ? dialects?.find((option) => option?.id === lang?.dialect?.id)
                : '',
            fluency_level: lang?.fluency_level || '',
          }))
        : [],
      gear:
        gearData?.length > 0
          ? gearData?.find(
              (option) =>
                option?.name?.toLowerCase() === currentUser?.user_preference?.gear?.toLowerCase()
            )?.value
          : '',
      vehicle_type_id:
        categories
          ?.find((item) => item?.id === currentUser?.user_preference?.vehicle_type_id)
          ?.category_translations?.find(
            (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
          )?.name || '',
      vendor_id: currentUser?.vendor?.id
        ? schoolList?.length > 0 &&
          schoolList
            .find((school) => school.id === currentUser?.vendor?.id)
            ?.vendor_translations?.find(
              (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
            )?.name
        : [{ label: 'Other', value: null }],
      gender:
        genderData?.length > 0
          ? genderData?.find(
              (option) =>
                option?.name?.toLowerCase() === currentUser?.user_preference?.gender?.toLowerCase()
            )?.value
          : '',
      user_gender: currentUser?.gender,
      city_id: currentUser?.user_preference?.city_id
        ? {
            value: currentUser?.user_preference?.city_id,
            label:
              currentUser?.user_preference?.city?.city_translations?.find(
                (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
              )?.name || t('unknown'),
          }
        : '',
      area_id: currentUser?.user_preference?.state_province
        ? {
            value: currentUser?.user_preference?.state_province_id,
            label:
              currentUser?.user_preference?.state_province?.translations?.find(
                (tr) => tr?.locale?.toLowerCase() === i18n.language.toLowerCase()
              )?.name || t('unknown'),
          }
        : '',
      vendor_commission_in_percentage: currentUser?.vendor_commission_in_percentage,
      // school_commission_in_percentage:
      //   currentUser?.user_preference?.school_commission_in_percentage,
      doc_side: currentUser?.user_preference?.doc_side || '',
      max_radius_in_km: currentUser?.user_preference?.max_radius_in_km || '',
      is_pickup_enabled: !!currentUser?.user_preference?.is_pickup_enabled,
      certificate_commission_in_percentage:
        currentUser?.user_preference?.certificate_commission_in_percentage || '',
      bio: currentUser?.user_preference?.bio || '',
      bio_ar: currentUser?.user_preference?.bio_ar || '',
      bio_ur: currentUser?.user_preference?.bio_ur || '',
      vehicle_number: currentUser?.vehicle_number || '',
      license_file: currentUser?.user_preference?.license_file || '',
      school_name: currentUser?.school_name || '',
      license: currentUser?.user_docs?.map((doc) => ({
        license_file: doc?.doc_file ?? [],
        doc_side: doc?.doc_side || '',
      })),
      cash_in_hand: currentUser?.cash_in_hand || 0,
      max_cash_in_hand_allowed: currentUser?.max_cash_in_hand_allowed || '',
      collected_max_cash_in_hand_allowed: currentUser?.collected_max_cash_in_hand_allowed || '',
      assistant_id_proof: {
        front: frontDoc?.doc_file || null,
        back: backDoc?.doc_file || null,
        expiry: assistantIdExpiry ? new Date(assistantIdExpiry) : null,
      },
    }),
    [
      currentUser?.locale,
      dialects,
      languages,
      schoolList,
      currentUser?.user_preference,
      genderData,
      gearData,
      i18n.language,
    ]
  );
  console.log('user?.user?.user_type ', user?.user?.user_type);
  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  console.log('errorserrors', errors);
  const selectedCity = watch('city_id');
  const initialCity = useRef(selectedCity);

  const { areas } = useGetAreas(0, 1000, selectedCity?.value);

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'languages',
  });
  const {
    fields: licenseFields,
    remove: removeLicense,
    append: appendLicense,
  } = useFieldArray({
    control,
    name: 'license',
  });
  const values = watch();
  console.log('value', values);

  useEffect(() => {
    if (initialCity.current?.value !== selectedCity?.value) {
      setValue('area_id', ''); // Clear the area_id field
    }
  }, [selectedCity, setValue]);
  useEffect(() => {
    // Set gender
    if (genderData?.length > 0 && currentUser?.gender) {
      const gender = genderData.find(
        (option) => option?.name?.toLowerCase() === currentUser?.gender?.toLowerCase()
      )?.value;
      if (gender) {
        setValue('gender', gender);
      }
    }
    if (genderData?.length > 0 && currentUser?.gender) {
      const gender = genderData.find(
        (option) => option?.name?.toLowerCase() === currentUser?.gender?.toLowerCase()
      )?.value;

      if (gender) {
        setValue('user_gender', gender); // <- this is the key field name
      }
    }

    // Set vehicle_type_id (category)
    if (categories?.length > 0 && currentUser?.user_preference?.vehicle_type_id) {
      const vehicleType = categories.find(
        (item) => item?.id === currentUser?.user_preference?.vehicle_type_id
      );
      const vehicleTypeLabel = vehicleType?.category_translations
        ?.map((translation) => translation?.name)
        .join(' - ');

      if (vehicleTypeLabel) {
        setValue('vehicle_type_id', vehicleTypeLabel);
      }
    }
  }, [
    genderData,
    gearData,
    categories,
    currentUser?.gender,
    currentUser?.user_preference?.gear,
    currentUser?.user_preference?.vehicle_type_id,

    setValue,
  ]);
  useEffect(() => {
    // Handle Gear
    if (gearData?.length > 0 && currentUser?.user_preference?.gear) {
      const gearOption = gearData.find(
        (option) =>
          option?.name?.toLowerCase() === String(currentUser?.user_preference?.gear).toLowerCase()
      );

      if (gearOption) {
        setValue('gear', gearOption.value);
      }
    }

    // Handle Languages
    if (dialects?.length > 0 && currentUser?.languages?.length > 0) {
      const mappedLanguages = currentUser.languages.map((lang) => ({
        id: dialects.find((option) => option?.id === lang?.dialect?.id) || '',
        fluency_level: lang?.fluency_level || '',
      }));

      setValue('languages', mappedLanguages);
    }
  }, [gearData, currentUser?.user_preference?.gear, dialects, currentUser?.languages]);

  useEffect(() => {
    if (!defaultOption && schoolList?.length > 0) {
      let selectedOption = null;

      // Case 1: From form value
      if (values.vendor_id?.value) {
        selectedOption = schoolList.find((school) => school.id === values.vendor_id.value);
      }
      // Case 2: From currentUser
      else if (currentUser?.vendor?.id) {
        selectedOption = schoolList.find((school) => school.id === currentUser.vendor.id);
      }

      if (selectedOption) {
        const translation =
          selectedOption.vendor_translations?.find(
            (tr) => tr.locale?.toLowerCase() === i18n.language?.toLowerCase()
          ) ?? selectedOption.vendor_translations?.[0];

        setDefaultOption({
          label: `${translation?.name ?? t('unknown')}${
            selectedOption.email ? ` - ${selectedOption.email}` : ''
          }`,
          value: selectedOption.id,
        });
      } else {
        setDefaultOption({ label: t('other'), value: null });
      }
    }
  }, [currentUser?.id, values.vendor_id, schoolList, i18n.language, t]);

  const watchedVendorId = watch('vendor_id');

  useEffect(() => {
    if (watchedVendorId) {
      if (watchedVendorId.value) {
        const school = schoolList.find((item) => item.id === watchedVendorId.value);
        setSelectedSchool(school || null);
      } else {
        // If watchedVendorId is just a string (name), match with translations considering i18n.language
        const school = schoolList.find(
          (item) =>
            item.vendor_translations?.some(
              (translation) =>
                translation.locale?.toLowerCase() === i18n.language?.toLowerCase() &&
                translation.name === watchedVendorId
            )
        );
        setSelectedSchool(school || null);
      }
    }
  }, [watchedVendorId, schoolList, i18n.language]);

  // Function to add more language entry
  const handleAddMore = () => {
    append({ id: '', fluency_level: '' });
    revalidateDetails();
  };

  // Function to delete language entryu
  const handleRemove = (index: number) => {
    remove(index);
    revalidateDetails();
  };
  const fileInputRefs = useRef([]);
  const handleAddMoreFile = () => {
    appendLicense({ license_file: [], doc_side: '' });
    revalidateDetails();
  };
  const handleRemoveFile = (index: number) => {
    removeLicense(index);
    revalidateDetails();
    fileInputRefs.current.splice(index, 1);
  };
  const handleCancel = () => {
    router.back();
  };
  const onSubmit = handleSubmit(async (data) => {
    try {
      let response;
      const body = new FormData();
      body.append('name', data?.name);
      body.append('email', data?.email);
      if (data?.password) body.append('password', data?.password);
      body.append('phone', data?.phone);
      // Only append gear if it exists
      if (data?.roles?.length > 0) {
        data.roles.forEach((role: any) => {
          body.append('roles[]', role.value);
        });
      }
      if (
        (data?.user_type === 'TRAINER' || data?.user_type === 'STUDENT') &&
        (data?.gear !== null || data?.gear !== undefined)
      ) {
        body.append('gear', data?.gear);
      }
      if (data?.vehicle_type_id) {
        if (values?.user_type === 'TRAINER' || values?.user_type === 'STUDENT') {
          if (currentUser?.id) {
            body.append(
              'vehicle_type_id',
              data?.vehicle_type_id?.value ?? currentUser?.user_preference?.vehicle_type_id
            );
          } else {
            body.append('vehicle_type_id', data?.vehicle_type_id?.value ?? '');
          }
        }
      }
      if (data?.vendor_id && data?.user_type !== 'COLLECTOR') {
        const matchedVendor = schoolList.find(
          (school) => school.vendor_translations[0]?.name === data.vendor_id
        );

        if (matchedVendor?.id) {
          body.append('vendor_id', matchedVendor.id);
        } else if (data?.vendor_id?.value) {
          body.append('vendor_id', data.vendor_id.value);
        }
      }
      if (data?.user_type === 'COLLECTOR' || data?.user_type === 'ASSISTANT') {
        data.city_assigned?.forEach((c) => {
          if (c?.value) {
            body.append('city_assigned[]', c.value);
          }
        });
      }
      if (data?.user_type === 'ASSISTANT') {
        data.school_ids?.forEach((c) => {
          if (c?.value) {
            body.append('school_ids[]', c.value);
          }
        });
      }

      if (
        (data?.vendor_id?.value === undefined || data?.vendor_id?.value === null) &&
        data?.user_type !== 'COLLECTOR' &&
        data?.school_name
      ) {
        body.append('school_name', data?.school_name);
      }
      if (data?.gender) body.append('gender', data?.gender);
      if (data?.user_gender && data?.user_type === 'ASSISTANT')
        body.append('user_gender', data?.user_gender);

      if (data?.city_id) body.append('city_id', data?.city_id.value);
      if (data?.area_id) body.append('area_id', data?.area_id?.value);
      if (data?.phone) body.append('country_code', data?.country_code ?? '971');
      if (data?.dob) body.append('dob', moment(data?.dob).format('YYYY-MM-DD'));
      body.append('user_type', data?.user_type);

      if (data?.user_type === 'TRAINER') {
        // if (data?.is_pickup_enabled)
        body.append('is_pickup_enabled', data.is_pickup_enabled ? 1 : 0);
        if (data?.name_ar) body.append('name_ar', data?.name_ar);
        if (data?.certificate_expiry_date)
          body.append('certificate_expiry_date', data?.certificate_expiry_date);
        if (data?.cash_clearance_date)
          body.append('cash_clearance_date', data?.cash_clearance_date);
        if (data?.max_radius_in_km) body.append('max_radius_in_km', data?.max_radius_in_km);
        // if (data?.school_commission_in_percentage)
        //   body.append('school_commission_in_percentage', data?.school_commission_in_percentage);
        if (data?.vendor_commission_in_percentage)
          body.append('vendor_commission_in_percentage', data?.vendor_commission_in_percentage);
        if (data?.certificate_commission_in_percentage)
          body.append(
            'certificate_commission_in_percentage',
            data?.certificate_commission_in_percentage
          );
        if (data?.bio) body.append('bio', data?.bio);
        if (data?.bio_ar) body.append('bio_ar', data?.bio_ar);
        if (data?.bio_ur) body.append('bio_ur', data?.bio_ur);
      }

      if (data?.locale) body.append('locale', data?.locale?.language_culture);
      if (data?.photo_url && data?.photo_url instanceof File) {
        body.append('photo_url', data?.photo_url);
      }

      if (data?.vehicle_number) body.append('vehicle_number', data?.vehicle_number);

      if (data?.languages?.length > 0) {
        data?.languages.forEach((languageItem, index) => {
          body.append(`languages[${index}][id]`, languageItem?.id?.id);
          body.append(`languages[${index}][fluency_level]`, languageItem?.fluency_level ?? '');
        });
      }
      if (data?.license?.length > 0) {
        data?.license.forEach((docItem, index) => {
          // Only append if it's a File/Blob (not a string URL)
          if (docItem?.license_file && typeof docItem.license_file !== 'string') {
            body.append(`license_file[${index}]`, docItem.license_file);
            body.append(`doc_side[${index}]`, docItem?.doc_side ?? '');
          }
        });
      }

      if (
        data?.user_type === 'ASSISTANT' &&
        data?.assistant_id_proof?.front &&
        data?.assistant_id_proof?.back
      ) {
        if (data.assistant_id_proof.front instanceof File) {
          body.append(`assistant_id_proof[0]`, data.assistant_id_proof.front);
          body.append(`assistant_id_side[0]`, 'FRONT');
        }
        if (data.assistant_id_proof.back instanceof File) {
          body.append(`assistant_id_proof[1]`, data.assistant_id_proof.back);
          body.append(`assistant_id_side[1]`, 'BACK');
        }

        if (data?.assistant_id_proof?.expiry) {
          const formattedExpiry = new Date(data.assistant_id_proof.expiry)
            .toISOString()
            .split('T')[0];
          body.append('assistant_id_exipry', formattedExpiry);
        }
      }

      if (data?.max_cash_in_hand_allowed)
        body.append('max_cash_in_hand_allowed', data?.max_cash_in_hand_allowed);
      if (data?.collected_max_cash_in_hand_allowed)
        body.append('collected_max_cash_in_hand_allowed', data?.collected_max_cash_in_hand_allowed);
      if (data?.cash_in_hand && data?.user_type !== 'COLLECTOR' && data?.user_type !== 'ASSISTANT')
        body.append('cash_in_hand', data?.cash_in_hand);

      if (currentUser?.id) {
        body.append('is_active', data?.is_active ? '1' : '0');
        if (user?.user?.user_type === 'SCHOOL_ADMIN') {
          body.append('trainer_id', currentUser?.id);

          response = await createTrainer(body);
        } else {
          body.append('user_id', currentUser?.id);

          response = await updateUser(body);
        }
      } else {
        if (user?.user?.user_type === 'SCHOOL_ADMIN') {
          body.append('vendor_id', user?.user?.school?.vendor_translations[0]?.vendor_id);

          response = await createTrainer(body);
        } else {
          response = await createUser(body);
        }
      }

      if (response) {
        enqueueSnackbar(currentUser ? response?.message : response?.message);
        if (currentUser?.id) {
          revalidateDetails();
        }
        reset();
        if (user?.user?.user_type === 'SCHOOL_ADMIN') {
          router.push(paths.dashboard.school.trainer);
        } else {
          router.push(paths.dashboard.user.details(currentUser?.id ?? response?.data?.user?.id));
        }
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          enqueueSnackbar(errorMessage[0], { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  // Function to add more pairs
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photo_url', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );
  const password = useBoolean();
  const handleDelete = async () => {
    try {
      const response = await deleteUser(currentUser?.id);
      if (response) {
        enqueueSnackbar(t(response?.message ?? 'user_deleted_successfully'));
        router.push(paths.dashboard.user.list);
      }
    } catch (error) {
      if (error?.errors && typeof error?.errors === 'object' && !Array.isArray(error?.errors)) {
        Object.values(error?.errors).forEach((errorMessage) => {
          if (typeof errorMessage === 'object') {
            enqueueSnackbar(errorMessage[0], { variant: 'error' });
          } else {
            enqueueSnackbar(errorMessage, { variant: 'error' });
          }
        });
      } else {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
      confirm.onFalse();
    }
  };

  const confirm = useBoolean();
  if (
    (id && detailsLoading) ||
    // loading ||
    languagesLoading ||
    enumLoading ||
    genderLoading ||
    gearLoading ||
    categoriesLoading
  ) {
    return (
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
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {currentUser?.id && (
          <Grid xs={12} md={4}>
            <Card sx={{ p: 5, mx: 2 }}>
              {currentUser && (
                <Label
                  color={
                    values.is_active === true || values.is_active === 1
                      ? 'success'
                      : values.is_active === false || values.is_active === 0
                      ? 'error'
                      : 'warning'
                  }
                  sx={{ position: 'absolute', top: 24, right: 24 }}
                >
                  {values.is_active ? t('active') : t('inactive')}
                </Label>
              )}

              <Box sx={{ mb: 5 }}>
                <RHFUploadAvatar
                  name="photo_url"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      {t('allowed_formats')} <br /> {t('max_size', { size: fData(3145728) })}
                    </Typography>
                  }
                />
              </Box>

              {currentUser && (
                <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                  <Button variant="soft" color="error" onClick={confirm.onTrue}>
                    {t('delete_user')}
                  </Button>
                </Stack>
              )}
            </Card>
            {values.user_type === 'TRAINER' && (
              <Card sx={{ mt: 3, mx: 2 }}>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(1, 1fr)',
                  }}
                  m={3}
                  // mb={3}
                >
                  {values.user_type === 'TRAINER' && (
                    <RHFTextField
                      name="bio"
                      label={t('about_you')}
                      multiline
                      rows={4}
                      type="text"
                    />
                  )}
                  {values.user_type === 'TRAINER' && (
                    <RHFTextField
                      name="bio_ar"
                      label={t('about_ar')}
                      multiline
                      rows={2}
                      type="text"
                    />
                  )}
                  {values.user_type === 'TRAINER' && (
                    <RHFTextField
                      name="bio_ur"
                      label={t('about_ur')}
                      multiline
                      rows={2}
                      type="text"
                    />
                  )}
                </Box>
              </Card>
            )}
          </Grid>
        )}

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              paddingBottom="10px"
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFSelect
                name="user_type"
                label={t('user_type')}
                // disabled={user?.user?.user_type === 'SCHOOL_ADMIN'}
                // value={user?.user?.user_type === 'SCHOOL_ADMIN' ? 'TRAINER' : undefined}
              >
                {user?.user?.user_type === 'SCHOOL_ADMIN' ? (
                  <MenuItem value="TRAINER">{t('TRAINER')}</MenuItem>
                ) : (
                  filteredValues?.length > 0 &&
                  filteredValues.map((option: any) => (
                    <MenuItem key={option?.value} value={option?.value}>
                      {t(option?.name)}
                    </MenuItem>
                  ))
                )}
              </RHFSelect>

              {values.user_type === 'ADMIN' && (
                <RHFAutocompleteSearch
                  name="roles"
                  label="Select Roles"
                  multiple
                  options={roles?.map((role: any) => ({
                    value: role.id,
                    label: role?.name || t('n/a'),
                  }))}
                  loading={rolesLoading}
                />
              )}

              <RHFTextField
                name="name"
                label={t('name_as_per_profile_card')}
                error={!!errors.name}
                helperText={errors.name?.message || ''}
              />

              {values.user_type === 'TRAINER' && (
                <RHFTextField
                  name="name_ar"
                  label={t('name_as_per_profile_card_ar')}
                  error={!!errors.name_ar}
                  helperText={errors.name_ar?.message || ''}
                />
              )}
              {values.user_type === 'COLLECTOR' && (
                <RHFAutocompleteSearch
                  name="city_assigned"
                  label={t('city_assigned')}
                  multiple
                  // disabled={currentUser?.id}
                  options={
                    cities?.map((c) => {
                      const translation =
                        c.city_translations?.find(
                          (tr) => tr?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                        ) ?? c.city_translations?.[0];

                      return {
                        value: translation?.city_id,
                        label: translation?.name ?? t('unknown'),
                      };
                    }) || []
                  }
                />
              )}
              {values.user_type === 'ASSISTANT' && (
                <RHFAutocompleteSearch
                  name="city_assigned"
                  label={t('city_assigned')}
                  multiple
                  options={
                    cities?.map((c) => {
                      const translation =
                        c.city_translations?.find(
                          (tr) => tr?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                        ) ?? c.city_translations?.[0];

                      return {
                        value: translation?.city_id,
                        label: translation?.name ?? t('unknown'),
                      };
                    }) || []
                  }
                />
              )}

              {values.user_type === 'ASSISTANT' && (
                <RHFAutocompleteSearch
                  name="school_ids"
                  label={t('school')}
                  multiple
                  options={
                    schoolList?.map((c) => {
                      const translation =
                        c.vendor_translations?.find(
                          (tr) => tr?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                        ) ?? c.vendor_translations?.[0];

                      return {
                        value: translation?.vendor_id,
                        label: translation?.name ?? t('unknown'),
                      };
                    }) || []
                  }
                />
              )}

              <RHFTextField
                name="email"
                label={t('email')}
                error={!!errors.email}
                helperText={errors.email?.message || ''}
              />

              <RHFTextField
                name="password"
                label={t('password')}
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {values.user_type === 'COLLECTOR' && (
                <RHFTextField
                  name="collected_max_cash_in_hand_allowed"
                  label={t('max_cash_in_hand_allowed')}
                  type="number"
                />
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                <RHFTextField
                  name="phone"
                  label={t('phone_number')}
                  sx={{ flex: 1 }}
                  prefix="+971"
                />
              </Stack>

              <RHFTextField
                name="dob"
                label={t('date_of_birth')}
                type="date"
                InputLabelProps={{ shrink: true }}
              />

              {values.user_type === 'TRAINER' && (
                <RHFTextField
                  name={`certificate_expiry_date`}
                  label={t('certificate_expiry_date')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              )}
              {values.user_type === 'ASSISTANT' && (
                <RHFSelect name="user_gender" label={t('gender')}>
                  {genderData?.length > 0 &&
                    genderData?.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))}
                </RHFSelect>
              )}
              {values.user_type === 'TRAINER' && (
                <RHFTextField
                  name={`cash_clearance_date`}
                  label={t('cash_clearance_date')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              )}
              {values.user_type === 'TRAINER' && (
                <RHFSwitch name="is_pickup_enabled" label={t('is_pickup_enabled')} />
              )}

              {currentUser?.id && <RHFSwitch name="is_active" label={t('is_active')} />}
            </Box>

            <Divider />
            {values.user_type === 'ASSISTANT' && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, ml: 1 }} color="primary">
                  {t('upload_assistant_id')}
                </Typography>

                <Grid container spacing={2}>
                  {/* Front Side Upload */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, ml: 1 }}>
                      {t('front_side')}
                    </Typography>

                    <RHFFileUpload
                      label={t('assistant_id_front')}
                      name="assistant_id_proof.front"
                      helperText={t('upload_helper_text')}
                    />
                    {values.assistant_id_proof?.front &&
                      typeof values.assistant_id_proof.front === 'string' && (
                        <Box mb={1} ml={1}>
                          <a
                            href={values.assistant_id_proof.front}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="#cf5a0d"
                            style={{ textDecoration: 'underline' }}
                          >
                            {t('view_uploaded_file')}
                          </a>
                        </Box>
                      )}
                  </Grid>

                  {/* Back Side Upload */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, ml: 1 }}>
                      {t('back_side')}
                    </Typography>

                    <RHFFileUpload
                      label={t('assistant_id_back')}
                      name="assistant_id_proof.back"
                      helperText={t('upload_helper_text')}
                    />
                    {values.assistant_id_proof?.back &&
                      typeof values.assistant_id_proof.back === 'string' && (
                        <Box mb={1}>
                          <a
                            href={values.assistant_id_proof.back}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            style={{ textDecoration: 'underline' }}
                          >
                            {t('view_uploaded_file')}
                          </a>
                        </Box>
                      )}
                  </Grid>

                  {/* Expiry Date */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t('document_expiry')}
                    </Typography>
                    <RHFDatePicker name="assistant_id_proof.expiry" label={t('expiry_date')} />
                  </Grid>
                </Grid>
              </>
            )}

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
              mt={3}
            >
              {values.user_type === 'TRAINER' && !!values?.is_pickup_enabled && (
                <>
                  <RHFTextField
                    name="max_radius_in_km"
                    label={t('max_radius_in_km')}
                    type="number"
                  />
                </>
              )}

              {values.user_type === 'TRAINER' && (
                <>
                  <RHFAutocompleteSearch
                    name="vendor_id"
                    label={t('select_school')}
                    placeholder={t('search_school')}
                    options={
                      schoolList && schoolList.length > 0
                        ? [
                            ...schoolList.map((item) => {
                              const translation =
                                item.vendor_translations?.find(
                                  (tr) => tr?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                                ) ?? item.vendor_translations?.[0];

                              return {
                                label: `${translation?.name ?? t('unknown')}${
                                  item.email ? ` - ${item.email}` : ''
                                }`,
                                value: item.id,
                              };
                            }),
                            { label: t('other'), value: null },
                          ]
                        : [{ label: t('other'), value: null }]
                    }
                    defaultValue={defaultOption}
                    setSearchOwner={(searchTerm) => setSearchValue(searchTerm)}
                    disableClearable={false}
                    loading={schoolLoading}
                  />

                  {typeof values.vendor_id === 'object' &&
                    (values.vendor_id?.value === undefined || values.vendor_id?.value === null) && (
                      <RHFTextField name="school_name" label={t('school_name')} />
                    )}

                  <div>
                    <RHFTextField
                      name="vendor_commission_in_percentage"
                      label={t('school_commission')}
                      type="number"
                    />
                    {selectedSchool?.min_commision && selectedSchool?.max_commision ? (
                      <FormHelperText sx={{ color: 'primary.main', ml: 1 }}>
                        {t('school_commission_range', {
                          min: selectedSchool.min_commision || '0',
                          max: selectedSchool.max_commision || '0',
                        })}
                      </FormHelperText>
                    ) : null}
                  </div>
                </>
              )}

              {values.user_type === 'TRAINER' && (
                <>
                  <div>
                    <RHFTextField
                      name="certificate_commission_in_percentage"
                      label={t('certificate_commission')}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={t('certificate_commission_tooltip')} placement="top">
                              <InfoOutlined sx={{ color: 'gray', cursor: 'pointer' }} />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {currentUser?.vendor?.certificate_min_commision &&
                    currentUser?.vendor?.certificate_max_commision ? (
                      <FormHelperText sx={{ color: 'primary.main', ml: 1 }}>
                        {t('Certificate Commission must be between', {
                          min: currentUser?.vendor?.certificate_min_commision || '0',
                          max: currentUser?.vendor?.certificate_max_commision || '0',
                        })}
                      </FormHelperText>
                    ) : null}
                  </div>

                  <RHFTextField name="vehicle_number" label={t('vehicle_number')} type="text" />
                </>
              )}
            </Box>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
              mt={3}
            >
              {/* <RHFAutocomplete
                name="locale"
                label="Locale"
                options={language ?? []}
                getOptionLabel={(option) => (option ? `${option?.name ?? ''}` : '')}
                renderOption={(props, option: any) => {
                  return (
                    <li {...props} key={option?.id}>
                      {option?.name ?? 'Unknown'}
                    </li>
                  );
                }}
              /> */}

              {values.user_type === 'TRAINER' && (
                <>
                  <RHFTextField
                    name="max_cash_in_hand_allowed"
                    label={t('max_cash_in_hand_allowed')}
                    type="number"
                  />
                  <RHFTextField name="cash_in_hand" label={t('cash_in_hand')} type="number" />
                </>
              )}
            </Box>

            {values.user_type !== 'TRAINER' && values.user_type !== 'STUDENT' && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={2}
                sx={{ mt: 3 }}
              >
                <Button variant="outlined" onClick={handleCancel}>
                  {t('cancel')}
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentUser ? t('create_user') : t('save_changes')}
                </LoadingButton>
              </Stack>
            )}
          </Card>
        </Grid>
        {(values.user_type === 'TRAINER' || values.user_type === 'STUDENT') && (
          <Grid xs={12} md={12}>
            <Card sx={{ p: 5, m: 2 }}>
              {(values.user_type === 'TRAINER' || values.user_type === 'STUDENT') && (
                <>
                  <Typography sx={{ fontWeight: '700' }}>{t('user_preferences')}:</Typography>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    sx={{ mt: 2 }}
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                    }}
                  >
                    <RHFAutocompleteSearch
                      name="city_id"
                      label={t('city')}
                      options={
                        cities?.map((option: any) => {
                          const translation =
                            option?.city_translations?.find(
                              (tr) => tr?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                            ) ?? option?.city_translations?.[0];

                          return {
                            value: option?.id ?? 'unknown',
                            label: translation?.name ?? t('unknown'),
                          };
                        }) ?? []
                      }
                      getOptionLabel={(option) => option?.label ?? ''}
                      renderOption={(props, option: any) => (
                        <li {...props} key={option?.value}>
                          {option?.label ?? t('unknown')}
                        </li>
                      )}
                    />

                    <RHFAutocompleteSearch
                      name="area_id"
                      label={t('area')}
                      options={
                        areas?.map((option: any) => {
                          const translation =
                            option?.translations?.find(
                              (tr) => tr?.locale?.toLowerCase() === i18n.language?.toLowerCase()
                            ) ?? option?.translations?.[0];

                          return {
                            value: option?.id ?? 'unknown',
                            label: translation?.name ?? t('unknown'),
                          };
                        }) ?? []
                      }
                      getOptionLabel={(option) => option?.label ?? ''}
                      renderOption={(props, option: any) => (
                        <li {...props} key={option?.value}>
                          {option?.label ?? t('unknown')}
                        </li>
                      )}
                    />

                    <RHFSelect name="gear" label={t('gear')}>
                      {gearData?.length > 0 &&
                        gearData?.map((option: any) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.name}
                          </MenuItem>
                        ))}
                    </RHFSelect>

                    {(values.user_type === 'TRAINER' || values.user_type === 'STUDENT') && (
                      <RHFSelect name="gender" label={t('gender')}>
                        {genderData?.length > 0 &&
                          genderData?.map((option: any) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.name}
                            </MenuItem>
                          ))}
                      </RHFSelect>
                    )}
                  </Box>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    sx={{ mt: 2 }}
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(1, 1fr)',
                    }}
                  >
                    <RHFAutocompleteSearch
                      name="vehicle_type_id"
                      label={t('select_category')}
                      placeholder={t('search_category')}
                      options={
                        categories?.map((item: any) => ({
                          label: item?.category_translations
                            ?.map((translation: any) => translation?.name ?? t('unknown')) // Extract all names
                            .join(' - '), // Display full name
                          value: item?.id ?? t('unknown'),
                        })) ?? []
                      }
                      setSearchOwner={(searchTerm: any) => setSearchCategory(searchTerm)}
                      disableClearable={true}
                      loading={categoriesLoading}
                    />
                  </Box>
                  {values.user_type === 'TRAINER' && (
                    <>
                      {fields.map((languageItem, index) => (
                        <Grid
                          container
                          item
                          spacing={1}
                          sx={{ mt: 2, mb: 2 }}
                          key={languageItem.id || index}
                        >
                          <Grid item xs={12} md={5}>
                            <RHFAutocomplete
                              name={`languages[${index}].id`}
                              label={`${t('language')} ${index + 1}`}
                              getOptionLabel={(option) => (option ? `${option?.dialect_name}` : '')}
                              options={dialects ?? []}
                              renderOption={(props, option: any) => (
                                <li {...props} key={option?.id}>
                                  {option?.dialect_name ?? t('unknown')}
                                </li>
                              )}
                              defaultValue={dialects.find((d) => d.id === languageItem.id) || null}
                            />
                          </Grid>

                          {/* Fluency Level Field */}
                          <Grid item xs={12} md={5}>
                            <RHFSelect
                              name={`languages[${index}].fluency_level`} // Dynamic name for react-hook-form
                              label={t('fluency_level')}
                              defaultValue={languageItem.fluency_level}
                            >
                              {fluencyOptions.map((option: any) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.name}
                                </MenuItem>
                              ))}
                            </RHFSelect>
                          </Grid>

                          {/* Delete Button */}
                          <Grid item xs={12} md={1}>
                            <IconButton onClick={() => handleRemove(index)}>
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}

                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={handleAddMore}>
                          {t('add_language')}
                        </Button>
                      </Grid>
                    </>
                  )}

                  {values.user_type === 'TRAINER' && !currentUser?.id && (
                    <>
                      {licenseFields.map((docItem, index) => (
                        <Grid container item spacing={2} sx={{ mt: 2, mb: 2 }} key={index}>
                          <Grid item xs={12} md={5}>
                            <RHFFileUpload
                              label={t('license_file')}
                              name={`license[${index}].license_file`}
                              helperText={t('upload_helper_text')}
                            />
                          </Grid>

                          {/* Document Side Field */}
                          <Grid item xs={12} md={5}>
                            <RHFSelect
                              name={`license[${index}].doc_side`} // Dynamic name for react-hook-form
                              label={t('document_side')}
                              defaultValue={docItem.doc_side}
                            >
                              {docSideOptions.map((option: any) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.name}
                                </MenuItem>
                              ))}
                            </RHFSelect>
                          </Grid>

                          {/* Delete Button */}
                          <Grid item xs={12} md={2}>
                            <IconButton onClick={() => handleRemoveFile(index)}>
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      {licenseFields?.length < 2 && (
                        <Grid item xs={12} sx={{ mt: 2 }}>
                          <Button variant="contained" onClick={handleAddMoreFile}>
                            {t('add_document')}
                          </Button>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={2}
                sx={{ mt: 3 }}
              >
                <Button variant="outlined" onClick={handleCancel}>
                  {t('cancel')}
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentUser ? t('create_user') : t('save_changes')}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        )}
      </Grid>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={<>{t('confirm_delete_user')}</>}
        onConfirm={() => {
          confirm.onFalse();
          handleDelete();
        }}
        action={
          <Button variant="contained" color="error">
            {t('delete')}
          </Button>
        }
      />
    </FormProvider>
  );
}
