import { useCallback, useEffect, useState } from 'react';

export function useLoad(loader) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) {
          setLoading(true);
          setError('');
        }
        return loader();
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loader, version]);
  return { data, error, loading, reload };
}
