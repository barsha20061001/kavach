import { useEffect, useState } from "react";

export function useApi(load, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.resolve()
      .then(load)
      .then(result => {
        if (active) setData(result);
      })
      .catch(err => {
        if (active) setError(err.message || "Unable to load data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, dependencies);

  return { data, loading, error, setData };
}
