import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useRole = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();
  const { data: role, isLoading } = useQuery({
    queryKey: ["role"],
    queryFn: async () => {
      const { data } = await axiosSecure(`user/role/${user?.email}`);
      return data.role;
    },
  });
  return [role, isLoading]
};

export default useRole;
