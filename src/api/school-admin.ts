import useSWR, { mutate } from 'swr';
import React, { useEffect, useMemo, useState } from 'react';
// utils
import { endpoints, drivysFetcher, drivysCreator, drivysSmasher } from 'src/utils/axios';
import { IOrderItem } from 'src/types/order';

export function updateUserVerification(body: any) {
  const URL = endpoints.schoolAdmin.verify;
  const response = drivysCreator([URL, body]);
  return response;
}
