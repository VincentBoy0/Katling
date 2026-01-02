export enum Sex {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  UNDISCLOSED = "UNDISCLOSED",
}

export enum RoleType {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  LEARNER = "LEARNER"
}

export interface User {
  id: number;
  firebase_uid: string;
  email?: string;
  username?: string;
  is_banned: boolean;
  last_active_date?: string;
  created_at: string;
}

export interface UserInfo {
  id: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  full_name: string;
  date_of_birth?: string;
  sex?: Sex;
  phone?: string;
  email_alternate?: string;
  country?: string;
  city?: string;
  address?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UserInfoUpdate {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string; 
  sex?: Sex;
  phone?: string;
  email_alternate?: string;
  country?: string;
  city?: string;
  address?: string;
  bio?: string;
}

export interface UserPoints {
  id: number;
  user_id: number;
  xp: number;
  streak: number;
  energy: number;
  last_energy_update: string;
}

export interface UserPointsUpdate {
  xp?: number;
  streak?: number;
}