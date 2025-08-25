import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes' // Adicionado
import {
  GetAvailableAnimalsService,
  getAvailableAnimalsServiceInstance,
} from '../../services/animal/get-available.js'

class GetAvailableAnimalsController {
  constructor(
    private readonly getAvailableAnimals: GetAvailableAnimalsService,
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { user } = request
    const { gender, type, name } = request.query

    try {
      const result = await this.getAvailableAnimals.execute({
        userId: user?.id || '',
        gender: gender ? String(gender) : undefined,
        type: type ? String(type) : undefined,
        name: name ? String(name) : undefined,
      })

      const statusCode = result.isFailure()
        ? StatusCodes.BAD_REQUEST // Modificado
        : StatusCodes.OK // Modificado

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Erro ao obter animais disponíveis:', error) // Mensagem de log corrigida
      return response
        .status(StatusCodes.INTERNAL_SERVER_ERROR) // Modificado
        .json({ error: error.message })
    }
  }
}

export const getAvailableAnimalsControllerInstance =
  new GetAvailableAnimalsController(getAvailableAnimalsServiceInstance)