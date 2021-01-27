export interface User extends UserInfo {
    passwordHash: string;
    photoLocation?: string;
}

export interface UserInfo {
    id: string;
    username: string;
}