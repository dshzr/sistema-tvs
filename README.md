# Sistema de Anúncios para TV (Digital Signage)

Um sistema moderno e robusto para gerenciamento de anúncios em TVs de condomínios, empresas ou áreas públicas. Desenvolvido com Nuxt 3 e SQLite.

## 🚀 Tecnologias Utilizadas

- **Framework:** [Nuxt 3](https://nuxt.com/)
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Estilização:** CSS Vanilla / Tailwind (conforme configurado)
- **Ícones:** Lucide Vue Next

## 📋 Pré-requisitos

- **Node.js:** Versão 18.x ou superior
- **NPM:** Gerenciador de pacotes padrão

## 🛠️ Instalação e Configuração

1.  **Instalar dependências:**
    ```bash
    npm install
    ```

2.  **Configurar o Banco de Dados (SQLite):**
    O sistema utiliza Drizzle para gerenciar o banco. Para criar as tabelas iniciais no arquivo `sqlite.db`, execute:
    ```bash
    npx drizzle-kit push
    ```

3.  **Migrar dados (Opcional):**
    Se você tiver um arquivo `data/announcements.json` antigo e quiser importar para o banco:
    ```bash
    npx tsx scripts/migrate-json-to-sqlite.ts
    ```

## 💻 Como Rodar

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.

## 📺 Acessando o Sistema

- **Painel Administrativo:** `http://localhost:3000/admin`
  - Aqui você gerencia os anúncios (adicionar, remover, reordenar e editar duração).
  - A senha padrão configurada é `admin123`.
- **Player da TV:** `http://localhost:3000/player`
  - Link que deve ser aberto nas TVs para exibição em loop.

## 🗄️ Gerenciando o Banco de Dados

Para visualizar os dados do banco SQLite de forma visual e fácil (Drizzle Studio):

```bash
npx drizzle-kit studio
```

## 📁 Estrutura do Projeto

- `server/database/schema.ts`: Definição das tabelas do banco de dados.
- `server/api/`: Endpoints da API para gerenciamento de anúncios e configurações.
- `pages/`: Telas do sistema (Admin e Player).
- `public/uploads/`: Pasta onde ficam salvos os arquivos de imagem e vídeo enviados.
- `sqlite.db`: Arquivo do banco de dados (não deve ser deletado).

---

Desenvolvido com ❤️ por Antigravity.
