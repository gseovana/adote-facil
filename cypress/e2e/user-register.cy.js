// cypress/e2e/cadastro.cy.ts

describe('Testes de Aceitação para o Fluxo de Cadastro', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/cadastro'); 
  });

  // Cenário Principal: Cadastro de um novo usuário com sucesso
  it('deve permitir o cadastro de um novo usuário com dados válidos', () => {
    const userEmail = `teste_${Date.now()}@email.com`;

    cy.get('input[name="name"]').type('Teste');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type('senha123');
    cy.get('input[name="confirmPassword"]').type('senha123');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/login');

    cy.on('window:alert', (textoDoAlert) => {
      expect(textoDoAlert).to.equal('Cadastro efetuado com sucesso! Faça login para acessar nossa plataforma!');
    });

});

// Cenário alternativo 1: 
it('deve exibir uma mensagem de erro ao tentar cadastrar um email que já existe', () => {
    cy.intercept('POST', '/users', {
      statusCode: 409,
      body: {
        message: 'Email já cadastrado.',
      },
    }).as('createUserRequest');

    cy.on('window:alert', (textoDoAlert) => {
      expect(textoDoAlert).to.equal('Email já cadastrado.');
    });

    cy.get('input[name="name"]').type('Usuario');
    cy.get('input[name="email"]').type('email.existente@email.com');
    cy.get('input[name="password"]').type('outrasenha456');
    cy.get('input[name="confirmPassword"]').type('outrasenha456');

    cy.get('button[type="submit"]').click();
    
    cy.wait('@createUserRequest');
});

  // Cenário Alternativo 2: Tentativa de cadastro sem preencher um campo obrigatório
  it('deve exibir uma mensagem de erro de validação se o email não for preenchido', () => {
    cy.get('input[name="name"]').type('Teste');
    cy.get('input[name="password"]').type('senha789');
    cy.get('input[name="confirmPassword"]').type('senha789');

    cy.get('button[type="submit"]').click();

    cy.contains('O email é obrigatório').should('be.visible');
    
    cy.url().should('include', '/cadastro');
  });
});