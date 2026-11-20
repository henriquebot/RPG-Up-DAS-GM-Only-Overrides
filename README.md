# RPG Up — DAS GM-Only Overrides

Módulo leve para **Foundry VTT v14 + dnd5e 6.x + DAS Core 0.288.0+**.

## Comportamento

- **Quando o mestre escolhe "Usar mesmo assim":** o texto flutuante **"Forçado"** aparece apenas para o mestre, e o aviso **"Regra ignorada"** é ocultado nos cartões de chat dos jogadores. O mestre continua vendo o cartão marcado e os motivos completos.
- **Quando um jogador escolhe "Usar mesmo assim":** o **DAS funciona normalmente**: o texto "Forçado" e a marcação no chat continuam visíveis para toda a mesa, inclusive o mestre. Os alertas privados nativos para o mestre são mantidos.
- **Tudo mais:** nenhuma alteração em ações, testes, dano, animações, outros avisos, fichas ou documentos.

## Instalação

**Manifest:**
https://raw.githubusercontent.com/henriquebot/RPG-Up-DAS-GM-Only-Overrides/main/module.json

No Foundry: **Módulos complementares → Instalar módulo → URL do manifesto**. Ative este módulo **e o DAS Core** nos mundos desejados.

## Configuração

Marque **"RPG Up | Ocultar forçadas do mestre dos jogadores"**, nas configurações do módulo.

A opção é de **mundo**, ativada por padrão; os jogadores não precisam configurar individualmente seus navegadores. Para restaurar o comportamento original do DAS, desative essa opção ou o módulo.

## Como funciona

Usa pontos de extensão públicos do DAS, sem modificar seus arquivos:

1. O hook cancelável `dnd5e-combat.forced` é interceptado **somente quando a ação é forçada por uma conta GM**. Nesse caso o aviso público é suprimido.
2. A API `api.gm.alert` preserva o aviso privado ao mestre, respeitando as configurações de alerta do DAS.
3. Uma consulta privada ao mestre reproduz o texto flutuante apenas no cliente dele pela API `api.floats.play`.
4. O renderizador dos jogadores oculta `.das-overridden` **somente nos cartões de chat cujo autor é GM**. Os cartões escritos por jogadores continuam sem alteração.

**Observação técnica:** para identificar a origem da ação no cartão, o módulo usa o autor do ChatMessage. O comportamento com integrações que atribuam a um GM mensagens iniciadas por jogadores deve ser validado em mesa antes do uso; o próprio DAS não marca a identidade de quem forçou a ação no seu campo `overridden`.

**Não é controle de sigilo de dados:** as razões continuam guardadas em `flags.dnd5e-combat.overridden` do ChatMessage, acessível por ferramentas técnicas. A alteração é somente visual.

## Testes recomendados (duas sessões conectadas)

1. Como **mestre**, force uma ação proibida de um NPC e confira que o jogador não vê "Forçado" nem o aviso da carta, enquanto o mestre recebe o alerta.
2. Como **jogador**, force uma ação proibida de um PJ: **todos** devem continuar vendo o aviso flutuante e a carta marcada.
3. Confira as duas direções com alvos, alcance e recursos, e valide que resultados e automações não mudaram.
4. Desative a opção e confirme que todo aviso "Forçado" volta ao comportamento padrão do DAS.

**Compatibilidade:** verificado contra o **código-fonte** do DAS Core 0.288.0. A sessão real com dois usuários ainda precisa ser testada.

**Relacionado:** [DAS Core — issue #178](https://github.com/Darshyne/dnd5e-combat/issues/178).

## Desenvolvimento

Execute `node --test tests/*.test.mjs` (Node 20+).
O arquivo `module.zip` na raiz é o pacote de instalação usado pelo manifesto.
