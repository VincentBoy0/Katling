import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { UserInfo, UserInfoUpdate } from "@/types/user";

export function useUserInfo() {
    const [userInfo, setInfo] = useState< UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState< string | null>(null);

    const fetchUserInfo = () => {
        setLoading(true);
        userService.getUserInfo() 
            .then(res => setInfo(res.data))
            .catch(() => setError("Unable to fetch data"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);


    const updateUserInfo = async (updateInfo: UserInfoUpdate) => {
        setLoading(true);

        try {
            const res = await userService.updateUserInfo(updateInfo);
            setInfo(res.data);
            return res.data;
        } catch(err) {
            setError("Update failes");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {userInfo, loading, error, updateUserInfo, refreshUserInfo: fetchUserInfo};
}