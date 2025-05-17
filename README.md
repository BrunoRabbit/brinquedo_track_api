# Banco de Dados Local com Docker + Prisma

Este projeto utiliza Docker + Prisma para testes e desenvolvimento local. Abaixo estão os passos para configurar o banco e integrá-lo com o Prisma.


## ✅ Requisitos

- [Docker](https://www.docker.com/products/docker-desktop) instalado
- Node.js + Prisma instalados globalmente ou via `npx`
- Versao do node usada: 18


## ▶️ Subindo o Banco com Docker

Execute o comando abaixo no terminal para iniciar o PostgreSQL:

```bash
docker run --name brinquedo_track \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=brinquedo_track \
  -p 5432:5432 \
  -d postgres:15
```
- Se utilizar dbeaver ou outro cliente, vc pode acessar com essas informacoes
```
Host: localhost
Port: 5432
Database: brinquedo_track
User: postgres
Password: 1234
```

# Configuração do .env
Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:

env
```
DATABASE_URL="postgresql://postgres:1234@localhost:5432/brinquedo_track"
```
depois execute no terminal:
```
npx prisma migrate dev --name init
npx prisma generate
```

*se houver algum problema de inicialização, desabilite o firewall temporariamente apenas para executar as requests*

## Endpoints da API

## 🔐 Autenticação (`/auth`)

> Prefixo: `/auth`

| Método | Rota       | Descrição                        | Autenticado |
|--------|------------|----------------------------------|-------------|
| POST   | `/login`   | Realiza o login e retorna token  | ❌          |
| POST   | `/register`| Cria um novo usuário             | ❌          |
| POST   | `/logout`  | Encerra a sessão                 | ✅          |

## 👤 Clientes (`/`)

> Prefixo: `/`

| Método | Rota               | Descrição                           | Autenticado |
|--------|--------------------|-------------------------------------|-------------|
| POST   | `/customer`        | Cria um novo cliente                | ✅          |
| GET    | `/customers`       | Lista todos os clientes             | ✅          |
| PUT    | `/customer`        | Edita os dados de um cliente        | ✅          |
| DELETE | `/customer/:email` | Remove um cliente pelo e-mail       | ✅          |

---

## 📊 Estatísticas (`/stats`)

> Prefixo: `/stats`

| Método | Rota              | Descrição                                    | Autenticado |
|--------|-------------------|----------------------------------------------|-------------|
| GET    | `/daily-sales`    | Retorna o total de vendas agrupadas por dia  | ✅          |
| GET    | `/top-clients`    | Retorna os clientes com mais vendas          | ✅          |

## 📈 Detalhes: Estatísticas com Dados Simulados

O endpoint `/stats/daily-sales` agrupa e retorna as vendas realizadas por dia. Ele depende da existência de clientes no banco de dados para associar as vendas. Com os dados mockados é necessario ter no minimo 1 cliente

### 🔧 Funcionamento:

- Se **não houver clientes cadastrados**, a API retorna:
  ```json
  {
    "error": "Sem clientes para associar às vendas."
  }
