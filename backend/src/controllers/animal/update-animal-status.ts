import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes' // Adicionado
import {
  UpdateAnimalStatusService,
  updateAnimalStatusServiceInstance,
} from '../../services/animal/update-animal-status.js'

class UpdateAnimalStatusController {
  constructor(private readonly updateAnimalStatus: UpdateAnimalStatusService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { status } = request.body
    const { id } = request.params
    const { user } = request

    try {
      const result = await this.updateAnimalStatus.execute({
        id,
        status,
        userId: user?.id || '',
      })

      const statusCode = result.isFailure()
        ? StatusCodes.BAD_REQUEST // Modificado
        : StatusCodes.OK // Modificado

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error updating animal:', error)
      return response
        .status(StatusCodes.INTERNAL_SERVER_ERROR) // Modificado
        .json({ error: error.message })
    }
  }
}

export const updateAnimalStatusControllerInstance =
  new UpdateAnimalStatusController(updateAnimalStatusServiceInstance)