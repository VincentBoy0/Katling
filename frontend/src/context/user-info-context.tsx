import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { userService } from "@/services/userService";
import { UserInfo, UserInfoUpdate } from "@/types/user";

interface UserInfoContextType {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
  updateUserInfo: (data: UserInfoUpdate) => Promise<UserInfo>;
  refreshUserInfo: () => Promise<void>;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(
  undefined
);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await userService.getUserInfo();
      setUserInfo(res.data);
      setError(null);
    } catch (err) {
      setError("Unable to fetch user info");
      console.error("Failed to fetch user info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const updateUserInfo = async (data: UserInfoUpdate): Promise<UserInfo> => {
    try {
      setLoading(true);
      const res = await userService.updateUserInfo(data);
      setUserInfo(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError("Update failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserInfoContext.Provider
      value={{
        userInfo,
        loading,
        error,
        updateUserInfo,
        refreshUserInfo: fetchUserInfo,
      }}
    >
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfoContext() {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error("useUserInfoContext must be used within UserInfoProvider");
  }
  return context;
}
