import { RoleType } from "./role-type.enum";

export interface User {
    id?: number;
    employeeId?: string;
    position?: string;
    status?: string;
    department?: string;
    firstName: string;
    lastName?: string;
    nickName?: string;
    role: RoleType;
    username: string;
    password: string;
    createDate?: string;
  }