import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { UserEntity } from '../user/entities/user.entity';

@Roles(Role.ADMIN)
@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async addRole(roleName, userId) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException(`No such user with id=${userId}`);
    }

    const hasRole = user.roles.some(
      (roleEntity) => roleEntity.name === roleName,
    );
    if (hasRole) {
      throw new BadRequestException(
        `User has already have a role '${roleName}'`,
      );
    }

    const role = await this.roleRepository.findOneBy({ name: roleName });
    if (!role) {
      throw new BadRequestException(`No such role '${roleName}'`);
    }
    user.roles.push(role);
    await this.userRepository.save(user);

    return user.roles;
  }

  async deleteRole(roleName, userId) {
    if (roleName === Role.USER) {
      throw new BadRequestException(`Role ${Role.USER} is untouchable`);
    }

    const role = await this.roleRepository.findOneBy({ name: roleName });
    if (!role) {
      throw new BadRequestException(`No such role '${roleName}'`);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException(`No such user with id=${userId}`);
    }

    const hasRole = user.roles.some(
      (roleEntity) => roleEntity.name === roleName,
    );
    if (!hasRole) {
      throw new BadRequestException(`User does not have a role '${roleName}'`);
    }

    user.roles = user.roles.filter(
      (roleEntity) => roleEntity.name !== roleName,
    );
    await this.userRepository.save(user);

    return user.roles;
  }

  async create(createRoleDto: CreateRoleDto) {
    return await this.roleRepository.save({ name: createRoleDto.name });
  }

  async findAll() {
    return await this.roleRepository.find();
  }

  async findOne(id: number) {
    return await this.roleRepository.findBy({ id });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new BadRequestException(`No such role id='${id}'`);
    }
    await this.roleRepository.update(id, updateRoleDto);
    return await this.roleRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new BadRequestException(`No such role id='${id}'`);
    }
    await this.roleRepository.delete(id);
    return role;
  }
}
