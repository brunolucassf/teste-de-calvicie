# Teste de Calvície

Quiz interativo de perfil capilar, desenvolvido para o **Dr. Ito Meireles** (cirurgião plástico, CRM-BA 16994, Membro Titular da SBCP & ABCRC) — em produção em [testedecalvicie.com.br](https://testedecalvicie.com.br).

O visitante responde a um questionário guiado sobre o próprio padrão de queda capilar e recebe, ao final, um perfil personalizado — **leve, moderado ou avançado** — com um guia aprofundado disponível para compra (Pix ou cartão), entregue por e-mail.

> Este repositório traz a camada de front-end do projeto (interface, quiz, páginas de resultado) como amostra de portfólio. O back-end (API, regras de negócio, integrações de pagamento e segurança) é mantido em repositório privado.

## O que tem aqui

- **Quiz dinâmico** com árvores de perguntas separadas por gênero, barra de progresso e navegação validada (toda pergunta é obrigatória antes de avançar).
- **Páginas de resultado** com vídeo vertical de orientação, escala visual do perfil identificado e oferta do guia em PDF.
- **Checkout** integrado a Pix e cartão.
- **LGPD**: tela de consentimento, política de cookies e termos de uso como páginas próprias.
- **Rastreamento** com Meta Pixel (carregado só após consentimento de marketing).

## Stack

HTML, CSS e JavaScript "vanilla" (sem framework de front-end), com foco em performance (LCP/INP/CLS) e acessibilidade. O quiz e as páginas de resultado são renderizados dinamicamente a partir de uma definição de perguntas em JS.

## Estrutura

```
public/
  index.html                  página inicial
  quiz.html                   motor do quiz
  calvicie-leve.html          resultado — perfil leve
  calvicie-moderada.html      resultado — perfil moderado
  calvicie-avancada.html      resultado — perfil avançado
  js/quiz-engine.js           motor de navegação do quiz
  js/quiz-definition.js       definição das perguntas
  js/result-profile.js        montagem do resultado
  css/                        design system do projeto
```

---

Desenvolvido por **Fonte Dev · Bruno Lucas** — [fontedev.com](https://fontedev.com)
