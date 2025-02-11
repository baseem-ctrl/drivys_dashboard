import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export function useRouter() {
  const navigate = useNavigate();

  const router = useMemo(
    () => ({
      back: () => navigate(-1),
      forward: () => navigate(1),
      reload: () => window.location.reload(),
      push: (href: string, query?: Record<string, any>) => {
        const searchParams = new URLSearchParams(query).toString();
        navigate(searchParams ? `${href}?${searchParams}` : href);
      },
      replace: (href: string) => navigate(href, { replace: true }),
    }),
    [navigate]
  );

  return router;
}
