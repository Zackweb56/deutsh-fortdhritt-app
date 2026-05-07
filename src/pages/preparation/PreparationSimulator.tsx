import React from 'react';
import { useParams } from 'react-router-dom';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';

// B1 Modules
import GoetheB1LesenSimulator from './goethe/b1/lesen/GoetheB1LesenSimulator';
import GoetheB1HorenSimulator from './goethe/b1/horen/GoetheB1HorenSimulator';
import GoetheB1SchreibenSimulator from './goethe/b1/schreiben/GoetheB1SchreibenSimulator';
import GoetheB1SprechenSimulator from './goethe/b1/sprechen/GoetheB1SprechenSimulator';

// B2 Modules
import GoetheB2LesenSimulator from './goethe/b2/lesen/GoetheB2LesenSimulator';
import GoetheB2HorenSimulator from './goethe/b2/horen/GoetheB2HorenSimulator';
import GoetheB2SchreibenSimulator from './goethe/b2/schreiben/GoetheB2SchreibenSimulator';
import GoetheB2SprechenSimulator from './goethe/b2/sprechen/GoetheB2SprechenSimulator';

const PreparationSimulator = () => {
  const { institute, level, module } = useParams<{ institute: string; level: string; module: string; teilId: string; topicId: string }>();

  if (isLimitedAccess()) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <LockOverlay isLocked={true} message="هذا المحتوى متاح في النسخة المدفوعة فقط.">
          <div className="max-w-xl text-center space-y-4">
            <h1 className="text-2xl font-black uppercase tracking-tight">Zugriff verweigert</h1>
            <p className="text-lg opacity-80">Dieser Inhalt ist nur in der kostenpflichtigen Version verfügbar.</p>
          </div>
        </LockOverlay>
      </div>
    );
  }

  const key = `${institute?.toLowerCase() || ''}/${level?.toLowerCase() || ''}/${module?.toLowerCase() || ''}`;

  switch (key) {
    // B1
    case 'goethe/b1/lesen':
      return <GoetheB1LesenSimulator />;
    case 'goethe/b1/hören':
    case 'goethe/b1/horen':
      return <GoetheB1HorenSimulator />;
    case 'goethe/b1/schreiben':
      return <GoetheB1SchreibenSimulator />;
    case 'goethe/b1/sprechen':
      return <GoetheB1SprechenSimulator />;
      
    // B2
    case 'goethe/b2/lesen':
      return <GoetheB2LesenSimulator />;
    case 'goethe/b2/hören':
    case 'goethe/b2/horen':
      return <GoetheB2HorenSimulator />;
    case 'goethe/b2/schreiben':
      return <GoetheB2SchreibenSimulator />;
    case 'goethe/b2/sprechen':
      return <GoetheB2SprechenSimulator />;

    default:
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
          <div className="max-w-xl text-center space-y-4">
            <h1 className="text-2xl font-black uppercase tracking-tight">Vorbereitungssimulator nicht gefunden</h1>
            <p className="text-sm text-white/70">
              Für den gewählten Anbieter, das Niveau oder das Modul ist derzeit noch keine spezialisierte Simulation implementiert.
            </p>
            <p className="text-sm text-white/60">Bitte wähle eine verfügbare Goethe B1 oder Goethe B2 Option.</p>
          </div>
        </div>
      );
  }
};

export default PreparationSimulator;
