# geovanikalil.site — Site Pessoal & Portfólio Técnico

Estrutura completa, moderna, responsiva e sem dependências de build para o site pessoal e portfólio de **Geovani Kalil** (`geovanikalil.site`).

## ✨ Características

- **Stack Limpa:** HTML5 semântico, CSS3 moderno (Custom Properties, Grid, Flexbox, Glassmorphism) e JavaScript puro (ES6+).
- **Identidade Visual:** Tema escuro (*Midnight Dark Blue*) com iluminação ambiente em tons de azul profundo (`#060a14`, `#0a1022`) e destaques em azul ciano neon suave (`#38bdf8`) e azul elétrico (`#2563eb`).
- **Manutenção Simples:** Projetos técnicos e artigos ficam centralizados em `assets/js/data.js` para fácil edição.
- **Pronto para Produção:** Inclui `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest` e ícone vetorial (`favicon.svg`).

## 📁 Estrutura de Pastas

```text
gk.site/
├── index.html                    # Página principal com todas as 5 seções
├── 404.html                      # Página de erro personalizada
├── robots.txt                    # Diretivas para motores de busca
├── sitemap.xml                   # Mapa do site para SEO
├── site.webmanifest              # Manifesto Web App
├── README.md                     # Documentação do projeto
└── assets/
    ├── css/
    │   └── styles.css            # Estilos, variáveis de cores e responsividade
    ├── js/
    │   ├── data.js               # Dados dos Projetos Técnicos e Artigos/Discussões
    │   └── main.js               # Lógica de filtros, modal de leitura, menu mobile e cópia de e-mail
    └── img/
        ├── favicon.svg           # Ícone monograma "GK" em azul/ciano
        └── avatar-placeholder.svg# Ilustração de perfil vetorial
```

## 🛠️ Como Personalizar Conteúdo

1. **Projetos e Artigos:** Abra `assets/js/data.js` e edite os arrays `projects` e `articles`.
2. **Trajetória, Bio e Redes Sociais:** Edite diretamente os textos e links nas seções correspondentes do `index.html`.
3. **Cores e Tema:** As variáveis de cor estão no topo de `assets/css/styles.css` dentro de `:root`.

## 🚀 Como Publicar em Produção (`geovanikalil.site`)

Como o projeto é 100% estático e não requer etapa de compilação, basta subir os arquivos para qualquer serviço de hospedagem moderna:

- **Cloudflare Pages / Vercel / Netlify:** Conecte o repositório Git (sem comando de build e com diretório de saída `./`) e adicione o domínio customizado `geovanikalil.site`.
- **GitHub Pages:** Suba para a branch `main`, ative o GitHub Pages nas configurações do repositório e configure o domínio `geovanikalil.site`.
