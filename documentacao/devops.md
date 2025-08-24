# 5 DevOps

## 5.1 Há pipeline CI/CD?
Sim, o projeto possui pipeline CI/CD configurado, pois é possível encontrar o arquivo ``.github/workflows/**experimento-ci-cd.yml**`` que realiza a execução do pipeline a cada vez que um Pull Resquest para a branch main é executado. 
 
```
name: experimento-ci-cd

# Evento que aciona o workflow: toda vez que for criado um Pull Request para a branch main
on:
  pull_request:
    branches:
      - main

# Definição dos jobs (tarefas) que serão executadas
jobs:
```

## 5.2 Há testes automatizados no pipeline?
Sim, o projeto possui testes automatizados no pipeline, é possível encontrar as configurações no primeiro job **unit-test**, que roda os testes unitários no backend com Jest. 

- Quando é executado um Pull Request para a branch main o workflow é disparado, e no primeiro job os testes unitários são executados automaticamente com Jest.

```
- name: Executar testes unitários com Jest
        run: |
          cd backend              # Acessa novamente a pasta do backend
          npm test -- --coverage  # Executa os testes e gera relatório de cobertura
```

## 5.3 Há uso de containers?
Sim, o projeto faz uso de containers. O workflow usa **Docker** para construir imagens referentes ao Back-end, Front-end e Banco de Dados, também utiliza **docker compose up** para subir containers de forma temporária para testes de integração, que busca garantir que componentes funcionem corretamente juntos.

- O workflow constrói as imagens Docker definidas no docker-compose.yml
```
  # Segundo job: Build (construção) das imagens Docker
  build:
      - name: Build das imagens Docker
        run: docker compose build  # Executa o build das imagens definidas no docker-compose.yml
```

O workflow sobe os containers temporariamente (backend + banco) para validar que eles funcionam juntos, e logo após alguns segundos, os derruba.

```
 - name: Subir containers com Docker Compose
        working-directory: ./backend
        run: |
          docker compose up -d     # Sobe os containers em segundo plano
          sleep 10                 # Aguarda alguns segundos para garantir que os serviços subam
          docker compose down      # Encerra os containers após o teste
```

---

## 5.4 Sugestão de Melhorias
### 5.4.1 Cache de dependências
Uma ideia de melhoria seria implementar um cache de dependências no workflow, evitando a necessidade de reinstalar todas as bibliotecas em cada execução. Dessa forma, o pipeline aproveita pacotes já baixados anteriormente, reduzindo o tempo de execução dos jobs, economizando recursos e melhorando a performance geral da integração contínua.

```
- name: Setup Node with cache
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: backend/package-lock.json
- name: Install dependeces
  run: npm ci

```

### 5.4.2 Análise estática de código (Linting)

Uma outra sugestão de melhoria é utilizar linting pra garantir a qualidade do código fonte, que é algo importante principalmente em trabalhos que muitas pessoas estão envolvidas. A análise estática vai automatizar essa verificação, encontrando problemas de estilo e más práticas antes da execução dos testes. Colocar isso no pipeline CI/CD vai garantir que todo código enviado pro repositório esteja seguindo os padrões de qualidade definidos.

  ```yaml
      - name: Executar Linter
        run: npm run lint
   ``` 