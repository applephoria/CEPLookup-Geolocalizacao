import { useState, useEffect } from 'react';
import { CepForm } from './components/CepForm';
import { AddressCard } from './components/AddressCard';
import { MapView } from './components/MapView';
import { RadarConsole } from './components/RadarConsole';
import { fetchAddressByCep } from './services/cepService';
import type { ViaCepDTO, SearchStatus, Coordinates } from './types/address';
import { fetchCoordinatesByAddress } from './services/geocodingService';
import './styles/App.css';

// Detecção inteligente de Zona Geográfica pelo CEP (Direto do ideias/index.html)
function calculateZone(cleanCep: string, localidade?: string, bairro?: string) {
  if (cleanCep.startsWith('01')) return 'ZONA CENTRAL (SP)';
  if (cleanCep.startsWith('02')) return 'ZONA NORTE (SP)';
  if (cleanCep.startsWith('03') || cleanCep.startsWith('08')) return 'ZONA LESTE (SP)';
  if (cleanCep.startsWith('04')) return 'ZONA SUL (SP)';
  if (cleanCep.startsWith('05')) return 'ZONA OESTE (SP)';

  if (cleanCep.startsWith('690') || cleanCep.startsWith('698')) {
    const b = (bairro || '').toLowerCase();
    if (b.includes('operário') || b.includes('coroado') || b.includes('armando')) return 'ZONA LESTE (MANAUS)';
    if (b.includes('centro') || b.includes('aparecida') || b.includes('sul')) return 'ZONA SUL (MANAUS)';
    if (b.includes('tarumã') || b.includes('ponta negra')) return 'ZONA OESTE (MANAUS)';
    if (b.includes('cidade nova') || b.includes('aleixo')) return 'ZONA NORTE (MANAUS)';
    return 'ZONA LESTE (MANAUS)';
  }

  if (cleanCep.startsWith('20') || cleanCep.startsWith('22')) {
    if (cleanCep.startsWith('20')) return 'ZONA CENTRAL (RJ)';
    if (cleanCep.startsWith('22')) return 'ZONA SUL (RJ)';
    return 'ZONA NORTE (RJ)';
  }

  return (localidade || 'BRASIL').toUpperCase();
}

// Mock inicial padrão idêntico ao ideias/index.html
const INITIAL_ADDRESS: ViaCepDTO = {
  logradouro: 'Avenida Paulista, 1000 a 1500',
  bairro: 'Bela Vista',
  localidade: 'São Paulo',
  uf: 'SP',
  cep: '01310-100',
};

const INITIAL_COORDS: Coordinates = {
  lat: -23.561684,
  lng: -46.655981,
};

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'clear'>('dark');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [addressData, setAddressData] = useState<ViaCepDTO>(INITIAL_ADDRESS);
  const [coords, setCoords] = useState<Coordinates>(INITIAL_COORDS);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sincroniza o atributo data-theme no <html> para o modo claro / escuro
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'clear' : 'dark'));
  }

  async function handleSearch(cleanCep: string) {
    setStatus('loading');

    try {
      const address = await fetchAddressByCep(cleanCep);
      setAddressData(address);

      const coordinates = await fetchCoordinatesByAddress(
        address.logradouro,
        address.bairro,
        address.localidade,
        address.uf
      );

      setCoords(coordinates);
      setStatus('success');
      setIsExpanded(true); // Expande suavemente para abrir o mapa!
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error);
      setStatus('error');
    }
  }

  const cleanCep = (addressData.cep || '').replace(/\D/g, '');
  const zoneName = calculateZone(cleanCep, addressData.localidade, addressData.bairro);

  return (
    <>
      {/* Botão Flutuante de Troca de Tema (Dark / Clear Mode) */}
      <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
        <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
      </button>

      {/* Card Principal (Tela 1 Compacto -> Tela 2 Expandido com Mapa) */}
      <main className={`app-container ${isExpanded ? 'is-expanded' : ''}`}>
        
        {/* ALA ESQUERDA: FORMULÁRIO, CHIPS, RADAR E DETALHES */}
        <section className="left-panel">
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>Geolocalização Ativa • Brasil</span>
          </div>

          <h1 className="header-title">Consultar Endereço</h1>
          <p className="header-subtitle">Digite o CEP para localizar rua, bairro e estado em tempo real.</p>

          <CepForm onSearch={handleSearch} status={status} />

          <RadarConsole
            coords={coords}
            status={status}
            zoneName={zoneName}
          />

          <AddressCard address={addressData} />
        </section>

        {/* ALA DIREITA: O MAPA QUE APARECE SUAVEMENTE (TELA 2) */}
        <section className="right-panel">
          <button 
            type="button" 
            className="btn-collapse-map" 
            onClick={() => setIsExpanded(false)}
            title="Recolher Mapa"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Fechar Mapa</span>
          </button>

          <MapView coords={coords} label={addressData.logradouro || addressData.localidade} />
        </section>

      </main>
    </>
  );
}
