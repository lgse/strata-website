import { ImageResponse } from 'next/og';
export const alt = 'Strata — Navigate every layer. A native Linux file manager.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#16161e',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '70px 90px',
        color: '#e0e5fa',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7aa2f724, #16161e00)',
          right: -50,
          top: 0,
        }}
      />
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 28, marginBottom: 37 }}
      >
        <svg width="42" height="42" viewBox="0 0 284 284">
          <path d="M38 82 142 22 174 40 70 100v24l104 62-32 18L38 142Z" fill="#c0caf5" />
          <path d="M142 88l104 60v60l-104 60-32-18 104-60v-24l-104-60Z" fill="#7aa2f7" />
          <path d="M174 74l32-18 40 23v36l-72-41Z" fill="#bb9af7" />
          <path d="M38 176l72 42-32 18-40-23Z" fill="#bb9af7" />
        </svg>
        strata.
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 105,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '-6px',
        }}
      >
        <span>Navigate</span>
        <span style={{ color: '#7aa2f7' }}>every layer.</span>
      </div>
      <div style={{ display: 'flex', marginTop: 35, fontSize: 22, color: '#929ab9' }}>
        Native Linux. Rust + GTK4. Entirely yours.
      </div>
      <div
        style={{
          position: 'absolute',
          right: 75,
          bottom: 65,
          display: 'flex',
          fontSize: 15,
          color: '#7aa2f7',
        }}
      >
        FREE & OPEN SOURCE ↗
      </div>
    </div>,
    size,
  );
}
