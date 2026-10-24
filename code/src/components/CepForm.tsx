import { useState } from 'react';
import type { SearchStatus } from '../types/address';
import '../styles/CepForm.css';

interface ICepFormProps {
  onSearch: (cep: string) => void;
  status: SearchStatus;
}

const QUICK_CHIPS = [
  { label: '01310-100 (Av. Paulista)', cep: '01310-100' },
  { label: '02012-000 (Santana/ZN)', cep: '02012-000' },
  { label: '04538-132 (Itaim/ZS)', cep: '04538-132' },
  { label: '69086-053 (Manaus)', cep: '69086-053' },
];

export function CepForm({ onSearch, status }: ICepFormProps) {
  const [cep, setCep] = useState('');

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 5) v = v.substring(0, 5) + '-' + v.substring(5, 8);
    setCep(v);
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      onSearch(clean);
    }
  }

  function handleQuickSearch(targetCep: string) {
    setCep(targetCep);
    onSearch(targetCep.replace(/\D/g, ''));
  }

  return (
    <div className="cep-search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-wrapper">
          <div className="input-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={handleInputChange}
            className="cep-input"
            maxLength={9}
            autoComplete="off"
            inputMode="numeric"
          />
        </div>

        <button 
          type="submit"                             
          disabled={status === 'loading'}
          className="btn-search">
          {status === 'loading' ? (
            <div className="spinner"></div>
          ) : (
            'Buscar'
          )}
        </button>
      </form>

      {/* 4 Chips de Busca Rápida */}
      <div className="quick-chips">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.cep}
            type="button"
            className="chip"
            onClick={() => handleQuickSearch(chip.cep)}
            disabled={status === 'loading'}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
