import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { UserPoints, UserPointsUpdate } from "@/types/user";

export function useUserPoints() {
    const [userPoints, setPoints] = useState< UserPoints | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState< string | null >(null);

    useEffect(() => {
        userService.getUserPoints()
            .then(res => setPoints(res.data))
            .catch(() => setError("Unable to fetch data"))
            .finally(() => setLoading(false));
    }, []);

    const fetchUserPoints = async () => {
        setLoading(true);
        try {
            const res = await userService.getUserPoints();
            setPoints(res.data);
            setError(null);
        } catch (err) {
            setError("Unable to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const updateUserPoints = async (updatePoints: UserPointsUpdate) => {
        setLoading(true);

        try {
            const res = await userService.updateUserPoints(updatePoints);
            setPoints(res.data);
        } catch (err) {
            setError("Update failed");
        } finally {
            setLoading(false);
        }
    }

    const refetchUserPoints = () => {
        fetchUserPoints();
    };

    return {userPoints, loading, error, updateUserPoints, refetchUserPoints};
}
