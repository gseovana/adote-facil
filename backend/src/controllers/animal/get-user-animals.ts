import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes' // Adicionado
import {
  GetUserAnimalsService,
  getUserAnimalsServiceInstance,
} from '../../services/animal/get-user.js'

class GetUserAnimalsController {
  constructor(private readonly getUserAnimals: GetUserAnimalsService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { user } = request

    try {
      const result = await this.getUserAnimals.execute({
        userId: user?.id || '',
      })

      const statusCode = result.isFailure()
        ? StatusCodes.BAD_REQUEST // Modificado
        : StatusCodes.OK // Modificado

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Erro ao obter animais do usuário:', error) // Mensagem de log corrigida
      return response
        .status(StatusCodes.INTERNAL_SERVER_ERROR) // Modificado
        .json({ error: error.message })
    }
  }
}

export const getUserAnimalsControllerInstance = new GetUserAnimalsController(
  getUserAnimalsServiceInstance,
)