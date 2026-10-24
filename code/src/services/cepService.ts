import type { ViaCepDTO } from '../types/address';

export async function fetchAddressByCep(cep: string): Promise<ViaCepDTO> {

    const cleanCep = cep.replace(/\D/g, ''); // Tratamento do CEP para remover caracteres não numéricos. Impede o erro 400 Bad Request de acontecer!

    if (cleanCep.length !== 8) {
        throw new Error('CEP inválido. Deve conter exatamente 8 dígitos.');
    } 


    // Chamada de requisição para a API Rest ViaCEP para buscar o endereço com base no CEP fornecido
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)


    // 1° Tratamento de erro: Verifica se a resposta da API foi bem-sucedida (status HTTP 200). Caso contrário, lança um erro.
    if (!response.ok) {
        throw new Error('Erro ao buscar o endereço. Por favor, tente novamente mais tarde.');
    }

    // Lê a resposta (em texto JSON) e converte para um Objeto JavaScript do tipo ViaCepDTO
    const data: ViaCepDTO = await response.json();

        
    // 2° Tratamento de erro: Verifica se a resposta da API contém o campo "erro" indicando que o CEP não foi encontrado.
    if (data.erro) {
        throw new Error('CEP não encontrado na base dos Correios.');
    }

    // Retorno da minha promessa com os dados do endereço obtidos da API ViaCEP, caso não haja erros.
    return data;
}