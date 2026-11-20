# RPG Up — DAS GM-Only Overrides

Módulo leve para **Foundry VTT v14 + dnd5e 6.x + DAS Core 0.288.0+**.

Quando alguém usa **"Usar mesmo assim"** para ignorar uma restrição do DAS:

- **Jogadores:** veem o resultado normal da ação, mas não veem o aviso flutuante **"Forçado"**, nem o banner **"Regra ignorada"** no chat.
- **Mestre:** continua vendo a marcação no chat e recebe um texto flutuante **"Forçado"** apenas em seu cliente. Os alertas privados com motivos continuam sendo gerados pelo DAS se **Alertas ao mestre** e **Avisar quando um jogador ignora uma regra** estiverem ativados.
- Outros textos flutuantes, animações, rolagens, recursos, aplicação de dano e fichas não são modificados.

## Instalação (Foundry V14)

**Manifest:**
https://raw.githubusercontent.com/henriquebot/RPG-Up-DAS-GM-Only-Overrides/main/module.json

No Foundry: **Módulos complementares → Instalar módulo → URL do manifesto**.
Ative este módulo **e o DAS Core** em cada mundo em que quiser usá-lo.

## Configuração

Nas configurações do módulo, marque **"RPG Up | Avisos de regras ignoradas somente para o mestre"**.

A opção é de **mundo**, começa **ativada**, e os jogadores não precisam alterar suas próprias configurações. O módulo deve estar ativo na sessão de todos.

## Como funciona

Usa apenas os pontos de extensão públicos do DAS:

1. O hook cancelável `dnd5e-combat.forced` impede a transmissão pública do aviso "Forçado".
2. `game.modules.get("dnd5e-combat").api.gm.alert` conserva o alerta privado ao mestre (respeitando as configurações de alerta já existentes).
3. Uma consulta privada ao mestre reproduz o texto flutuante apenas no cliente dele, pela API `api.floats.play`.
4. Nos clientes dos jogadores, remove visualmente o banner `.das-overridden` do cartão do chat, sem alterar os dados do documento.

**Importante:** o módulo oculta a apresentação ao jogador, **não é um recurso de sigilo de dados**. O campo `flags.dnd5e-combat.overridden` continua armazenado no ChatMessage e usuários com acesso técnico aos documentos ainda podem inspecioná-lo. Para sigilo real, seria necessária uma alteração no DAS Core.

## Teste rápido

1. Ative o módulo num mundo DAS e mantenha os alertas ao mestre ligados.
2. Entre em duas sessões (mestre e jogador) e provoque uma ação recusada; escolha **"Usar mesmo assim"**.
3. Confirme que o jogador não vê "Forçado" sobre o token nem "Regra ignorada" no chat, mas continua vendo o resultado da ação.
4. Confirme que o mestre vê a indicação no cartão, o texto flutuante e o alerta privado com os motivos.
5. Desative a opção do módulo e confirme que o comportamento padrão do DAS volta.

**Compatibilidade:** a implementação foi verificada contra o **código-fonte** do DAS Core 0.288.0. O teste com duas sessões reais ainda deve ser realizado antes de usar em mesas ao vivo.

**Relacionado:** [DAS Core — issue #178](https://github.com/Darshyne/dnd5e-combat/issues/178). Quando a opção nativa existir, será preferível desativar este complemento.

## Desenvolvimento

Execute `node --test tests/*.test.mjs` (Node 20+) para testes de lógica.
O arquivo `module.zip` na raiz é o pacote de instalação consumido pelo manifesto.
