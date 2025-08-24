# Análise e possíveis melhorias nos testes automatizados

## Situação atual

Os testes unitários do projeto estão cobrindo bem os cenários de sucesso, em que tudo dá certo.  
A maior parte da lógica principal de negócio e validações de entrada já está sendo testada.  

Outro ponto positivo é o uso de mocks para isolar a camada de serviços das dependências externas, como o banco de dados.  
Isso está bem feito e é importante.  


## O que pode melhorar  

Mesmo com essa boa base, identificamos que os cenários de falha não são testados, o que pode deixar os testes mais completos.  

Nenhum serviço estava preparado para lidar com exceções inesperadas (por exemplo, se o repositório lançar um erro de conexão com o banco). Nesses casos, a aplicação simplesmente quebraria.    

## Exemplo aplicado: `UpdateUserService`

```js
test('should return failure if findById throws an error', async () => { ... });
test('should return failure if update throws an error', async () => { ... });
```

--- 
# Testes de Aceitação – Cadastro de Usuário

## Cenário Principal: Cadastro de um novo usuário com sucesso  

Esse é o "caminho feliz". O teste garante que, ao preencher todos os dados corretamente, o usuário consiga criar uma conta na plataforma sem problemas.  

**Passos:**  
1. **Dado que** o usuário está na página inicial da aplicação.  
2. **Quando** ele clica no link `"Cadastre-se"`.  
3. **E** é redirecionado para a página de cadastro (`/cadastro`).  
4. **E** preenche o campo `"Nome"` com um nome válido (ex.: `"Camila"`).  
5. **E** preenche o campo `"Email"` com um email ainda não cadastrado (ex.: `"teste@email.com"`).  
6. **E** preenche o campo `"Senha"` com uma senha válida (ex.: `"senha123"`).  
7. **E** preenche o campo `"Confirme a Senha"` com a mesma senha do campo `"Senha"` (ex.: `"senha123"`).  
8. **E** clica no botão `"Cadastrar"`.  
9. **Então** um alerta `"Cadastro efetuado com sucesso! Faça login para acessar nossa plataforma!"` deve ser exibida.   
9. **E** ele deve ser redirecionado para a página de login (`/login`).

---

## Cenário Alternativo 1: Tentativa de cadastro com email já existente  

Esse teste garante que a aplicação não permita emails duplicados. Ele também valida a integração entre frontend e backend.  

**Passos:**  
1. **Dado que** o usuário está na página de cadastro.  
2. **E** já existe um usuário no sistema com o email `"email.existente@email.com"`.  
3. **Quando** ele preenche o campo `"Nome"` com um nome válido.  
4. **E** preenche o campo `"Email"` com `"email.existente@email.com"`.  
5. **E** preenche o campo `"Senha"` com uma senha válida.  
6. **E** preenche o campo `"Confirme a senha"` com a mesma senha do campo `"Senha"`.  
6. **E** clica no botão `"Cadastrar"`.  
7. **Então** ele deve permanecer na página de cadastro.  
8. **E** uma mensagem de erro `"Email já cadastrado"` deve ser exibida.  

---

## Cenário Alternativo 2: Tentativa de cadastro sem preencher um campo obrigatório  

Esse teste cobre a validação do formulário no frontend, garantindo que o usuário receba feedback antes de enviar dados incompletos para o servidor.  

**Passos:**  
1. **Dado que** o usuário está na página de cadastro.  
2. **Quando** ele preenche o campo `"Nome"`, `"Senha"` e `"Confirme a senha"`.  
3. **Mas** deixa o campo `"Email"` em branco.  
4. **E** clica no botão `"Cadastrar"`.  
5. **Então** o formulário não deve ser enviado.  
6. **E** uma mensagem de erro de validação `"O email é obrigatório"` deve aparecer abaixo do campo de email.  

---

# Como executar os testes

1. Instale o cypress no projeto via terminal:

```
npm install cypress --save-dev
```

2. Inicialize com:

```
npx cypress open
```

3. Isso abrirá a interface do Cypress e você pode rodar os testes por lá.