import React, { useEffect } from 'react';
import { PATH_AFTER_LOGIN, PATH_AFTER_LOGIN_COLLECTOR } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';

export const DummyRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('user_type') === 'COLLECTOR') {
      alert('Inside login collector');
      router.push(PATH_AFTER_LOGIN_COLLECTOR);
    } else {
      alert('Outside login collector');

      router.push(PATH_AFTER_LOGIN);
    }
  }, []);
  return <div>dummyRedirect</div>;
};
