# Identificação de code smells

## 1. Duplicação de código nos controllers
O método handle era praticamente idêntico em todos os arquivos de controller. O exemplo abaixo é do ``create-animal.ts`` e ``get-avaiable.ts``, mas o padrão se repetia nos outros.

### 1.1 Trecho de código

```js
// Arquivo: create-animal.ts (Original)
class CreateAnimalController {
  constructor(private readonly createAnimal: CreateAnimalService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { name, type, gender, race, description } = request.body;
    const { user } = request;
    const pictures = request.files as Express.Multer.File[];

    try {
      const pictureBuffers = pictures.map((file) => file.buffer);

      const result = await this.createAnimal.execute({
        name,
        type,
        gender,
        race,
        description,
        userId: user?.id || '',
        pictures: pictureBuffers,
      });

      const statusCode = result.isFailure() ? 400 : 201;

      return response.status(statusCode).json(result.value);
    } catch (err) {
      const error = err as Error;
      console.error('Error creating animal:', error);
      return response.status(500).json({ error: error.message });
    }
  }
}
```

```js
// Arquivo: get-avaiable.ts (Original)
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

      const statusCode = result.isFailure() ? 400 : 200

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error creating animal:', error)
      return response.status(500).json({ error: error.message })
    }
  }
}
```
### 1.2 Duplicação de Código / Violação do Princípio DRY (Don't Repeat Yourself).

Toda a estrutura de try/catch, a lógica para verificar o sucesso ou falha da operação (result.isFailure()), a determinação do statusCode e a formatação da resposta JSON eram repetidas em cada controller. Isso torna a manutenção difícil e aumenta a chance de erros (como visto nas mensagens de log inconsistentes ``console.error('Error creating animal:', error)`` em get-avaiable.ts).

### 1.3 Refatoração Sugerida:

Criar uma função "auxiliar" centralizada para lidar com toda a lógica repetida. Os controllers ficariam por conta só de extrair os dados da requisição e a execução e o tratamento da resposta ficariam conta dessa função.

--- 

## 2. "Magic Numbers"
Números representando status HTTP estão espalhados pelo código dos controllers de animal.

### 2.1 Trecho de código
Em `create-animals.ts`

```js
const statusCode = result.isFailure() ? 400 : 201

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error creating animal:', error)
      return response.status(500).json({ error: error.message })
    }
```

Em `get-user-animal.ts`

```js
const statusCode = result.isFailure() ? 400 : 200

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error creating animal:', error)
      return response.status(500).json({ error: error.message })
    }
  }
```

### 2.2 O problema dos "Magic Numbers"
Usar números literais (400, 500, 201, 401) sem deixar claro o que eles significam acaba prejudicando a legibilidade do código e aumenta o risco de erros de digitação que o compilador não consegue identificar.

### 2.3 Refatoração aplicada
Pra resolver isso, o código foi refatorado substituindo os magic numbers por constantes com nomes mais claros e descritivos. A solução que encontramos foi utilizar a biblioteca `http-status-codes`, que já é bastante utilizada no ecossistema Node.js.

O processo foi simples: instalar essa dependência e ir trocando cada número pela constante correspondente (por exemplo, 404 vira StatusCodes.NOT_FOUND).

---

# 3. Mais de uma responsabilidade no serviço de mensagem

## 3.1 Trecho de código

Em `create-user-chat-message.ts`

```js
export class CreateUserChatMessageService {
  // ...
  async execute(
    params: CreateUserChatMessageDTO.Params,
  ): Promise<CreateUserChatMessageDTO.Result> {
    // ...
    const chat = await this.findOrCreateChat(senderId, receiverId) // <-- lógica de encontrar ou criar chat

    const message = await this.userMessageRepository.create({ // <-- lógica de criar mensagem
      chatId: chat.id,
      senderId,
      content,
    })

    return Success.create(message)
  }

  private async findOrCreateChat(senderId: string, receiverId: string) {
    // ...
  }
}
```

## 3.2 Quebra do princípio da responsabilidade única (SRP)
O serviço CreateUserChatMessageService tem duas responsabilidades diferentes: garantir que exista um chat entre dois usuários (encontrando um ou criando) e criar a mensagem dentro desse chat.

O problema é que a lógica de "encontrar ou criar" um chat faz parte das regras de negócio e provavelmente vai ser útil em outros pontos da aplicação. Ao deixá-la misturada no serviço de criação de mensagens, o código perde coesão e fica mais difícil de reutilizar.

Essa mesma lógica de "encontrar ou criar" também está implementada de forma ligeiramente diferente no serviço CreateUserChatService, evidenciando uma duplicação de regras de negócio.

## Refatoração sugerida
Separar a lógica de negócio de "encontrar ou criar um chat" em um novo serviço próprio. Esse serviço teria como única responsabilidade garantir a existência de um chat entre dois usuários, podendo ser reutilizado em diferentes partes da aplicação.

Com isso, o serviço atual de criação de mensagens seria simplificado: em vez de conter essa lógica dentro dele, apenas chamaria o novo serviço sempre que precisasse obter o chat. Dessa forma, ele ficaria responsável exclusivamente pela criação da mensagem dentro do chat.