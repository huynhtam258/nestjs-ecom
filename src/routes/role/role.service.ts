import { BadRequestException, Injectable } from '@nestjs/common'
import { RoleRepo } from 'src/routes/role/role.repo'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from 'src/routes/role/role.error'
import { RoleName } from 'src/shared/constants/role.constant'

@Injectable()
export class RoleService {
  constructor(private roleRepo: RoleRepo) {}

  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw NotFoundRecordException
    }
    return role
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      const role = await this.roleRepo.create({
        createdById,
        data,
      })
      return role
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      const role = await this.roleRepo.findById(id)
      if (!role) {
        throw NotFoundRecordException
      }
      // Không cho bất kỳ ai cập nhật role ADMIN
      if (role.name === RoleName.Admin) {
        throw ProhibitedActionOnBaseRoleException
      }
      const updatedRole = await this.roleRepo.update({
        id,
        updatedById,
        data,
      })
      return updatedRole
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      const role = await this.roleRepo.findById(id)
      if (!role) {
        throw NotFoundRecordException
      }
      // Không cho phép bất kỳ ai có thể xóa 3 role cơ bản này
      const baseRoles: string[] = [RoleName.Admin, RoleName.Client, RoleName.Seller]
      if (baseRoles.includes(role.name)) {
        throw ProhibitedActionOnBaseRoleException
      }
      await this.roleRepo.delete({
        id,
        deletedById,
      })
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}