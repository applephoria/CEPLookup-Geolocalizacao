import { useState } from 'react';
import type { ViaCepDTO } from '../types/address';
import '../styles/AddressCard.css';

interface IAddressCardProps {
  address: ViaCepDTO;
}

export function AddressCard({ address }: IAddressCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const fullAddress = `${address.logradouro || ''}, ${address.bairro || ''} - ${address.localidade}, ${address.uf} - CEP: ${address.cep}`;
    await navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="address-card-wrapper">
      <div className="result-details">
        <div className="location-header">
          <div className="city-state">
            {address.localidade}, {address.uf}
          </div>
          <div className="country-pill">
            <span>🇧🇷</span> Brasil
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item full-width">
            <div className="detail-label">Logradouro / Rua</div>
            <div className="detail-val">
              {address.logradouro || 'Centro / Sem logradouro'}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Bairro</div>
            <div className="detail-val">
              {address.bairro || 'Geral'}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Código Postal</div>
            <div className="detail-val" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {address.cep}
            </div>
          </div>
        </div>
      </div>

      <button 
        type="button" 
        className={`btn-copy ${copied ? 'copied' : ''}`} 
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <span>✓</span> Copiado!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copiar Endereço</span>
          </>
        )}
      </button>
    </div>
  );
}
