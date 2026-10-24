# 📐 Modelagem Arquitetural & Diagramas UML

Este documento reúne a especificação visual e formal da arquitetura do **CEP Lookup & Geolocalização**, mapeando o comportamento de estado, casos de uso e ciclo de vida antes da implementação em código.

---

## 🧭 Índice dos Diagramas

1. [Máquina de Estados: Ciclo de Vida da Aplicação](#1-máquina-de-estados-ciclo-de-vida-da-aplicação)
2. [Diagrama de Casos de Uso (Use Cases)](#2-diagrama-de-casos-de-uso-use-cases)
3. [Diagrama de Arquitetura de Componentes e Fluxo de Props](#3-diagrama-de-arquitetura-de-componentes-e-fluxo-de-props)
4. [Diagrama de Sequência de Resiliência & Fail-Fast](#4-diagrama-de-sequência-de-resiliência--fail-fast)

---

## 1. Máquina de Estados: Ciclo de Vida da Aplicação

Mapeia as transições determinísticas de estado dentro do orquestrador central (`App.tsx`):

```mermaid
stateDiagram-v2
    [*] --> Idle: Inicialização do App

    state Idle {
        [*] --> InitialForm: Card 400x510px Fechado
        InitialForm --> Preenchimento: Usuário digita ou clica em Quick Chip
    }

    Preenchimento --> Validating: Disparo do Formulário (Enter ou Botão)

    state Validating {
        [*] --> Sanitizacao: Remove hífen e espaços
        Sanitizacao --> FailFast: CEP != 8 dígitos numéricos
        Sanitizacao --> FetchingViaCep: CEP válido (8 dígitos)
    }

    FailFast --> Idle: Exibe Toast de Erro (Alerta)

    state FetchingViaCep {
        [*] --> RequestViaCep: GET viacep.com.br
        RequestViaCep --> CepNaoEncontrado: Retorno { erro: true }
        RequestViaCep --> ResolvingGeocoding: Endereço Encontrado (ViaCepDTO)
    }

    CepNaoEncontrado --> Idle: Alerta CEP Inexistente

    state ResolvingGeocoding {
        [*] --> RequestNominatim: GET Nominatim OpenStreetMap
        RequestNominatim --> FallbackCoordenadas: Falha na Geocodificação
        RequestNominatim --> SuccessCoordenadas: Coordenadas Obtidas [Lat, Lon]
    }

    FallbackCoordenadas --> SuccessRender: Usa coordenadas da Capital/Estado
    SuccessCoordenadas --> SuccessRender: Coordenadas Exatas do Logradouro

    state SuccessRender {
        [*] --> CardExpandido: Animação de largura (400px ➔ 930px)
        CardExpandido --> RenderRadar: Atualiza Telemetria e Radar HUD
        CardExpandido --> FlyToMap: Leaflet move a câmera com marcador pulsante
        CardExpandido --> RenderAddress: Preenche Logradouro, Bairro e CEP
    }

    SuccessRender --> Idle: Clique em [✕ Fechar Mapa] ou Nova Busca
```

---

## 2. Diagrama de Casos de Uso (Use Cases)

Mapeia as fronteiras entre o usuário físico, a aplicação frontend e as APIs externas de nuvem:

```mermaid
flowchart LR
    User(["👤 Usuário Final"])
    
    subgraph FrontendApp ["Aplicação Frontend (React 19)"]
        UC1["Buscar Endereço por CEP"]
        UC2["Selecionar Quick Chip de Exemplo"]
        UC3["Alternar Tema (Dark / Light)"]
        UC4["Copiar Endereço Formatado"]
        UC5["Fechar / Recolher Mapa"]
        UC6["Interagir com o Mapa (Zoom / Pan)"]
    end

    subgraph ExternalAPIs ["APIs REST Externas"]
        ViaCepAPI["🌐 ViaCEP REST API"]
        NominatimAPI["🌐 Nominatim OSM Engine"]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    UC1 -.->|"Consome DTO de Endereço"| ViaCepAPI
    UC1 -.->|"Consome Latitude / Longitude"| NominatimAPI
    UC2 -.->|"Dispara Busca Automática"| UC1
```

---

## 3. Diagrama de Arquitetura de Componentes e Fluxo de Props

Demonstra o princípio da **Single Source of Truth (Fonte Única da Verdade)** onde o componente `App.tsx` retém o estado mestre e distribui dados para componentes filhos puros:

```mermaid
flowchart TD
    App["App.tsx (Orquestrador de Estado Central)"]
    
    subgraph UIComponents ["Componentes de Apresentação (Puros)"]
        ThemeBtn["ThemeToggle (Botão de Tema)"]
        CepForm["CepForm.tsx (Formulário & Quick Chips)"]
        RadarConsole["RadarConsole.tsx (HUD & Telemetria)"]
        AddressCard["AddressCard.tsx (Cartão de Resultados)"]
        MapView["MapView.tsx (Mapa Leaflet & Marcador Neon)"]
    end

    subgraph ServiceLayer ["Camada de Serviços (TypeScript Puro)"]
        CepService["cepService.ts (ViaCEP HTTP Client)"]
        GeoService["geocodingService.ts (Nominatim Client)"]
    end

    App -->|"theme / toggleTheme()"| ThemeBtn
    App -->|"onSearch(cleanCep)"| CepForm
    App -->|"coordinates, address, loading"| RadarConsole
    App -->|"address"| AddressCard
    App -->|"coordinates, address, onClose()"| MapView

    App -.->|"invoca busca assíncrona"| CepService
    App -.->|"invoca triangulação GPS"| GeoService
```

---

## 4. Diagrama de Sequência de Resiliência & Fail-Fast

Mapeia a inteligência defensiva que previne requisições de rede desnecessárias e trata erros graciosamente:

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Form as CepForm
    participant App as App.tsx
    participant Service as cepService
    participant API as ViaCEP

    User->>Form: Digita "123" (incompleto) e envia
    Form->>Form: Regex Check: /^[0-9]{8}$/
    Note over Form: Validação Fail-Fast Local
    Form-->>User: Alerta: "CEP deve conter exatamente 8 dígitos"
    Note over Form,API: Nenhuma requisição consome a rede!

    User->>Form: Digita "01310100" (válido)
    Form->>App: onSearch("01310100")
    App->>Service: fetchAddressByCep("01310100")
    Service->>API: GET /ws/01310100/json/
    
    alt Sucesso (200 OK)
        API-->>Service: { cep: "01310-100", logradouro: "Av. Paulista", ... }
        Service-->>App: ViaCepDTO estruturado
        App-->>User: Renderiza tela com sucesso
    else CEP Inexistente ({ erro: true })
        API-->>Service: { erro: true }
        Service-->>App: Dispara Erro: "CEP não encontrado"
        App-->>User: Exibe toast de alerta sem quebrar a aplicação
    else Queda de Rede / Offline
        API--xService: Network Failure (Timeout)
        Service-->>App: Catch gracioso com mensagem amigável
        App-->>User: "Serviço temporariamente indisponível"
    end
```
