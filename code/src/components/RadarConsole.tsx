import type { Coordinates, SearchStatus } from '../types/address';
import '../styles/RadarConsole.css';

interface IRadarConsoleProps {
  coords: Coordinates | null;
  status: SearchStatus;
  zoneName?: string;
}

export function RadarConsole({ coords, status, zoneName }: IRadarConsoleProps) {
  const isScanning = status === 'loading';

  return (
    <div className={`radar-instrument-console ${isScanning ? 'scanning' : ''}`}>
      {/* Asa Esquerda: Satélites e Precisão */}
      <div className="telemetry-wing">
        <span className="tel-label">SATÉLITES GPS</span>
        <span className="tel-val">{coords ? '14/14 FIXOS' : '12/14 FIXOS'}</span>
        <span className="tel-label" style={{ marginTop: '4px' }}>PRECISÃO</span>
        <span className="tel-val highlight-green">± 1.2 METROS</span>
      </div>

      {/* Centro: O Radar Expandido com Giro 360 e Mira */}
      <div className="radar-expanded-zone">
        <div className="radar-circle-scope">
          <div className="scope-crosshair-x"></div>
          <div className="scope-crosshair-y"></div>
          <div className="radar-outer-ring"></div>
          <div className="radar-inner-ring"></div>
          <div className="radar-beam-spinner"></div>
          <div className="scope-echo-wave"></div>
          <div className="scope-center-pin"></div>
        </div>
      </div>

      {/* Asa Direita: Varredura e Zona Dinâmica */}
      <div className="telemetry-wing right-align">
        <span className="tel-label">VARREDURA</span>
        <span className="tel-val highlight-green">
          {isScanning ? 'ESCANEANDO...' : 'EM TEMPO REAL'}
        </span>
        <span className="tel-label" style={{ marginTop: '4px' }}>ZONA</span>
        <span className="tel-val highlight-blue">
          {zoneName ? zoneName.toUpperCase() : 'ZONA CENTRAL (SP)'}
        </span>
      </div>
    </div>
  );
}
