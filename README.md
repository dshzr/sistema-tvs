# Well Builders - Sistema de Anúncios para TV

Um sistema premium e moderno para gerenciamento de sinalização digital (Digital Signage), com design inspirado na Apple e infraestrutura 100% na nuvem.

## 🚀 Tecnologias e Cloud
- **Framework:** [Nuxt 3](https://nuxt.com/)
- **Banco de Dados:** [Turso](https://turso.tech/) (SQLite na Nuvem)
- **Armazenamento de Mídia:** [Cloudinary](https://cloudinary.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Estilização:** CSS Premium (Apple Style)

## 🛠️ Configuração de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://sua-url-aqui
TURSO_AUTH_TOKEN=seu-token-aqui

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
```

## 🚀 Como Rodar Localmente
1. Instale as dependências: `npm install`
2. Sincronize o banco de dados: `npx drizzle-kit push`
3. Inicie o projeto: `npm run dev`

## 🌍 Deploy na Vercel
O projeto está configurado para deploy automático na Vercel.
1. Conecte seu repositório no dashboard da Vercel.
2. Adicione todas as variáveis de ambiente do seu `.env` nas configurações da Vercel (**Settings > Environment Variables**).
3. Faça o deploy!

## 📺 Acessando o Sistema
- **Painel Administrativo:** `/admin`
- **Player da TV:** `/player`

---
Desenvolvido por Well Builders.
