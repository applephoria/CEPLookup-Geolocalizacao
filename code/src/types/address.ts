// Contrato de 2 API's que serão consumidas no projeto

export interface ViaCepDTO{
    cep: string;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean | string;
}

export interface Coordinates {
  lat: number; // Latitude
  lng: number; // Longitude
}

export interface AddressData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zone: string;
  coords: Coordinates;
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';