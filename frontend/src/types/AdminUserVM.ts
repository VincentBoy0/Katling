import { RoleType } from "@/types/user"

export interface AdminUserVM {
  id: number;
  email: string;
  name: string;
  roles: RoleType[];
  is_banned: boolean;
  joined: string;
}