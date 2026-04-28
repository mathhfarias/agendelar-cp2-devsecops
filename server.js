const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>AgendeLar</title>
      </head>
      <body>
        <h1>AgendeLar</h1>
        <p>Sistema web para agendamento de serviços residenciais.</p>

        <h2>Login</h2>
        <form method="POST" action="/login">
          <label>Usuário:</label>
          <input type="text" name="usuario" />

          <label>Senha:</label>
          <input type="password" name="senha" />

          <button type="submit">Entrar</button>
        </form>

        <hr />

        <h2>Buscar Serviço</h2>
        <form method="GET" action="/buscar">
          <input type="text" name="q" placeholder="Ex: encanador, eletricista..." />
          <button type="submit">Buscar</button>
        </form>
      </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const { usuario } = req.body;

  /*
    Vulnerabilidade proposital:
    O valor digitado pelo usuário é devolvido diretamente na resposta HTML,
    sem validação e sem sanitização.
  */
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Login - AgendeLar</title>
      </head>
      <body>
        <h1>Bem-vindo, ${usuario}</h1>
        <p>Login processado com sucesso.</p>
        <a href="/">Voltar</a>
      </body>
    </html>
  `);
});

app.get("/buscar", (req, res) => {
  const termo = req.query.q || "";

  /*
    Vulnerabilidade proposital:
    O parâmetro de busca é refletido na página sem tratamento.
  */
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Busca - AgendeLar</title>
      </head>
      <body>
        <h1>Resultado da busca</h1>
        <p>Você pesquisou por: ${termo}</p>
        <a href="/">Voltar</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`AgendeLar rodando em http://localhost:${PORT}`);
});