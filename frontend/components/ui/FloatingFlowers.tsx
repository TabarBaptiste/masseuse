// Composant pour les fleurs flottantes
export const FloatingFlowers = () => {
    const flowers = [
        { id: 1, left: '10%', delay: 0, duration: 20, size: 40 },
        { id: 2, left: '25%', delay: 2, duration: 25, size: 35 },
        { id: 3, left: '45%', delay: 5, duration: 22, size: 30 },
        { id: 4, left: '65%', delay: 1, duration: 24, size: 38 },
        { id: 5, left: '80%', delay: 4, duration: 21, size: 32 },
        { id: 6, left: '15%', delay: 7, duration: 23, size: 36 },
        { id: 7, left: '90%', delay: 3, duration: 26, size: 34 },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {flowers.map((flower) => (
                <div
                    key={flower.id}
                    className="absolute bottom-0 animate-float-up opacity-0"
                    style={{
                        left: flower.left,
                        animationDelay: `${flower.delay}s`,
                        animationDuration: `${flower.duration}s`,
                    }}
                >
                    <svg
                        width={flower.size}
                        height={flower.size}
                        viewBox="0 0 100 100"
                        className="animate-spin-slow"
                        style={{
                            animationDuration: `${flower.duration * 2}s`,
                            animationDelay: `${flower.delay}s`,
                        }}
                    >
                        {/* Pétales de fleur - style orchidée/lotus */}
                        <g opacity="0.7">
                            {/* Pétale central */}
                            <ellipse cx="50" cy="50" rx="15" ry="25" fill="#f5e6d3" />

                            {/* Pétales autour - 5 pétales */}
                            {[0, 72, 144, 216, 288].map((angle, i) => (
                                <g key={i} transform={`rotate(${angle} 50 50)`}>
                                    <ellipse
                                        cx="50"
                                        cy="25"
                                        rx="12"
                                        ry="22"
                                        fill={i % 2 === 0 ? '#F6C493' : '#f9d9b8'}
                                    />
                                </g>
                            ))}

                            {/* Centre de la fleur */}
                            <circle cx="50" cy="50" r="8" fill="#d4a574" />
                            <circle cx="50" cy="50" r="5" fill="#c49563" />
                        </g>
                    </svg>
                </div>
            ))}

            <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-float-up {
          animation: float-up linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
      `}</style>
        </div>
    );
};