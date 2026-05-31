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
          background: 'linear-gradient(135deg, #f7fbff 0%, #e6f0ff 100%)'
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 50H13C6.9 50 2 45.1 2 39s4.9-11 11-11c1.1 0 2.2.2 3.3.5C17.4 18.1 25.5 11 35.5 11c9.4 0 17.2 6.4 19.8 15.1C60.2 26.1 64 30.5 64 36c0 7.2-5.8 13-13 13H48" stroke="#1d74ff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 27h18l7 7v22H20z" fill="#15347a" />
            <path d="M38 27v7h7" stroke="#eff5ff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 48V34" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <path d="M22 40l8-8 8 8" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    ),
    size
  );
}
