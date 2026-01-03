import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { User } from "@/types/user";

export function useUser() {
    const [user, setUser] = useState< User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState< string | null>(null);

    useEffect(() => {
        userService.getUser() 
            .then(res => setUser(res.data))
            .catch(() => setError("Unable to fetch data"))
            .finally(() => setLoading(false));
    }, []);

    return {user, loading, error};
}