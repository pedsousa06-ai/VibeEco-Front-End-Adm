<<<<<<< HEAD
# 🖥️ VibeEco-Front-End-Adm

<p align="center">
  <strong>Interface administrativa da plataforma VibeEco</strong>
</p>

---

## 📌 Sobre este repositório

Este repositório contém a **interface administrativa** do VibeEco, destinada aos administradores responsáveis pelo gerenciamento e acompanhamento da plataforma. Ela consome a **API Administrativa**.

**Responsável:** Gabriel Sousa — [GitHub](https://github.com/GabrielsrMelo)

---

## 🏗️ Posição na arquitetura

```mermaid
flowchart TD
    FEA["🖥️ Front-end Admin<br/>(este repositório)"] --> APIA["⚙️ API Admin"]
    APIA --> DB[("🗄️ Banco de Dados")]
```

API utilizada: [VibeEco-Back-End-Adm](https://github.com/pedsousa06-ai/VibeEco-Back-End-Adm)

---

## 🎯 Responsabilidades

- Implementação das telas dos protótipos administrativos;
- Implementação da identidade visual;
- Desenvolvimento dos componentes;
- Integração com a API Administrativa;
- Testes das interfaces;
- Correção e manutenção do Front-end.

---

## 🧩 Principais áreas

### 🔐 Acesso

- Login administrativo;
- Primeiro acesso;
- Recuperação de senha.

### 📊 Dashboard

- Visão geral da plataforma;
- Atalhos administrativos;
- Indicadores de participação.

### 👥 Gerenciamento

- **Usuários:** visualização, cadastro, edição e exclusão;
- **Missões:** cadastro, edição, objetivos, recompensas e acompanhamento;
- **Desafios:** cadastro, edição, objetivos, período e recompensas;
- **Conteúdos educativos:** cadastro, edição, categorias, anexos, descrição e tipos;
- **Recompensas** e **Conquistas**.

### 📈 Monitoramento

- Participação dos usuários;
- Atividades, missões e desafios;
- Indicadores, resultados e relatórios;
- Configurações administrativas.

---

## 🎨 Identidade visual

- 🌱 Verde como cor principal;
- Tons claros, branco e tons neutros;
- Interface moderna, limpa e acessível;
- Aparência profissional.

Protótipos: <!-- TODO: colocar o link do Figma (Administrativo) -->

---

## ⚙️ Como executar

<!-- TODO: informar tecnologias, versões e comandos reais -->

### Pré-requisitos

- `<Node.js / runtime e versão>`
- API Administrativa em execução

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/pedsousa06-ai/VibeEco-Front-End-Adm.git
cd VibeEco-Front-End-Adm

# 2. Instalar as dependências
<comando de instalação>

# 3. Configurar as variáveis de ambiente
cp .env.example .env

# 4. Executar em modo de desenvolvimento
<comando de execução>
```

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `<API_URL>` | URL base da API Administrativa |

---

## 📁 Estrutura do projeto

<!-- TODO: ajustar conforme a estrutura real -->

```text
VibeEco-Front-End-Adm
│
├── 📁 src
│   ├── 📁 components   # Componentes reutilizáveis
│   ├── 📁 pages        # Telas
│   ├── 📁 services     # Integração com a API
│   └── 📁 styles       # Identidade visual
└── 📄 README.md
```

---

## 🧪 Testes

- Testes das telas;
- Testes de navegação;
- Testes de integração com a API;
- Testes das funcionalidades;
- Testes de interface.

---

## 🔐 Segurança

- Acesso restrito a administradores autenticados;
- Exibição de funcionalidades conforme as permissões;
- Não expor credenciais no código.

---

## 📊 Status

🚧 **Em desenvolvimento**

- [ ] Acesso administrativo
- [ ] Dashboard administrativo
- [ ] Gerenciamento de usuários, missões, desafios e conteúdos
- [ ] Gerenciamento de recompensas e conquistas
- [ ] Monitoramento e relatórios
- [ ] Integração com a API
- [ ] Testes

---

## 🌱 Sobre o VibeEco

O **VibeEco** é uma plataforma digital desenvolvida pela **TechProton** para promover a conscientização e o engajamento em sustentabilidade, por meio de conteúdos educativos, missões, desafios, gamificação e interação social.

🔗 **Repositório principal:** [VibeEco](https://github.com/pedsousa06-ai/VibeEco)

### 📦 Repositórios do projeto

| Área | Repositório | Responsável |
|------|-------------|-------------|
| 🗄️ Banco de Dados | [VibeEco-DataBase](https://github.com/pedsousa06-ai/VibeEco-DataBase) | Ryller Feitosa |
| ⚙️ Back-end Usuários | [VibeEco-Back-End-Users](https://github.com/pedsousa06-ai/VibeEco-Back-End-Users) | Lucas Kolle |
| ⚙️ Back-end Administrativo | [VibeEco-Back-End-Adm](https://github.com/pedsousa06-ai/VibeEco-Back-End-Adm) | Lucas Kolle |
| 🖥️ Front-end Usuários | [VibeEco-Front-End-Users](https://github.com/pedsousa06-ai/VibeEco-Front-End-Users) | Gabriel Sousa |
| 🖥️ Front-end Administrativo | [VibeEco-Front-End-Adm](https://github.com/pedsousa06-ai/VibeEco-Front-End-Adm) | Gabriel Sousa |
| 📱 Mobile | [VibeEco-Mobile](https://github.com/pedsousa06-ai/VibeEco-Mobile) | Pedro Sousa |

---

## 📄 Licença

Este projeto foi desenvolvido pela equipe TechProton como parte do projeto VibeEco. Informações sobre licenciamento e distribuição deverão ser definidas pela equipe responsável pelo projeto.

## 👨‍💻 TechProton

| | |
|---|---|
| **Projeto** | VibeEco |
| **Empresa** | TechProton |
| **Categoria** | Tecnologia • Sustentabilidade • Educação |
| **Status** | Em desenvolvimento |
| **Início** | 10/08/2026 |
