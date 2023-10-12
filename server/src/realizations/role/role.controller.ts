import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseEnumPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';

@ApiTags('role')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiCreatedResponse({ type: RoleEntity, isArray: true })
  @Patch('/:roleName/:userId')
  async addRole(
    @Param('roleName', new ParseEnumPipe(Role)) roleName: Role,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.roleService.addRole(roleName, userId);
  }

  @ApiCreatedResponse({ type: RoleEntity, isArray: true })
  @Delete('/:roleName/:userId')
  async deleteRole(
    @Param('roleName', new ParseEnumPipe(Role)) roleName: Role,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.roleService.deleteRole(roleName, userId);
  }

  @ApiCreatedResponse({ type: RoleEntity })
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.roleService.create(createRoleDto);
  }

  @ApiCreatedResponse({ type: RoleEntity, isArray: true })
  @Get()
  async findAll() {
    return await this.roleService.findAll();
  }

  @ApiCreatedResponse({ type: RoleEntity })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.roleService.findOne(id);
  }

  @ApiCreatedResponse({ type: RoleEntity })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.roleService.update(id, updateRoleDto);
  }

  @ApiCreatedResponse({ type: RoleEntity })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.roleService.remove(id);
  }
}
