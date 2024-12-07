import { endpoints, drivysCreator, drivysSmasher } from 'src/utils/axios';

// ----------------------------------------------------------------------
export function Login(body: any) {
  const URL = endpoints.auth.login;
  const response = drivysCreator([URL, body]);
  return response;
}

// Function to update user profile
export async function UpdateProfile(body: any) {
  const URL = endpoints.auth.update;
  const requiredKeys = [
    'name',
    'email',
    'phone',
    'country_code',
    'locale',
    'password',
    'photo_url',
  ];

  const missingKeys = requiredKeys.filter((key) => !(key in body));

  if (missingKeys.length > 0) {
    console.error('Missing required fields:', missingKeys);
  } else {
    console.log('All required fields are present.');
  }
  const response = await drivysCreator([URL, body]);
  return response;
}

// Function to delete user profile
export async function DeleteUserProfile(userId: string) {
  const URL = endpoints.auth.delete; // 'admin/auth/delete-profile'

  // Check if userId is provided
  if (!userId) {
    console.error('User ID is required to delete the profile.');
    return null;
  }

  try {
    // Use drivysSmasher to make a DELETE request with userId
    const response = await drivysSmasher([URL, { data: { userId } }]);
    return response;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------
