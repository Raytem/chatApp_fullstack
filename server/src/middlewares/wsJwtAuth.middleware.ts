import { NextFunction } from 'express';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { TokenService } from 'src/auth/token.service';
import { UserEntity } from 'src/realizations/user/entities/user.entity';

export type SocketWitUser = Socket & { user: UserEntity };

export const wsJwtAuthMiddleware =
  async (authService: AuthService, tokenService: TokenService) =>
  async (socket: SocketWitUser, next: NextFunction) => {
    const req = socket.request;

    const token = req.headers.authorization?.split(' ')[1] ?? '';
    try {
      const payload = tokenService.validateAccessToken(token);

      const user = await authService.validate(payload.userId);

      socket.user = {
        ...user,
        password: 'hidden',
        fullName: `${user.name} ${user.surname}`,
      };
      next();
    } catch (e) {
      next(e);
    }
  };
