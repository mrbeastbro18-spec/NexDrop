import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)'
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            border: '3px solid #60a5fa',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '11px 8px auto 8px',
              height: 3,
              borderRadius: 9999,
              background: '#34d399'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '23px 8px auto 8px',
              width: 18,
              height: 3,
              borderRadius: 9999,
              background: '#34d399'
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
