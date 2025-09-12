export interface RegisterUser {
    name: string;
    email: string;
    password: string;
}


export interface VerifyUser {
    otp: string;
    email: string;
}


export interface LoginUser {
    email: string;
    password: string;
}