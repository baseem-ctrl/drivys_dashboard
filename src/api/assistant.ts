import { endpoints, drivysCreator } from 'src/utils/axios';

export function updateProfile(body: any) {
  const URL = endpoints.assistant.updateProfile;
  const response = drivysCreator([URL, body]);
  return response;
}
