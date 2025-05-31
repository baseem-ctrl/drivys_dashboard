import axios, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

// Request interceptor to set the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const drivysSmasher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.delete(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const drivysCreator = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.post(url, config);
  return res.data;
};

// ----------------------------------------------------------------------

export const drivysCreatorPut = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.put(url, config);
  return res.data;
};

// ----------------------------------------------------------------------

export const drivysFetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.get(url, { ...config });
  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: 'admin/auth/who-am-i',
    meCollector: 'consumer/auth/who-am-i',
    meAssistant: 'consumer/auth/who-am-i',
    login: 'admin/auth/login',
    register: '/api/auth/register',
    update: 'admin/auth/update-profile', // To update user profile
    delete: 'admin/auth/delete-profile', // To delete user profile
    collectorLogin: 'consumer/auth/login',
    forgotPassword: 'consumer/auth/forgot-password-using-email',
    verifyOTP: 'consumer/auth/verify-password-using-email',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    create: 'admin/product/create-product-translation',
    update: 'admin/product/update-product-mapping',
    list: 'admin/product/get-product-list',
    details: '/api/product/details',
    search: '/api/product/search',
    delete: 'admin/product/delete-product/',
    delete_pic: 'admin/product/delete-product-pictures',
  },
  allimage: {
    create: 'auth/picture/upload-picture-multi',
    createSingle: 'auth/picture/upload-picture',
    list: 'auth/picture/get-picture',
  },
  category: {
    create: 'admin/category/create-category-translation',
    list: 'admin/category/get-category-list-with-translation',
    delete: 'admin/category/delete-category-translation-pictures',
    deleteId: 'admin/category/delete-category/',
  },

  dialect: {
    list: 'admin/dialect/get-list',
    createDialect: 'admin/dialect/create-update',
    updateDilect: 'admin/dialect/create-update',
    getDilectById: 'admin/dialect/get-by-id',
    deleteDilect: 'admin/dialect/delete-by-id',
  },
  language: {
    list: 'admin/user/languages',
    delete: 'admin/user/languages/',
    create: 'admin/user/languages',
    update: 'admin/user/languages/',
  },
  appSettings: {
    list: 'admin/appSetting/get-list',
    update: 'admin/appSetting/create-update',
  },
  coupon: {
    list: 'admin/discount/get-discount-list',
    delete: 'admin/discount/delete-discount/',
    createUpdate: 'admin/discount/create-discount',
  },
  review: {
    getStudentReview: 'admin/reviews/get-students-reviews',
    getTrainerReview: 'admin/reviews/get-trainers-reviews',
    deleteReview: 'admin/reviews/delete-review?',
    updateReview: 'admin/reviews/update-review',
  },
  reviewSchoolAdmin: {
    getStudentReview: 'admin/review-school/get-students-reviews',
    getTrainerReview: 'admin/review-school/get-trainers-reviews',
    deleteReview: 'admin/review-school/delete-review?',
    updateReview: 'admin/reviews/update-review',
  },
  school: {
    list: 'admin/vendor/get-vendor-list',
    details: 'admin/vendor/get-vendor/',
    detailsadmin: 'auth/vendor/get-vendor',
    delete: 'admin/vendor/delete-vendor/',
    create: 'admin/vendor/create-vendor-translation',
    update: 'admin/delivery-slot/create-delivery-slot-translation',
    admin: 'admin/user/get-list',
    getSchoolAdmin: 'admin/user/get-school-admin-list',
    address: 'admin/vendor/address/create-update-address',
    trainers: 'admin/trainers/get-trainer-list',
    addTrainer: 'admin/trainers/create-trainer',
    removeTrainer: 'admin/trainers/delete-trainer/',
    package: {
      getPackageBySchool: 'admin/package/get-school-packge-list',
    },
    bulk: {
      addCommision: 'admin/vendor/bulk/update-commision',
    },
    schoolTrainers: 'admin/trainers/get-school-trainer-list',
    messageToTrainer: 'admin/message/message-to-trainer',
    createRewardTrainer: 'admin/reward/reward-to-trainer',
  },
  schoolAdmin: {
    verify: 'admin/trainerBySchoolAdmin/update-trainer-status',
    locations: 'admin/studentTrainerRadius/get-student-trainer-under-radius',
  },
  homeListing: {
    list: 'admin/home-listing/get-home-listing-list',
    createUpdate: 'admin/home-listing/create-home-listing',
    details: 'admin/home-listing/get-home-listing/',
    delete: 'admin/home-listing/delete-home-listing/',
    deleteTrainer: 'admin/home-listing/remove-trainer-by-trainer-id',
  },
  package: {
    list: 'admin/package/get-packge-list',
    details: 'admin/package/get-packge/',
    delete: 'admin/package/delete-packge/',
    createUpdate: 'admin/package/create-packge-translation',
    publicList: 'public/package/get-packge-list-with-global-package',
  },
  users: {
    enum: 'public/enum/get-user-type-enum',
    genderenum: 'public/enum/get-gender-type-enum',
    gearenum: 'public/enum/get-gear-type-enum',
    listLanguages: 'public/languages',
    listCategories: 'public/category/get-category-list',
    listCities: 'public/city/get-city-list',
    listAreas: 'public/state-province/get-list',
    list: 'admin/user/get-list',
    details: 'admin/trainers/get-trainer/',
    getbyId: 'admin/user/get-user/',
    create: 'admin/auth/register',
    delete: 'admin/user/delete-user-by-id',
    update: 'admin/user/user-update-by-id',
    addressList: 'admin/user/address/get-user-address-list',
    getTrainerAddress: 'admin/user/address/get-trainer-address',
    getTrainerNearestAddress: 'admin/trainers/get-nearest-trainers-list',
    deleteAddressFromList: 'admin/user/address/delete-user-address',
    createNewAdressForUser: 'admin/user/address/create-update-user-address',
    userDocument: {
      createOrUpdate: 'admin/user-docs/create-user-docs',
      getList: 'admin/user-docs/get-user-doc-list',
      getById: 'admin/user-docs/get-doc',
      deleteById: 'admin/user-docs/delete-user-doc',
      deleteAllByUserId: 'admin/user-docs/delete-user-docs',
      approve: 'admin/user-docs/update-approve-doc',
    },
  },
  trainer: {
    getPackages: 'admin/package-trainer/get-trainer-packages/',
    getStudents: 'admin/student/get-student-list',
    delete: 'admin/home-page-listing/delete-listing-trainer-mapping?trainer_mapping_ids[]=',
    createTrainer: 'admin/trainers/school/create-trainer',
    workingHours: {
      createUpdate: 'admin/trainer-working-hours/create',
      deleteById: 'admin/trainer-working-hours/delete-by-id',
      getList: 'admin/trainer-working-hours/get-by-user-id',
      getByUserId: 'admin/trainer-working-hours/get-by-user-id',
    },
    shift: {
      create: 'admin/trainer-working-hours/shifts/set-shift-by-admin',
      get: 'admin/trainer-working-hours/shifts/get-shifts-by-admin',
      delete: 'admin/trainer-working-hours/shifts/delete-shift-by-admin',
    },
    leaveDates: 'admin/leave/get-leave-list',
    noschool: 'admin/user/get-trainer-list-non-vendor',
  },
  slider: {
    list: 'admin/slider/get-slider-list',
    create: 'admin/slider/create-slider',
    create_mapper: 'homeSliderMapping/create',
    update: 'admin/slider/update-slider',
    delete: 'admin/slider/delete-slider/',
    delete_slider_pictures: 'admin/slider/delete-slider-pictures?picture_ids[]=',
    details: 'admin/slider/get-slider/',
    search: 'homeSlider/search',
    frequencyEnum: 'enum/getHomeSliderFrequencyEnum',
  },
  city: {
    list: 'admin/city/get-city-list',
    createTranslation: 'admin/city/create-city-translation',
    updateTranslation: 'admin/city/create-city-translation',
    getById: 'admin/city/get-city-list',
    getByList: 'admin/city/get-city-list',
    delete: 'admin/city/delete-city/',
    createPackage: 'admin/package-city/create-packge-city',
    getPackageList: 'admin/package-city/get-package-city',
    deletePackageList: 'admin/package-city/delete-packge-city/',
    updateResheduleBulk: 'admin/city/update-reschedule-setting-in-bulk',
  },
  state: {
    createStateTranslation: 'admin/state-province/create-state-translation',
    updateStateTranslation: 'admin/state-province/create-state-translation',
    getById: 'admin/state-province/get-by-id',
    getByList: 'admin/state-province/get-list',
    deleteById: 'admin/state-province/delete-by-id',
    deleteStateProvince: 'admin/state-province/delete-state-translation',
  },
  packageDocument: {
    createOrUpdate: 'admin/package-doc/upload-doc',
    getList: 'admin/package-doc/get-doc-list',
    getById: 'admin/package-doc/get-doc',
    deleteById: 'admin/package-doc/delete-doc',
    deleteAllByPackageId: 'admin/package-doc/delete-package-docs',
  },
  booking: {
    getList: 'admin/booking/get-bookings-list',
    getById: `admin/booking/get-booking-by-id`,
    schoolAdmin: {
      getList: 'admin/booking/school/get-bookings-list',
      getById: `admin/booking/school/get-booking-by-id`,
    },
    updatePaymentBookingStatus: 'admin/booking/update-booking-and-payment-status',
    getBookingStatus: 'public/enum/get-booking-status-enum',
    getBookingById: 'admin/booking/get-bookings-by-student-id',
    getPaymentStatus: 'public/enum/get-payment-status-type-enum',
    refund: {
      list: 'admin/booking/refund/get-request-list',
      update: 'admin/booking/refund/update-status-by-booking-id',
      updateStatus: 'admin/booking/refund/update-refund-request',
      refundedList: 'admin/booking/refund/get-refunded-list',
    },
  },
  packageTrainer: {
    list: 'admin/package-trainer/get-trainer-packages',
    delete: 'admin/package-trainer/delete-packge-trainer',
    create: 'admin/package-trainer/create-packge-trainer',
  },
  enum: {
    bookingMethodEnum: 'public/enum/get-booking-method-type-enum',
    bookingStatusEnum: 'public/enum/get-booking-status-enum',
    driverStatusEnum: 'public/enum/get-driver-status-type-enum',
    paymentMethodEnum: 'public/enum/get-payment-method-type-enum',
    paymentRefundStatusEnum: 'public/enum/get-payment-refund-status-type-enum',
    paymentStatusEnum: 'public/enum/get-payment-status-type-enum',
    refundRequestStatus: 'public/enum/get-refund-request-status-enum',
    sessionStatusEnum: 'public/enum/get-session-status-type-enum',
    sessionTypeEnum: 'public/enum/get-session-type-enum',
    getPaymentMethodEnum: 'public/enum/get-payment-transfer-payment-method-enum',
  },
  notification: {
    getList: 'admin/notification/get-list',
    send: 'admin/notification/send-notification',
  },
  pendingRequest: {
    trainerPendingRequest: 'admin/trainerPendingRequest/get-list',
    rejectAcceptPendingRequest: 'admin/trainerPendingRequest/update-trainer-status',
    updateVerificationStatus: 'admin/trainerBySchoolAdmin/update-trainer-status',
    schoolAdminTrainerPendingRequest: 'admin/trainerBySchoolAdmin/get-trainer-request-list',
  },
  pickup: {
    list: 'admin/cityPickupExclusion/get-list',
    createUpdate: 'admin/cityPickupExclusion/create-update',
    getById: 'admin/cityPickupExclusion/get-by-id',
    delete: 'admin/cityPickupExclusion/delete-by-id',
  },
  analytics: {
    admin: 'admin/analytics/get-admin-analytics',
    schoolAdmin: 'admin/analytics/get-school-analytics',
    schoolAdminRevenue: 'admin/analytics/get-school-revenue',
    adminRevenue: 'admin/analytics/get-admin-revenue',
    getStudentInsights: 'admin/analytics/get-students-insights',
    getTrainerInsights: 'admin/analytics/get-trainers-analytics',
  },
  certificate: {
    list: 'admin/certificate-request/get-requests-list',
    addRequestByAdmin: 'admin/certificate-request/add-request',
    updateRequestPaymentStatus: 'admin/certificate-request/update-request-payment-status',
    updateRequestStatus: 'admin/certificate-request/update-request-status',
  },
  loyalityProgram: {
    list: 'admin/trainer-rewards/get-rewards-list',
    getById: 'admin/trainer-rewards/get-rewards-list',
    createUpdate: 'admin/trainer-rewards/create-update-reward-translation',
    delete: 'admin/trainer-rewards/delete-reward-by-id',
    eligibleRewardTrainerList: 'admin/trainerAchievementReward/get-list',
    processTrainerReward: 'admin/trainerAchievementReward/ahievement-reward?id',
  },
  location: {
    getLiveTrainerLocation: 'admin/trainers/get-live-location-trainers-list',
  },
  payouts: {
    trainerPayouts: 'admin/payout/get-by-trainers',
    schoolPayouts: 'admin/payout/get-by-vendors',
    getList: 'admin/payout/get-list',
    payToTrainer: 'admin/payout/transfer/trainer-pay',
    getPayoutHistory: 'admin/payout/transfer/get-list',
    getPayoutByBooking: 'admin/payout/get-by-bookings',
    payToSchool: 'admin/payout/transfer/vendor-pay',
    getPayoutBySchool: 'admin/payout/get-trainers-payout-by-school',
  },
  profileUpdate: {
    list: 'admin/trainerProfileupdate/get-list',
    unverifyTrainer: 'admin/trainerProfileupdate/un-verify',
  },
  commission: {
    listAdmin: 'admin/vendor/get-vendors-commission-list',

    listAdminTrainerCommission: 'admin/trainers/get-school-trainer-commission-list',
    updateCommission: 'admin/trainers/set-school-trainer-commission',
  },
  collector: {
    getCashInHand: 'collector/cash/get-trainer-cash-in-hand-list',
    collectCash: 'collector/cash/cash-collection',
    cashCollectedListPerTransaction: 'collector/cash/cash-collected-list-per-transaction',
    cashCollectedListPerTrainer: 'collector/cash/cash-collected-list',
  },
  termsAndConditions: {
    getList: 'admin/appSetting/get-tc',
    createUpdate: 'admin/appSetting/createUpdateTC',
  },
  reportSessionPreview: {
    booking: 'admin/reports/preview/bookings',
    revenue: 'admin/reports/preview/revenue',
    trainer: 'admin/reports/preview/trainers',
    student: 'admin/reports/preview/students',
    school: 'admin/reports/preview/schools',
  },
  reportSessionDownload: {
    booking: 'admin/reports/bookings',
    revenue: 'admin/reports/revenue',
    trainer: 'admin/reports/trainers',
    student: 'admin/reports/students',
    school: 'admin/reports/schools',
  },
  updateFCMToken: 'consumer/auth/update-fcm-token',
  rolesAndPermission: {
    getRoles: 'admin/role/get-list',
    getPermissions: 'admin/permission/get-list',
    createRole: 'admin/role/create-update',
    createPermission: 'admin/permission/create-update',
    mapRoleToPermission: 'admin/role/permission-mapping/role-permission-mapping',
    listMappedRoles: 'admin/role/permission-mapping/get-list',
  },
  collectorAdminView: {
    collectorCashInHand: `admin/cash-collection/get-collector-cash-in-hand-list`,
    collectorCollectedCashInHand: `admin/cash-collection/cash-collected-list-per-transaction`,

    collectCash: 'admin/cash-colmapRoleToPermissionlection/cash-collection',
  },
  support: {
    list: 'admin/support/get-list',
  },
  schoolReportSessionPreview: {
    booking: 'admin/reportBySchool/bookings',
    revenue: 'admin/reportBySchool/revenues',
    trainer: 'admin/reportBySchool/trainers',
    student: 'admin/reportBySchool/students',
    school: 'admin/reportBySchool/school',
  },
  rolesAndPermissionSchoolAdmin: {
    getRoles: 'admin/access-control-for-school-admin/role/get-list-by-admin',
    getPermissions: 'admin/access-control-for-school-admin/permission/get-list-by-admin',
    createRole: 'admin/access-control-for-school-admin/role/create-by-admin',
    createPermission: 'admin/access-control-for-school-admin/permission/create-by-admin',
    mapRoleToPermission:
      'admin/access-control-for-school-admin/permission-mapping/role-permission-mapping-by-admin',
    listMappedRoles: 'admin/access-control-for-school-admin/permission-mapping/get-list-by-admin',
  },
  assistant: {
    updateProfile: 'consumer/auth/update-profile',
    student: {
      list: 'assistant/student/get-student-list',
      addStudent: 'assistant/student/register',
    },
  },
};
