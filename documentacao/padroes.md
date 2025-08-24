# Padrões e Princípios

## 1 Padrões Aplicados

### 1.1 Service Layer
- **Service Layer**: Padrão que separa a lógica de negócios em uma camada de serviço onde é concentrada toda logica de negócio da aplicação, ela atua como uma intermediária entre o controller e o repositorie.
  - O controller não conhece e não executa nenhuma ação de lógica de negócio, tudo é feito pela camada de serviço.

### 1.2 Princípio da Responsabilidade Única (SOLID) (Coesão)
- **Princípio da responsabilidade única**: cada classe, função deve ser responsável por uma única responsabilidade. 
  - Cada classe é resposável por fazer somente uma unica ação, por exemplo, a classe para criar um usuário, executa somente esta ação. 

```
class CreateUserController {
  constructor(private readonly createUser: CreateUserService) {}

  async handle(req: Request, res: Response) {
    const { name, email, password } = req.body 
    const result = await this.createUser.execute({ name, email, password }) 
    const status = result.isFailure() ? 400 : 201     
    return res.status(status).json(result.value)
  }
}
```

```
export class CreateUserService {
  constructor(
    private readonly encrypter: Encrypter,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: CreateUserDTO.Params): Promise<CreateUserDTO.Result> {
    const { name, email, password } = params

    const userAlreadyExists = await this.userRepository.findByEmail(email)

    if (userAlreadyExists) {
      return Failure.create({ message: 'Email já cadastrado.' })
    }

    const hashedPassword = this.encrypter.encrypt(password)

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    })

    return Success.create(user)
  }
}
```
---

### 1.3 Repository 

Padrão que atua como uma camada de abstração, separando a lògica de negócio do acesso e persistência dos dados. A camada de repositorie utiliza o ORM Prisma, que realiza de fato a persistência dos dados no banco.

```
export class UserRepository {
  constructor(private readonly repository: PrismaClient) {}

  create(params: { name: string; email: string; password: string }) {
    return this.repository.user.create({ data: params })
  }

  findByEmail(email: string) {
    return this.repository.user.findUnique({ where: { email } })
  }
}
```

---

### 1.4 Singleton 
Padrão que garante apenas uma única instancia de uma determinada classe seja criada durante todo o ciclo de vida da aplicação, oferecendo um ponto de acesso global a essa instância, evitando a criação de múltiplos objetos desnecessários e reduzindo o consumo de recursos. 

- Esse padrão facilita a manutenção e a troca de dependências, já que basta substituir a instância única para mudar o comportamento (como trocar o ORM ou o banco de dados).

```
export const prisma = new PrismaClient() 
```
      



---

### 1.5 Princípio da Segregação de Interfaces (SOLID)(Coesão)
O objetivo é evitar que clientes dependam de interfaces com métodos que não vão usar. 

- A criação do DTO (Data Transfer Object) fornece contratos de dados específicos para cada contexto da aplicação. Assim, cada operação (criação, atualização, resposta) utiliza apenas os campos necessários, evitando acoplamento desnecessário e exposição de informações irrelevantes.
   

```
//para criar um usuário precisam ser enviados exatamente estes campos, seguir essa estrutura de contrato 

export namespace CreateUserRepositoryDTO {
  export type Params = { name: string; email: string; password: string }
  export type Result = User
}
```

---

## 2 Sugestão de Padrões

### 2.1 Princípio da Inversão de Dependência (SOLID)(Acoplamento)
Esse princípio recomenda que uma classe cliente deve estabelecer dependências prioritariamente com abstrações e não com implementações concretas

- Criar uma interface para expor os métodos do Repository para serem utilizados no Service, dessa forma, passam a depender de abstrações, não de classes concretas realizando o import desta classe, obtendo acesso a todo conteúdo.


```
import { User } from '@prisma/client'
export interface IUserRepository {
  create(p: { name: string; email: string; password: string }): Promise<User>
  findByEmail(email: string): Promise<User | null>
}
```

```
import { IUserRepository } from '../../repositories/user.contract'
export class CreateUserService {
  constructor(
    private readonly encrypter: Encrypter,
    private readonly userRepository: IUserRepository, 
  ) 
}
```

---
