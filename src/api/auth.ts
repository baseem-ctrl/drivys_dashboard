import { endpoints, barryCreator } from 'src/utils/axios';

// ----------------------------------------------------------------------
export function Login(body: any) {
  const URL = endpoints.auth.login;
  const response = barryCreator([URL, body]);
  return response;
}

// ----------------------------------------------------------------------
