import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes' // Adicionado
import {
  CreateAnimalService,
  createAnimalServiceInstance,
} from '../../services/animal/create-animal.js'

class CreateAnimalController {
  constructor(private readonly createAnimal: CreateAnimalService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { name, type, gender, race, description } = request.body
    const { user } = request
    const pictures = request.files as Express.Multer.File[]

    try {
      const pictureBuffers = pictures.map((file) => file.buffer)

      const result = await this.createAnimal.execute({
        name,
        type,
        gender,
        race,
        description,
        userId: user?.id || '',
        pictures: pictureBuffers,
      })

      const statusCode = result.isFailure()
        ? StatusCodes.BAD_REQUEST // Modificado
        : StatusCodes.CREATED // Modificado

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error creating animal:', error)
      return response
        .status(StatusCodes.INTERNAL_SERVER_ERROR) // Modificado
        .json({ error: error.message })
    }
  }
}

export const createAnimalControllerInstance = new CreateAnimalController(
  createAnimalServiceInstance,
)