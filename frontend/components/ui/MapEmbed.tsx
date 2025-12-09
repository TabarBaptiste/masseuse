import React from 'react';

interface MapEmbedProps {
  className?: string;
  width?: number;
  height?: number;
}

export const MapEmbed: React.FC<MapEmbedProps> = ({
  className = '',
  width = 600,
  height = 450
}) => {
  return (
    <div className={`w-full ${className}`}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.9757799664517!2d-60.9452829!3d14.680416899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c6a99e574b9d8ed%3A0xc7813acb0551eb8c!2sAly%20Dous%27heure%20-%20Le%20Robert%2C%20Martinique!5e1!3m2!1sfr!2smq!4v1765313653994!5m2!1sfr!2smq"
        width={width}
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full rounded-lg shadow-lg"
        title="Emplacement du salon Aly Dous'heure - Le Robert, Martinique"
      />
    </div>
  );
};