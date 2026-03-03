import { useEffect, useRef, useState } from 'react';
import logoSmall from 'figma:asset/a0282822fb1d96d6f9b6bd723bed5cd99c045d26.png';
import logoMedium from 'figma:asset/f4f8e8a2ebbe03be05c8d528b0f87c4cb97367e0.png';
import logoLarge from 'figma:asset/934f64bbff89b4bd60ec73d4e521f47c81f2fb75.png';

export default function IconGenerator() {
  const canvas192Ref = useRef<HTMLCanvasElement>(null);
  const canvas512Ref = useRef<HTMLCanvasElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = logoLarge;
    
    img.onload = () => {
      // Generate 192x192 icon
      if (canvas192Ref.current) {
        const ctx = canvas192Ref.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 192, 192);
          ctx.drawImage(img, 0, 0, 192, 192);
        }
      }
      
      // Generate 512x512 icon
      if (canvas512Ref.current) {
        const ctx = canvas512Ref.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);
          ctx.drawImage(img, 0, 0, 512, 512);
        }
      }
    };
  }, []);

  const downloadIcon = (size: 192 | 512) => {
    const canvas = size === 192 ? canvas192Ref.current : canvas512Ref.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `icon-${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }, 'image/png');
  };

  const downloadBoth = () => {
    downloadIcon(192);
    setTimeout(() => downloadIcon(512), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#1E3A8A] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
          🇺🇸 USA LEVEL ENGLISH
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Générateur d'icônes PWA avec ton logo
        </p>

        <div className="bg-blue-500/10 border-2 border-blue-500 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-blue-300 mb-2">📱 Ton Logo</h2>
          <p className="text-gray-300 text-sm">
            Design "US" en Montserrat sur fond bleu marine
          </p>
        </div>

        <div className="flex gap-6 mb-8 justify-center flex-wrap">
          <div className="text-center">
            <canvas
              ref={canvas192Ref}
              width={192}
              height={192}
              className="rounded-2xl shadow-2xl mb-3 bg-[#0B1220]"
            />
            <label className="block text-sm text-gray-400 font-semibold">
              192 × 192 px
            </label>
          </div>
          <div className="text-center">
            <canvas
              ref={canvas512Ref}
              width={512}
              height={512}
              className="rounded-2xl shadow-2xl mb-3 bg-[#0B1220] max-w-[200px]"
            />
            <label className="block text-sm text-gray-400 font-semibold">
              512 × 512 px
            </label>
          </div>
        </div>

        <button
          onClick={downloadBoth}
          className="w-full py-5 px-8 text-lg font-bold bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mb-3"
        >
          ⬇️ TÉLÉCHARGER LES 2 ICÔNES
        </button>

        <button
          onClick={() => downloadIcon(192)}
          className="w-full py-4 px-8 font-bold bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mb-3"
        >
          📥 Télécharger icon-192.png uniquement
        </button>

        <button
          onClick={() => downloadIcon(512)}
          className="w-full py-4 px-8 font-bold bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          📥 Télécharger icon-512.png uniquement
        </button>

        {showSuccess && (
          <div className="mt-6 bg-green-500/20 border-2 border-green-500 rounded-xl p-4 text-center animate-in slide-in-from-top">
            <p className="text-green-300 font-semibold">
              ✅ <strong>Icônes téléchargées !</strong> Place-les dans{' '}
              <code className="bg-black/30 px-2 py-1 rounded">
                /public/icons/
              </code>
            </p>
          </div>
        )}

        {/* Hidden images for preloading */}
        <img src={logoSmall} alt="" className="hidden" />
        <img src={logoMedium} alt="" className="hidden" />
        <img src={logoLarge} alt="" className="hidden" />
      </div>
    </div>
  );
}
