# 🗺️ Estudo de Caso & Aprendizados de Engenharia: CEP Lookup & Interactive Map

> **Autor:** Marcel Florentino  
> **Área:** Engenharia de Software — Arquitetura Limpa, TypeScript & React  
> **Foco:** Transição de Sistemas de Baixo Nível (C / C#) → Reatividade Web (React 19), Contratos TypeScript, Física de Memória RAM e Consumo de APIs REST.

---

## 🏛️ 1. A Grande Virada: O que é um Framework e por que React?

### A Realidade do Mercado Corporativo (Meta, Netflix, Airbnb)
No desenvolvimento Web clássico (HTML + CSS + JavaScript Vanilla), o programador manipula o navegador de forma **imperativa**:
> *"Vá até o elemento `document.getElementById('resStreet')`, mude seu texto para 'Avenida Paulista', depois pegue o elemento `loading` e mude seu estilo para `display: none`."*

Em sistemas de grande porte, isso vira o chamado *"Spaghetti Code"*: se o estado da tela muda em 10 lugares diferentes, manter os elementos HTML sincronizados com os dados na memória RAM se torna insustentável.

O **React** introduziu o paradigma **declarativo**:
> *"Eu declaro como a interface deve se parecer para um determinado estado `X`. Quando os dados em `X` mudarem, o React calcula a diferença física e atualiza a tela automaticamente."*

```
[Estado na Memória (State)] ──(Gera)──> [Virtual DOM na RAM] ──(Diff / Reconciliation)──> [DOM Real do Navegador]
```

---

## 📡 2. A Ciência das APIs: Da Analogia à Física da Computação

Entendendo a mecânica do tráfego de dados na rede: o que é uma API, como consumir e como os dados viajam até a memória RAM.

### A. A Analogia do Mundo Real: O Garçom e a Cozinha
Imagine um restaurante de alta gastronomia:
* **Você (O Cliente / Interface Web):** Sentado na mesa, você não pode entrar na cozinha, mexer nos freezers ou acender os fogões (você não tem acesso direto ao banco de dados do servidor).
* **O Cardápio (A Documentação da API / Swagger):** Lista os pratos disponíveis, o formato dos pedidos e o que você receberá em troca.
* **O Garçom (A API - Application Programming Interface):** Você entrega o pedido anotado ao garçom (*Request*). Ele leva até a cozinha, o chef processa, e o garçom retorna com o prato pronto (*Response*).

### B. A Realidade Corporativa (Google, Nubank, Mercado Livre)
A Google não permite que qualquer pessoa acesse o cluster de servidores onde estão as coordenadas de todas as ruas do planeta. Em vez disso, ela expõe uma **API REST**: um conjunto de portas de entrada seguras que recebem uma pergunta padronizada (ex: `GET /geocode?address=01310-100`) e devolvem um pacote de dados puro e leve (JSON), cobrando ou autenticando via **API Key**.

### C. A Física da Computação & O Rastro dos Dados na RAM
Quando você digita `fetch('https://viacep.com.br/ws/01310100/json/')` no código:
1. **Rede Física:** O navegador resolve o IP via DNS, abre um **Socket TCP/IP** na porta 443 e dispara pacotes de luz/eletricidade através de fibras ópticas e roteadores até os servidores do ViaCEP.
2. **Resposta Serializada:** O servidor remoto devolve um fluxo contínuo de bytes codificados em UTF-8: `{"cep": "01310-100", "logradouro": "Avenida Paulista", ...}`.
3. **Alocação na Memória (V8 Engine):** 
   - A CPU do seu computador recebe esses bytes do driver de rede.
   - O método `response.json()` lê a string bruta e aciona o parser C++ da V8.
   - A V8 aloca um **Objeto JavaScript na Heap** da memória RAM e entrega ao seu ponteiro de variável uma referência direta para aquele endereço de memória.

---

## 🧩 3. O Desafio Arquitetural dos Dois Mundos (CEP vs. Coordenadas)

Existe um detalhe fundamental que diferencia engenheiros juniores de engenheiros sêniores:

> ⚠️ **A Reflexão Arquitetural:** 
> O ViaCEP devolve: **Rua, Bairro, Cidade, Estado**.
> Um Mapa (Google Maps, Leaflet, Mapbox) **NÃO renderiza cidades usando texto**; ele renderiza usando **coordenadas geográficas matemáticas (Latitude e Longitude)**.

Para ligar o formulário ao mapa, precisamos de um fluxo em duas etapas:
1. **Passo 1 (Endereçamento):** O usuário digita o CEP → Consultamos o ViaCEP → Obtemos o logradouro e município.
2. **Passo 2 (Geocodificação / Geocoding):** Enviamos o endereço textual para uma API de Geocoding (Nominatim/OpenStreetMap ou Google Geocoding) → Ela converte texto em `[-23.561684, -46.655981]` → O mapa move sua câmera suavemente (*flyTo*) e espeta o pin luminoso.

---

## 🎨 4. Design & Fundo: A Solução de Viewport Lock & Mapa Escuro

### Viewport Lock (Sem Rolagem):
* O elemento pai ocupa rigorosamente `100vw` e `100vh` com `overflow: hidden`.
* Não há barras de rolagem nativas. A aplicação se comporta como um software nativo (desktop app como Figma, Spotify ou Raycast).

### Fundo Escuro com Relevo (Substituindo o verde provisório):
* O fundo é composto por vetores topográficos e malhas viárias monocromáticas escuras (`#070A0F`, `#121A27`, `#161F2E`).
* Uma camada sutil de animação (pulsação de radar ou drift leve de vetores) confere dinamismo sem distrair os olhos da área de foco.

### A Divisão do Card Flutuante (1080 x 600):
* **Painel Esquerdo (440px):** Vidro escuro / Superfície sólida (`#111622`), input com máscara, telemetria detalhada e HUD de coordenadas.
* **Painel Direito (640px):** Canvas do mapa interativo, perfeitamente embutido e sem emendas, com tema escuro (Dark Matter / CartoDB ou Google Maps Dark Styling), pin pulsante e controles de zoom minimalistas.

---

## 🚀 5. Estratégia de Implementação e Decomposição Modular

1. **Inicialização do Projeto:** Setup com Vite + React + TypeScript (o padrão moderno e ultrarrápido da indústria).
2. **Estruturação de Componentes:** 
   - `App.tsx` (Viewport Lock e Orquestração do Estado Global)
   - `CepForm.tsx` (Formulário, validação de CEP e botões rápidos)
   - `AddressCard.tsx` (Exibição dos dados retornados pelo ViaCEP)
   - `RadarConsole.tsx` (HUD tático e telemetria de rede)
   - `MapView.tsx` (Instância do mapa interativo com suporte a pan/zoom e pin luminoso)
3. **Camada de Serviços (Clean Architecture):**
   - `services/cepService.ts` (Isolamento da chamada de API do CEP)
   - `services/geocodingService.ts` (Conversão de endereço em Latitude/Longitude)

---

## 🧪 6. Testes Automatizados, BDD e Jargões Corporativos

### A. O que é BDD (Behavior-Driven Development)?
* **Definição:** Desenvolvimento Guiado por Comportamento.
* **Origem e Propósito:** Criado por Dan North para resolver o maior problema do desenvolvimento de software: a ponte de comunicação entre pessoas de negócios (PO, gerentes) e programadores.
* **A Filosofia:** Em vez de escrever testes técnicos incompreensíveis, o BDD escreve testes usando uma linguagem que se lê quase como **uma frase falada por seres humanos** descrevendo o comportamento esperado do sistema:
  > *"O serviço de CEP (**describe**), quando receber um CEP válido (**it**), deve retornar (**expect**) a UF igual a SP (**toBe**)."*

### B. O Dicionário Essencial de Testes (Vitest / Jest):
1. **`describe` (Descrever):** Agrupa os testes de uma mesma funcionalidade ou classe (o "título do capítulo").
2. **`it` (Ele / Isto):** Define um cenário de teste específico (o comportamento esperado).
3. **`expect` (Esperar / Ter como expectativa):** A asserção matemática da verdade.
4. **`.toBe(...)` (Ser / Estar):** O verificador de igualdade estrita (`===`).
5. **Asserção (Assertion):** O ato de afirmar categoricamente que o resultado real na memória RAM deve ser idêntico ao resultado esperado. Se a asserção falhar, o teste quebra com um alerta vermelho.

### C. Por que testar sem interface visual primeiro?
* **A Regra de Kent Beck:** *"Make it work, make it right, make it fast."* (Faça funcionar primeiro, depois deixe correto, depois deixe rápido e bonito).
* **O Robô Simulador:** Testes automatizados não esperam um humano digitar na tela. O executor de testes roda como um robô que injeta parâmetros na memória, valida a resposta das funções e gera relatórios em milissegundos antes de qualquer linha de CSS ser desenhada.

---

## 8. O Rastro dos Dados no Frontend: O Ciclo do Componente Controlado

No React, os dados não se perdem nem operam por mágica. Cada caractere digitado segue um caminho rigoroso e mensurável através da memória RAM:

```
[ Teclado do Usuário ]
        │ (pressiona a tecla)
        ▼
1. onChange={(e) => setCep(e.target.value)}  ──► Dispara a cada milissegundo capturando o valor bruto do <input>
        │
        ▼
2. setCep(...)                               ──► A função setter (a chave oficial) recebe o texto novo
        │
        ▼
3. useState('')                              ──► O COFRE (guarda o valor na Heap da RAM e toca o alarme de re-render)
        │
        ▼
4. const [cep, ...]                          ──► A variável de estado é atualizada com o novo valor
        │
        ▼
5. value={cep}                               ──► O VISOR do <input> lê a variável cep e projeta os pixels na tela
        │
        ▼
[ Olhos do Usuário na Tela ]
```

### Por que `const [cep, setCep] = useState('')`?
* **`''` (Aspas vazias):** O valor inicial. O campo nasce em branco para mostrar apenas o `placeholder`.
* **`const`:** Protege a variável para impedir atribuição manual direta (`cep = '123'`). Apenas o setter `setCep` tem autorização para alterar o dado.
* **`setCep`:** O setter do React (análogo ao `setPropriedade()` em Java e C#).
* **`useState`:** O hook nativo do React que aloca espaço na memória e agenda a atualização visual da interface.


---

## 7. Anatomia de Testes de Exceção: O Ciclo da Promise (`.resolves` vs `.rejects`)

No ecossistema de testes unitários modernos (Vitest / Jest), testar funções assíncronas exige dominar os dois estados fundamentais de liquidação de uma **Promise**:

```
             ┌─────────── [ Pendente / Executando ] ───────────┐
             │                                                 │
             ▼                                                 ▼
   [ Estado: Resolved ]                              [ Estado: Rejected ]
   • Aconteceu: Retorno com sucesso                  • Aconteceu: throw new Error()
   • O que o teste usa:                              • O que o teste usa:
     expect(resultado.campo).toBe('...')               await expect(funcao()).rejects.toThrow('...')
```

### O Contrato das Palavras no Teste de Caminho Triste (Sad Path):
```typescript
await expect(fetchAddressByCep('123')).rejects.toThrow('CEP inválido. Deve conter exatamente 8 dígitos.');
```
1. **`await` (O Freio):** Pausa a suíte de testes até a Promise ser liquidada e capturada pelo executor.
2. **`expect(fetchAddressByCep('123'))` (A Entrega da Granada):** Como a função com parâmetro `'123'` explode antes de devolver qualquer valor, não podemos guardá-la numa variável comum (`const x = await ...`). Entregamos a chamada bruta diretamente na mesa do juiz.
3. **`.rejects` (O Inversor de Expectativa):** Inverte a aposta padrão do Vitest. Ele exige rigorosamente que a Promise termine no estado `Rejected`. Se a função resolver com sucesso (`Resolved`), o teste reprova na hora acusando bug.
4. **`.toThrow('...')` (O Fiscal da Mensagem):** Desembrulha o objeto `Error` capturado e realiza uma comparação matemática de igualdade estrita na propriedade `error.message`. Garante que a aplicação disparou o erro correto planejado na arquitetura e não uma pane aleatória de rede.

---

## 9. O Circuito Completo de Ida e Volta: Ciclo de Vida e Física do Tempo

Um dos maiores desafios conceituais na transição de C/Java para React é compreender a **Física do Tempo e a Execução Diferida (Deferred Execution)**. Uma função não roda simplesmente por estar escrita no arquivo; ela fica em estado de prontidão na memória RAM e só é acionada quando o evento físico ocorre.

```
═══════════════════════════════ ATO 1: A CARGA (O Software Abre) ═══════════════════════════════

1. App.tsx é executado pelo navegador
        │
        ├── Registra na memória RAM a função receptora: function handleSearch(cep: string)
        │   (A função fica dormindo, não roda nada agora!)
        │
        └── Invoca o componente filho na Linha 12: <CepForm onSearch={handleSearch} />
                │
                ▼
2. CepForm.tsx entra em ação na Portaria (Linha 10)
        │
        ├── Recebe o canal onSearch entregue pelo Pai
        ├── Registra na memória RAM a função interna: function handleSubmit(...) (fica dormindo!)
        │
        └── Corre direto para o RETURN desenhar a tela:
                │
                ▼
        [ A caixinha <input> brota viva no navegador diante dos olhos do usuário! ]
        [ O COMPUTADOR PARA TUDO E FICA EM SILÊNCIO ABSOLUTO ESPERANDO O HUMANO! ]


═══════════════════════════ ATO 2: O DISPARO E A VOLTA (O Usuário Age) ═══════════════════════════

3. O usuário digita "69086053" no teclado
        │
        └── onChange captura as teclas e useState armazena na variável 'cep'

4. O usuário aperta a tecla ENTER!
        │
        ▼
5. O sensor onSubmit acorda o bombeiro de plantão: function handleSubmit
        │
        ├── preventDefault() puxa o freio de mão (a tela não pisca e não recarrega!)
        ├── trim().length > 0 afere matematicamente na CPU que o tamanho é maior que zero
        │
        └── onSearch(cep) aperta o gatilho da entrega!
                │
                ▼
6. O Posto Fiscal da Fronteira (interface ICepFormProps)
        │
        ├── Valida na saída que o dado transportado é estritamente uma string
        │
        ▼
7. A Aterrissagem no Pai (App.tsx)
        │
        └── O dado escorrega pelo cabo onSearch e cai direto dentro de handleSearch(cep)!
```

### Analogias e Modelos Mentais de Engenharia de Sistemas:
* **A Portaria e a Casa no Condomínio:** `CepForm` é a portaria principal do condomínio; funções internas (`handleSubmit`) são casas que entregam o pacote na portaria para sair do condomínio.
* **O Cabo de Ligação / Plugue:** `onSearch={handleSearch}` é a ligação física que conecta a tomada do filho ao aparelho do pai.
* **Canivete Suíço (`e: React.SubmitEvent`):** O evento traz dezenas de ferramentas nativas do navegador; através da desestruturação (`{ preventDefault }`), o engenheiro com mentalidade de C extrai estritamente o ponteiro da função necessária, sem desperdício de memória.

