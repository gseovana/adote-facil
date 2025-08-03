# Arquitetura de Software

## Arquitetura Monolítica

O Adote-Fácil segue uma arquitetura monolítica modularizada. Backend, frontend e banco de dados estão integrados e são executados juntos via Docker Compose. Apesar da separação por pastas, tudo roda como uma única aplicação, o que caracteriza um monolito.

---

## Arquitetura em Camadas

O backend é organizado em camadas, o que ajuda na separação de responsabilidades:

- **Roteamento (Controller):** recebe as requisições e repassa pro serviço certo.  
- **Serviço (Lógica de Negócio):** onde ficam as regras da aplicação.  
- **Persistência (Model):** camada que lida com o banco usando Prisma.

---

## Padrão MVC

A estrutura do backend segue o padrão **MVC (Model-View-Controller)**:

- **Model:** esquemas do Prisma que representam as entidades (como `User`, `Animal`, `Chat` etc).  
- **Controller:** rotas e handlers do Express que lidam com as requisições.  
- **View:** o frontend em Next.js funciona como a camada de visualização, mesmo estando separado do backend.
