import { LoginDto } from "../../types/dtos/user/LoginDto";
import { SignupResponse } from "../../types/interfaces/SignupResponse";
import { $api } from "../http/api";

class AuthService {
  async signUp(createUserDto: FormData): Promise<SignupResponse> {
    const res = await $api.post('/auth/signup', createUserDto);
    return res.data;
  }

  async login(loginDto: LoginDto): Promise<SignupResponse> {
    const res = await $api.post('/auth/login', loginDto);
    return res.data;
  }

  async logout() {
    const res = await $api.get('/auth/logout');
    return res.data;
  }

  async refresh(): Promise<SignupResponse> {
    const res = await $api.get('/auth/refresh');
    return res.data;
  }
}

export const authService = new AuthService();