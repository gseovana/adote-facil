import { PrismaClient } from '@prisma/client'
import { prisma } from '../database.js'
import {
  CreateAnimalRepositoryDTO,
  UpdateAnimalStatusRepositoryDTO,
} from './animal.dto.js'

enum AnimalStatusEnum {
  available = 'available',
  adopted = 'adopted',
  removed = 'removed'
}

type FindAllAvailableNotFromUserParams = {
  userId: string
  gender?: string
  type?: string
  name?: string
}

export class AnimalRepository {
  constructor(private readonly repository: PrismaClient) {}

  async create(
    params: CreateAnimalRepositoryDTO.Params,
  ): Promise<CreateAnimalRepositoryDTO.Result> {
    return this.repository.animal.create({ data: params })
  }

  async updateStatus({
    id,
    status,
    userId,
  }: UpdateAnimalStatusRepositoryDTO.Params) {
    return this.repository.animal.update({
      where: { id, userId },
      data: { status },
    })
  }

  async findAllAvailableNotFromUser({
    userId,
    gender,
    type,
    name,
  }: FindAllAvailableNotFromUserParams) {
    return this.repository.animal.findMany({
      where: {
        userId: { not: userId },
        status: AnimalStatusEnum.available,
        ...(gender ? { gender } : {}),
        ...(type ? { type } : {}),
        ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
      },
      include: { images: true },
    })
  }

  async findAllByUserId(userId: string) {
    return this.repository.animal.findMany({
      where: { userId, status: AnimalStatusEnum.available },
      include: { images: true },
    })
  }
}

export const animalRepositoryInstance = new AnimalRepository(prisma)
