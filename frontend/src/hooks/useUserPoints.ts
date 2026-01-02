import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { UserPoints } from "@/types/user";

export function useUserPoints() {
    const [userPoints, setData] = useState< UserPoints | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState< string | null >(null);

    useEffect(() => {
        userService.getUserPoints()
            .then(res => setData(res.data))
            .catch(() => setError("Unable to fetch data"))
            .finally(() => setLoading(false));
    }, []);

    return {userPoints, loading, error};
}