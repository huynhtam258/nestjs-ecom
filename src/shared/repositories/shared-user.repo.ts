import { Injectable } from "@nestjs/common";
import { UserType } from "../models/shared-user.model";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
    })
  }
}