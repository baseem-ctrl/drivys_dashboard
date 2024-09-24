import { endpoints, drivysCreator } from 'src/utils/axios';

// ----------------------------------------------------------------------
export function Login(body: any) {
  const URL = endpoints.auth.login;
  const response = drivysCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
