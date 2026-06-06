import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Localisez-vous',
    description: 'Utilisez votre position GPS ou entrez une adresse à Paris pour définir votre point de départ.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    title: 'Choisissez votre type d\'îlot de fraîcheur',
    description: 'Filtrez par fontaines à boire, parcs & jardins ou espaces climatisés selon vos besoins.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
    title: 'Visualisez sur la carte',
    description: 'Explorez les spots à proximité sur une carte interactive avec des marqueurs colorés par catégorie.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" />
        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
      </svg>
    ),
    title: 'Obtenez l\'itinéraire',
    description: 'Cliquez sur un spot pour voir la distance et lancer la navigation piétonne vers votre îlot de fraîcheur.',
  },
];

function StepCard({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex gap-6 items-start p-6 rounded-2xl bg-white border border-border shadow-sm transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="shrink-0 w-16 h-16 rounded-full bg-app_surface-2 flex items-center justify-center text-app_green">
        {step.icon}
      </div>
      <div>
        <span className="text-app_green font-bold text-sm">Étape {index + 1}</span>
        <h3 className="text-app_blue font-semibold text-xl mt-1">{step.title}</h3>
        <p className="text-app_black/70 mt-2 leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-app_blue italic">
          Comment ça <span className="text-app_green">marche</span>
        </h1>
        <p className="mt-4 text-app_black/70 text-lg">
          Trouvez un îlot de fraîcheur en 4 étapes simples
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {STEPS.map((step, i) => (
          <StepCard key={step.title} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}
