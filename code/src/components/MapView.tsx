import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Coordinates } from '../types/address';
import '../styles/MapView.css';

interface IMapViewProps {
  coords: Coordinates;
  label?: string;
}

export function MapView({ coords, label }: IMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Ícone do Radar Pulsante Verde (Fiel ao ideias/index.html)
    const radarIcon = L.divIcon({
      className: 'custom-radar-marker',
      html: `
        <div class="marker-pulse"></div>
        <div class="marker-core"></div>
      `,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });

    if (!mapInstanceRef.current) {
      // 1. Inicializa o mapa Leaflet
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // Zoom no canto inferior direito
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Camada oficial do OpenStreetMap
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Alfinete com Radar e Popup flutuante
      const marker = L.marker([coords.lat, coords.lng], { icon: radarIcon }).addTo(map);
      if (label) {
        marker.bindPopup(
          `<strong style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #0F172A;">${label}</strong>`
        ).openPopup();
      }

      markerRef.current = marker;
      mapInstanceRef.current = map;
    } else {
      // Quando as coordenadas mudam (nova busca)
      const map = mapInstanceRef.current;
      map.invalidateSize();
      map.flyTo([coords.lat, coords.lng], 16, {
        duration: 1.3,
        easeLinearity: 0.25,
      });

      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      const newMarker = L.marker([coords.lat, coords.lng], { icon: radarIcon }).addTo(map);
      if (label) {
        newMarker.bindPopup(
          `<strong style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #0F172A;">${label}</strong>`
        ).openPopup();
      }
      markerRef.current = newMarker;
    }

    // Pequeno delay para garantir que o mapa recalcula o tamanho após a animação de expansão
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 350);

    return () => clearTimeout(timer);
  }, [coords, label]);

  return <div ref={mapContainerRef} className="map-inner-container" />;
}
