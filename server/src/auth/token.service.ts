import { RedisService } from '@liaoliaots/nestjs-redis';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { AccessTokenPayload } from './interfaces/access_token-payload.interface';
import { RefreshTokenPayload } from './interfaces/refresh_token-payload.interface';
import { Tokens } from './interfaces/tokens.interface';
import { jwtConfig } from 'config/jwt.config';
import { UserIdAndTokens } from 'src/interfaces/userId-and-tokens.interface';

export class TokenService {
  private redis: Redis;

  constructor(
    @Inject(jwtConfig.KEY)
    private jwtCfg: ConfigType<typeof jwtConfig>,

    private jwtService: JwtService,

    private redisService: RedisService,
  ) {
    this.redis = redisService.getClient();
  }

  validateRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload: RefreshTokenPayload = this.jwtService.verify(token, {
        secret: this.jwtCfg.refreshTokenSecret,
      }) as RefreshTokenPayload;
      return payload;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  validateAccessToken(token: string): AccessTokenPayload {
    try {
      const payload: AccessTokenPayload = this.jwtService.verify(token, {
        secret: this.jwtCfg.accessTokenSecret,
      }) as AccessTokenPayload;
      return payload;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async getTokens(userId: number, device: string): Promise<Tokens> {
    const accessTokenPayload: AccessTokenPayload = {
      userId,
    };

    const jti = uuidv4();
    const refreshTokenPayload: RefreshTokenPayload = {
      userId,
      jti,
      device,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.jwtCfg.accessTokenSecret,
      expiresIn: this.jwtCfg.accessTokenLifetime,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.jwtCfg.refreshTokenSecret,
      expiresIn: this.jwtCfg.refreshTokenLifetime,
    });

    const redisTokenKey = `${refreshToken}:${userId}:${jti}`;
    const redisTokenTTL_sec = this.jwtCfg.refreshCookieLifetime / 1000;
    await this.redis.hset(redisTokenKey, refreshTokenPayload);
    await this.redis.expire(redisTokenKey, redisTokenTTL_sec);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(token): Promise<UserIdAndTokens> {
    const payload = this.validateRefreshToken(token);
    const redisTokenKey = `${token}:${payload.userId}:${payload.jti}`;
    const keyIsExists = await this.redis.exists(redisTokenKey);

    if (!keyIsExists) {
      throw new UnauthorizedException('Non-valid refresh');
    }

    await this.removeToken(token);
    const tokens = await this.getTokens(payload.userId, payload.device);
    return {
      userId: payload.userId,
      tokens,
    };
  }

  async removeToken(token: string) {
    const payload = this.validateRefreshToken(token);
    const redisTokenKey = `${token}:${payload.userId}:${payload.jti}`;
    await this.redis.del(redisTokenKey);
    return token;
  }

  async logoutFromSessionsExcept(token: string) {
    const payload = this.validateRefreshToken(token);
    const curTokenKey = `${token}:${payload.userId}:${payload.jti}`;
    let keys = await this.redis.keys(`*:${payload.userId}:*`);
    keys = keys.filter((key) => key !== curTokenKey);
    await this.redis.del(keys);
    return await this.getUserSessionDevices(payload.userId);
  }

  async getUserSessionDevices(userId: number): Promise<string[]> {
    const tokenKeys = await this.redis.keys(`*${userId}*`);
    if (tokenKeys.length === 0) {
      return [];
    }

    const devices = [];
    for (const key of tokenKeys) {
      const keyData = await this.redis.hgetall(key);
      devices.push(keyData.device);
    }
    return devices;
  }
}
