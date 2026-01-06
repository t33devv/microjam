import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchStatus = async () => {
      setLoadingAdmin(true);
      try {
        const { data } = await apiClient.get("/user/me");
        if (!ignore) {
          setIsAdmin(Boolean(data?.isAdmin));
        }
      } catch (error) {
        if (!ignore) {
          setIsAdmin(false);
        }
      } finally {
        if (!ignore) {
          setLoadingAdmin(false);
        }
      }
    };

    fetchStatus();

    return () => {
      ignore = true;
    };
  }, []);

  return { isAdmin, loadingAdmin };
}

export default useAdminStatus;
