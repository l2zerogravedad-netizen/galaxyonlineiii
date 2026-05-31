'use client';

/**
 * Go3Frame — embebe el cliente Galaxy Online 3 (Canvas-2D autocontenido, con sus
 * assets/FX reales) a pantalla completa vía iframe. El cliente vive en
 * /public/go3/index.html y navega por hash (#galaxy, #basespace, #battle, …),
 * así cada sección del juego se enlaza a su propia ruta de Next.
 */
export function Go3Frame({ section }: { section?: string }) {
  const src = section ? `/go3/index.html#${section}` : '/go3/index.html';
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: '#020a1c',
        overflow: 'hidden',
      }}
    >
      <iframe
        src={src}
        title="Galaxy Online 3"
        allow="autoplay; fullscreen"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}
