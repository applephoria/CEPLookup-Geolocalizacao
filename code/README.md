# CEP Lookup & Geolocalização 🗺️

Aplicação interativa de busca de endereços e geolocalização vetorial com Leaflet, React 19, TypeScript e Vite.

---

## 🔄 O Rastro dos Dados: O Ciclo do Componente Controlado

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

## ⚡ Engenharia de Baixo Nível: O Canivete Suíço (`e`) vs Desestruturação Direta (`{ preventDefault }`)

Inspirado na mentalidade de sistemas em **C**, onde cada byte e ciclo de instrução importam, no envio do formulário podemos escolher como receber o evento:

1. **Abordagem Tradicional (`e: React.SubmitEvent`):**
   Recebe o objeto inteiro com dezenas de propriedades (`target`, `timeStamp`, `stopPropagation`, etc.).
2. **Abordagem de Alta Precisão (`{ preventDefault }: React.SubmitEvent`):**
   Utiliza a **Desestruturação de Objetos** para extrair diretamente apenas o ponteiro da função necessária:
   ```typescript
   function handleSubmit({ preventDefault }: React.SubmitEvent) {
     preventDefault(); // Congela a tela e impede o recarregamento arcaico do navegador!
   }
   ```
* **O que o `preventDefault()` faz:** Desativa o comportamento padrão herdado da Web dos anos 90 (onde o envio de um `<form>` recarregava a página inteira e apagava a tela). A tela permanece estática e os dados persistem na memória RAM.


---

## 🛠️ Tecnologias
- **React 19 & Vite**
- **TypeScript** (tipagem estrita e contratos de interface)
- **Leaflet & OpenStreetMap / CartoDB Dark Matter** (geolocalização e mapas interativos)
- **ViaCEP API** (resolução determinística de logradouros brasileiros)
- **Vitest** (testes unitários automatizados com BDD)

