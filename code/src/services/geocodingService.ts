import type { Coordinates } from '../types/address';

export async function fetchCoordinatesByAddress(street: string, neighborhood: string, city: string, state: string): Promise<Coordinates> {

    const query = `${street}, ${neighborhood}, ${city}, ${state}`;

    // encodeURIComponent(): Função nativa que codifica caracteres especiais (espaços, acentos, pontuações) em formato seguro para URLs (ex: espaço vira %20, "ã" vira %C3%A3), evitando falhas na requisição HTTP.
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    // Disparo da requisição REST para o Nominatim (OpenStreetMap). 
    // Como a API REST não suporta filtragem granular (Overfetching), ela devolve uma lista de objetos completos com múltiplos metadados.
    // O header 'User-Agent' é obrigatório pela política de uso da OSMF para identificar nossa aplicação e viabilizar testes automatizados (Node.js/CI).
    const response = await fetch(url, {

        headers: {
            'User-Agent': 'CEPLookupApp/1.0' // Nome fictício da aplicação, versão 1.0, para atender à política de uso da OSMF (OpenStreetMap Foundation).
        }
    });

        if (!response.ok) {
        throw new Error('Falha na comunicação com o serviço de mapas.');
    }

    const data = await response.json();

        if (!data || data.length === 0) {
        throw new Error('Coordenadas não encontradas para o endereço informado.');
    }

    const firstMatch = data[0];

    return {
        lat: parseFloat(firstMatch.lat),
        lng: parseFloat(firstMatch.lon)
    };
}