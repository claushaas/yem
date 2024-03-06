# Plataforma da Yoga em Movimento

## TODO
- [ ] Adicionar número de telefone a lista de bloqueados do botmaker
- [ ] Limitar pesquisa de assinaturas da hotmart para o produto da escola
- [ ] Pesquisar matrículas da formação ao criar ou atualizar lista de subscriptions de um usuário
- [ ] Rota para criação de usuário
  - [ ] enviar mensagem de boas vindas com dados do usuário para o whatsapp
- [ ] Rota para recuperação de senha - enviar nova senha via email
- [ ] Rota para atualizar dados do usuário (email, telefone, nome e sobrenome)
- [ ] Criar serviço para acompanhar o progresso de aula dos alunos
  - [ ] Gravar ou atualizar novo progresso de aula
  - [ ] Recuperar o progresso de uma aula
  - [ ] Calcular o progresso de um módulo
  - [ ] Calcular o progresso de um curso
- [ ] Criar rotas para webhooks
  - [ ] Webhooks da hotmart
    - [ ] matrículas
    - [ ] novas assinaturas
    - [ ] pagamentos
      - [ ] falha de pagamentos para enviar mensagens para whatsapp
      - [ ] status de pagamentos para atualizar subscriptions
  - [ ] Webhooks da iugu
    - [ ] pagamentos
      - [ ] falhas de pagamentos para enviar mensagens no whatsapp
    - [ ] renovação e / ou ativação de assinaturas para atualizar subscriptions