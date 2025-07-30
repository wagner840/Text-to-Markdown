# Guia de Deploy da Aplicação Next.js no Coolify

## Problemas Identificados nos Logs

### 1. Erro Principal
```
[Error: Could not find a production build in the 'dist' directory. Try building your app with 'next build' before starting the production server.]
```

**Causa**: A configuração estava usando `output: "export"` (modo estático) mas o Coolify estava tentando executar em modo SSR.

### 2. Configuração Incorreta
- `distDir: "dist"` - conflitava com o build padrão do Next.js
- `output: "export"` - modo estático incompatível com `npm run start`

## Soluções Implementadas

### 1. Corrigir next.config.ts
```typescript
const nextConfig: NextConfig = {
  output: "standalone", // ✅ Para deploy SSR no Coolify
  reactStrictMode: true,
  images: {
    unoptimized: true, // ✅ Recomendado para self-hosting
  },
};
```

### 2. Dockerfile Otimizado
- Multi-stage build para reduzir tamanho da imagem
- Configuração específica para Next.js standalone
- Usuário não-root para segurança

### 3. Arquivo nixpacks.toml
- Configuração específica para o Nixpacks do Coolify
- Comandos corretos de build e start

## Configuração no Coolify

### Passo 1: Configurar o Projeto
1. Acesse seu dashboard do Coolify
2. Vá em "Projects" → Selecione seu projeto → "Production"
3. Clique em "Add new resource"

### Passo 2: Conectar Repositório
1. Selecione "Private Repository (with Github App)" ou "Public Repository"
2. Cole a URL do seu repositório: `https://github.com/wagner840/Text-to-Markdown`
3. Selecione a branch: `development`
4. Clique em "Load Repository"

### Passo 3: Configurar Build
**IMPORTANTE**: Escolha uma das duas opções:

#### Opção A: Usando Dockerfile (Recomendado)
1. Build Pack: **Dockerfile**
2. Dockerfile Path: `text-to-markdown-app/Dockerfile`
3. Build Context: `text-to-markdown-app`

#### Opção B: Usando Nixpacks
1. Build Pack: **Nixpacks**
2. Base Directory: `text-to-markdown-app`
3. Install Command: `npm ci`
4. Build Command: `npm run build`
5. Start Command: `npm run start`

### Passo 4: Configurar Variáveis de Ambiente
Se sua aplicação usa variáveis de ambiente:
1. Vá na aba "Environment Variables"
2. Adicione suas variáveis
3. **IMPORTANTE**: Para variáveis `NEXT_PUBLIC_*`, marque como "Build Variable"

### Passo 5: Deploy
1. Clique em "Deploy"
2. Monitore os logs de build
3. Se houver erro, use "Force Deploy Without Cache" nas configurações avançadas

## Troubleshooting

### Problema: Build não encontra arquivos
**Solução**: Verifique se o "Base Directory" está configurado como `text-to-markdown-app`

### Problema: Variáveis NEXT_PUBLIC_ não funcionam
**Solução**: 
1. Marque as variáveis como "Build Variable" no Coolify
2. Use "Force Deploy Without Cache" para rebuild completo

### Problema: Erro de rede durante build
**Solução**: O container de build pode não estar na mesma rede que outros serviços. Configure as redes adequadamente no Coolify.

### Problema: Aplicação não inicia
**Solução**: 
1. Verifique se está usando `output: "standalone"` no next.config.ts
2. Confirme que o comando start é `npm run start`
3. Verifique os logs do container para erros específicos

## Melhores Práticas

### 1. Estrutura do Projeto
```
Text-to-Markdown/
├── text-to-markdown-app/          # ← Base Directory no Coolify
│   ├── Dockerfile                 # ← Para build com Docker
│   ├── nixpacks.toml             # ← Para build com Nixpacks
│   ├── next.config.ts            # ← Configuração corrigida
│   ├── package.json
│   └── src/
└── outros-arquivos/
```

### 2. Configuração de Domínio
1. No Coolify, vá em "Domains"
2. Adicione seu domínio personalizado
3. Configure SSL automático
4. Teste a aplicação

### 3. Monitoramento
1. Use a aba "Logs" para monitorar a aplicação
2. Configure health checks se necessário
3. Monitore uso de recursos

## Comandos Úteis

### Rebuild Forçado
Se precisar fazer rebuild completo:
1. Vá em "Advanced" → "Force Deploy Without Cache"
2. Clique em "Deploy"

### Verificar Logs
```bash
# No terminal do Coolify (se disponível)
docker logs <container-name>
```

### Restart da Aplicação
1. Clique em "Restart" no dashboard
2. Monitore os logs para confirmar que reiniciou corretamente

## Diferenças vs Vercel

| Aspecto | Vercel | Coolify |
|---------|---------|---------|
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Controle | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Custo | $$$ | $ |
| Setup | Automático | Manual |
| Domínio | Automático | Manual |
| SSL | Automático | Manual |

## Conclusão

O Coolify oferece mais controle e custos menores, mas requer mais conhecimento técnico. Para aplicações em produção com alta disponibilidade, considere:

1. **Coolify**: Para projetos pessoais, startups, ou quando você quer controle total
2. **Vercel**: Para lançamento rápido, equipes focadas no produto, ou quando simplicidade é prioridade

O investimento em tempo para configurar o Coolify vale a pena quando você tem múltiplos projetos ou precisa de controle específico sobre a infraestrutura. 