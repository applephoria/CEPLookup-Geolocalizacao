import { describe, it, expect } from 'vitest';

import { fetchAddressByCep } from './cepService';
import { fetchCoordinatesByAddress } from './geocodingService';

describe('cepService', () => {
  // Cenário 1: Caminho Feliz (Happy Path) - CEP válido de Manaus
  it('deve retornar o endereço correto para um CEP válido', async () => {
    // 1. Dispara a requisição para a API ViaCEP com o CEP de Manaus
    const resultado = await fetchAddressByCep('69086053');

    // 2. Asserções dos 4 pilares do endereço devolvidos pelo ViaCEP.
    // Esses exatos 4 dados serão repassados ("herdados") pela função fetchCoordinatesByAddress!
    expect(resultado.logradouro).toBe('Rua Maximino Corrêa');
    expect(resultado.bairro).toBe('São José Operário');
    expect(resultado.localidade).toBe('Manaus');
    expect(resultado.uf).toBe('AM');
  });

  // Cenário 2: Caminho Triste (Sad Path) - CEP inválido com menos de 8 dígitos
  it('deve disparar erro quando o CEP tiver menos de 8 dígitos', async () => {
    // A chamada com '123' é entregue diretamente ao expect.
    // O modificador .rejects exige o estado de rejeição da Promise, e o .toThrow fiscaliza a mensagem exata do erro.
    await expect(fetchAddressByCep('123')).rejects.toThrow('CEP inválido. Deve conter exatamente 8 dígitos.');
  });
});

describe('geocodingService', () => {
  it('deve retornar as coordenadas corretas para um endereço válido', async () => {
    // 1. Executa a função passando o endereço de Manaus (alimentado pelos dados do ViaCEP)
    const resultado = await fetchCoordinatesByAddress('Rua Maximino Corrêa', 'São José Operário', 'Manaus', 'AM');

    // 2. Asserções do OpenStreetMap
    // Compara latitude e longitude com tolerância de até 4 casas decimais (~10 metros de precisão)
    expect(resultado.lat).toBeCloseTo(-3.0645499, 4);
    expect(resultado.lng).toBeCloseTo(-59.9436631, 4);
  });
});
