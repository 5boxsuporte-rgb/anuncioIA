# AnúncioIA

Cole o link de um anúncio do Mercado Livre e receba uma **análise com nota de 0 a 100**, sugestões de melhoria e um **anúncio otimizado** (título, descrição, 5 benefícios, ficha técnica, FAQ, palavras-chave, plano de imagens, anúncio patrocinado, Instagram, WhatsApp, roteiro de vídeo, 10 melhorias, objeções e cross-sell).

> **Funciona sem nenhuma chave de API**: o botão **Testar demonstração** mostra um resultado completo com um produto fictício.

---

## 1. Tecnologias

| Parte | Tecnologia |
|---|---|
| Site + API | Next.js 15 (App Router) + TypeScript |
| Visual | Tailwind CSS |
| Validação | Zod |
| Banco | PostgreSQL + Prisma ORM (opcional em desenvolvimento) |
| Login | E-mail/senha (bcrypt) + cookie de sessão assinado (JWT, `jose`) |
| IA | Camada própria (`lib/ai`): OpenAI e Anthropic prontos; AWS Bedrock preparado |
| Testes | Vitest |

## 2. Estrutura

```
app/                 páginas e rotas de API (/api/analyze, /api/auth/*, /api/status)
components/          interface (landing, loading, resultado, botões de copiar)
lib/ai/              provedores de IA (provider.ts escolhe; openai.ts, anthropic.ts, bedrock.ts)
lib/prompts/         prompt da IA (analyzeListing.ts)
lib/validation/      schemas Zod (resposta da IA, formulários)
lib/marketplace/     Mercado Livre: validação de URL, leitura de dados públicos, entrada manual
lib/scoring/         cálculo das notas (critérios documentados em criteria.ts)
lib/analysis/        orquestra: dados → IA → notas
lib/demo/            anúncio e resultado fictícios do modo demo
lib/billing/         planos, créditos e interface de pagamento (sem gateway ainda)
lib/db/              persistência (memória ou PostgreSQL/Prisma)
lib/auth/            sessão e senha
lib/export/          formatação e exportação (TXT pronto; PDF/DOCX/CSV preparados)
lib/security/        sanitização e limite de requisições
prisma/schema.prisma modelos: User, Product, Analysis, GeneratedContent, UsageRecord
tests/               testes automatizados
```

## 3. Instalar e executar (passo a passo)

Você precisa do **Node.js 20 ou superior** (https://nodejs.org).

```bash
npm install          # instala as dependências
npm run dev          # inicia em http://localhost:3000
```

Abra http://localhost:3000 e clique em **TESTAR DEMONSTRAÇÃO**. Pronto.

Outros comandos:

```bash
npm test             # testes
npm run lint         # verificação de código
npm run typecheck    # verificação de tipos
npm run build        # build de produção
npm start            # roda o build (precisa de AUTH_SECRET, veja abaixo)
```

## 4. Configurar o `.env`

```bash
cp .env.example .env
```

Edite o `.env` com um editor de texto. **Nunca** envie esse arquivo para o GitHub (já está no `.gitignore`).

| Variável | Para quê |
|---|---|
| `AUTH_SECRET` | Segredo do login. Obrigatório em produção. Gere com `openssl rand -base64 32` |
| `DATABASE_URL` | Endereço do PostgreSQL (opcional no início) |
| `AI_PROVIDER` | `openai` ou `anthropic` |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Chave e modelo (padrão `gpt-4o-mini`) |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Chave e modelo (padrão `claude-sonnet-5-5`) |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEDROCK_MODEL_ID` | Reservadas para o Bedrock (ainda não implementado) |
| `RATE_LIMIT_PER_MINUTE` | Análises por IP por minuto (padrão 10) |

As chaves ficam **somente no servidor**; o navegador nunca as recebe.

## 5. Modo demo

- Botão **TESTAR DEMONSTRAÇÃO** na página inicial.
- Não precisa de login, de IA nem de banco.
- **Não consome créditos.**
- O conteúdo é pré-escrito para um produto fictício (“Organizador de Maquiagem Acrílico com 12 Divisórias”). As **notas** são calculadas de verdade pelo mesmo código das análises reais.

## 6. Conectar a IA (análises reais)

1. Crie uma chave no provedor (OpenAI ou Anthropic).
2. No `.env`, por exemplo:
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sua-chave
   ```
3. Reinicie o `npm run dev`.
4. Crie uma conta no site (**Criar conta**) e analise um anúncio.

A resposta da IA é validada com Zod. Se vier inválida, o sistema pede uma correção automática uma vez; se ainda assim falhar, mostra uma mensagem amigável (e **não cobra crédito**).

Para adicionar outro provedor: crie `lib/ai/<nome>.ts` implementando `AiProvider` e registre em `lib/ai/provider.ts`. Nenhum outro arquivo precisa mudar.

## 7. Mercado Livre e entrada manual

`lib/marketplace/mercadolivre.ts` valida que o link é do Mercado Livre, tenta ler **apenas dados públicos** (API pública e a própria página, com uma requisição cada, sem seguir redirecionamentos) e normaliza.

**O sistema não tenta burlar CAPTCHA, login, bloqueios ou limites.** Se não conseguir, exibe *“Não conseguimos acessar automaticamente todas as informações deste anúncio.”* e abre o formulário de **inserção manual** (título, descrição, preço, marca, modelo, características, ficha técnica e informações adicionais). A IA usa só o que você informar.

> Na prática, o Mercado Livre costuma exigir autenticação em sua API e proteger as páginas; por isso **a entrada manual deve ser esperada com frequência** até uma integração com a **API oficial (OAuth)** ser feita. O ponto de extensão está comentado em `mercadolivre.ts`.

## 8. Como as notas são calculadas

Em `lib/scoring/criteria.ts`. Cada categoria (Título 20%, Descrição 20%, Informações 15%, SEO 15%, Benefícios 10%, Conversão 10%, Imagens 10%) soma 100 pontos em verificações objetivas (ex.: título entre 40 e 60 caracteres, sem termos promocionais, sem palavras repetidas; descrição sem links/telefones; etc.). Nenhuma nota vem da IA. A nota “depois” é **potencial** e usa os mesmos critérios. As notas **não** garantem aumento de vendas. Em inserção manual, as imagens são “não avaliadas”.

## 9. Banco de dados

Sem `DATABASE_URL`, usuários e análises ficam **em memória** (somem ao reiniciar) — suficiente para testar.

Com PostgreSQL:

```bash
# exemplo com Docker
docker run --name anuncioia-db -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=anuncioia -p 5432:5432 -d postgres:16
# no .env:
# DATABASE_URL="postgresql://postgres:senha@localhost:5432/anuncioia"
npm run db:push      # cria as tabelas
npm run dev
```

## 10. Créditos e planos

Free 5 · Basic 50 · Pro 200 · Agency 500 análises (`lib/billing/plans.ts`). **1 crédito é descontado somente quando uma análise real termina com sucesso** (erro, bloqueio ou demo não cobram). Troca de plano e pagamento (Stripe/Mercado Pago) ainda **não** estão integrados: `lib/billing/gateway.ts` define a interface para isso.

## 11. Exportação

Disponível: **Copiar** em cada bloco, **Copiar anúncio completo**, **Copiar tudo** e **Baixar TXT**. PDF, DOCX e CSV estão registrados em `lib/export/index.ts` como “ainda não implementados”.

## 12. Deploy e AWS

Arquitetura inicial sugerida:

```
Usuário → CloudFront → Frontend/SSR Next.js → API (/api/*) → Lambda ou container → RDS PostgreSQL
                                                                    └→ Serviço de IA (Bedrock / OpenAI / Anthropic)
```

Caminhos possíveis (todos exigem sua conta AWS; **nada foi implantado**):

1. **Mais simples — AWS App Runner ou ECS Fargate** com o `Dockerfile` do repositório (usa `output: "standalone"`), RDS PostgreSQL e CloudFront na frente. *O Dockerfile ainda não foi testado.*
2. **Serverless — Lambda** com um adaptador Next.js (ex.: SST/OpenNext) + CloudFront + RDS (use RDS Proxy).

Checklist de produção:
- [ ] `AUTH_SECRET` forte; `DATABASE_URL` (RDS); chaves guardadas no **Secrets Manager** (não em arquivos).
- [ ] `npx prisma migrate deploy` no deploy (crie migrações com `npm run db:migrate`).
- [ ] Trocar o limitador de requisições em memória (`lib/security/rateLimit.ts`) por Redis/DynamoDB (várias instâncias).
- [ ] Implementar `lib/ai/bedrock.ts` (SDK `@aws-sdk/client-bedrock-runtime`) e usar a role IAM em vez de chaves.
- [ ] Integrar um gateway de pagamento via `lib/billing/gateway.ts`.
- [ ] Integrar a API oficial do Mercado Livre (OAuth).
- [ ] Persistir/recuperar análises salvas (hoje o resultado é mostrado no navegador; a gravação em banco ocorre só com `DATABASE_URL`, sem tela de histórico ainda).
- [ ] Domínio, HTTPS (ACM) e WAF.

## 13. Segurança

Validação de URL (domínios permitidos, sem credenciais/portas, sem redirecionamentos), sanitização de textos, validação Zod de toda entrada, limite de requisições, cookies `httpOnly`, chaves só no servidor, cabeçalhos de segurança.
