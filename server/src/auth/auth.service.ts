import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/enums/role.enum';
import { RoleEntity } from 'src/realizations/role/entities/role.entity';
import { CreateUserDto } from 'src/realizations/user/dto/create-user.dto';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { UserService } from 'src/realizations/user/user.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SingInDto } from './dto/login.dto';
import { NoSuchRoleException } from 'src/exceptions/NoSuchRole.exception';
import { TokenService } from './token.service';
import { Tokens } from './interfaces/tokens.interface';
import { UserData } from './interfaces/user-data.interface';
import { AbilityFactory, Action } from 'src/ability/ability-factory';
import { ForbiddenError } from '@casl/ability';
import { PrivateChatService } from 'src/realizations/private-chat/private-chat.service';
import { FileService } from 'src/realizations/file/file.service';
import { instanceToPlain } from 'class-transformer';
import { OnlineStatusService } from 'src/realizations/online-status/online-status.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,

    private abilityFactory: AbilityFactory,

    private tokenService: TokenService,

    private privateChatService: PrivateChatService,

    private onlineStatusService: OnlineStatusService,

    private fileService: FileService,
  ) {}

  async validate(userId: number) {
    if (userId) {
      return await this.userRepository.findOneBy({ id: userId });
    }
    return null;
  }

  async signup(
    createUserDto: CreateUserDto,
    device: string,
    avatar?: Express.Multer.File,
  ): Promise<UserData> {
    let user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (user) {
      throw new BadRequestException(
        `User with email '${createUserDto.email}' already exists.`,
      );
    }

    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const defaultUserRole = await this.roleRepository.findOneBy({
      name: Role.USER,
    });

    if (!defaultUserRole) {
      throw new NoSuchRoleException();
    }

    user = await this.userRepository.save({
      ...createUserDto,
      roles: [defaultUserRole],
    });
    const tokens = await this.tokenService.getTokens(user.id, device);

    this.privateChatService.create(
      {
        userIds: [user.id],
      },
      user,
    );

    if (avatar) {
      const fileEntity = await this.fileService.uploadAvatar(user, avatar);
      await this.userRepository.update({ id: user.id }, { avatar: fileEntity });
    }
    await this.onlineStatusService.update({ user, isOnline: false });
    this.userRepository.save(user);

    user = await this.userRepository.findOneBy({ id: user.id });

    const plainUser = instanceToPlain(new UserEntity(user));

    return {
      user: plainUser as UserEntity,
      tokens: tokens,
    };
  }

  async login(
    singInDto: SingInDto,
    device: string,
    refreshToken: string,
  ): Promise<UserData> {
    const { email, password } = singInDto;
    const user = await this.userService.findOne(null, email);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    if (refreshToken) {
      await this.logout(refreshToken);
    }

    const tokens = await this.tokenService.getTokens(user.id, device);
    const plainUser = instanceToPlain(new UserEntity(user));

    return {
      user: plainUser as UserEntity,
      tokens: tokens,
    };
  }

  async googleLogin(
    user: CreateUserDto,
    device: string,
    refreshToken: string,
  ): Promise<UserData> {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const dbUser = await this.userService.findOne(null, user.email);
    if (!dbUser) {
      const userData = await this.signup(user, device);
      return userData;
    }

    await this.logout(refreshToken);

    const tokens = await this.tokenService.getTokens(dbUser.id, device);
    return {
      user: new UserEntity(dbUser),
      tokens: tokens,
    };
  }

  async getSessionDevices(reqUser: UserEntity, userId: number) {
    const dbUser = await this.userService.findOne(userId);

    const ability = await this.abilityFactory.defineAbilityFor(reqUser);
    ForbiddenError.from(ability).throwUnlessCan(
      Action.ReadSessionDevices,
      dbUser,
    );

    return await this.tokenService.getUserSessionDevices(userId);
  }

  async refresh(refreshToken: string): Promise<UserData> {
    const userIdAndTokens = await this.tokenService.refresh(refreshToken);
    const dbUser = await this.userService.findOne(userIdAndTokens.userId);

    return {
      user: new UserEntity(dbUser),
      tokens: userIdAndTokens.tokens,
    };
  }

  async logout(refreshToken: string) {
    return await this.tokenService.removeToken(refreshToken);
  }
}
