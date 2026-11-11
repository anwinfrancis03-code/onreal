import { Fragment } from 'react';
import { mix, mulberry } from '../utils/format';

export function Scene({ type = 'Land', seed = 1, variant = 0, className }) {
  const r = mulberry(seed * 7 + variant * 13 + 3);
  const skies = [
    ['#cfe4d8', '#f4f1e4'],
    ['#c5dde6', '#f5f1e6'],
    ['#ecd8bd', '#f8efd9'],
    ['#c3dccf', '#eef3df'],
  ];
  const sk = skies[(seed + variant) % 4];
  const g = 'sg' + seed + '_' + variant + type.length;
  const stripes = [];
  for (let i = 0; i < 7; i++) {
    const x1 = -200 + i * 130,
      x2 = x1 + 130;
    stripes.push(
      <polygon key={i} points={`200,150 ${x1},262 ${x2},262`} fill={i % 2 ? '#4a9460' : '#58a66b'} />,
    );
  }
  let body;
  if (type === 'Land') {
    body = (
      <Fragment>
        <path
          d={`M0 150 Q80 ${112 + r() * 18} 160 140 T320 133 T400 146 V170 H0Z`}
          fill={mix(sk[0], '#4d8f6a', 0.55)}
          opacity=".8"
        />
        <rect y="150" width="400" height="112" fill="#4f9a62" />
        {stripes}
        <polygon
          points="146,176 258,176 312,236 92,236"
          fill="rgba(255,255,255,.14)"
          stroke="#E0BC68"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <path d="M200 232v-34" stroke="#5b4426" strokeWidth="3" />
        <rect x="178" y="184" width="44" height="18" rx="3" fill="#fff" />
        <rect x="183" y="189" width="34" height="3" fill="#0F3D2E" />
        <rect x="183" y="195" width="22" height="3" fill="#B8903A" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={'t' + i}>
            <circle cx={40 + i * 80 + r() * 20} cy={158 + r() * 12} r={8 + r() * 5} fill="#2f7a4d" />
          </g>
        ))}
        {variant % 2 === 0 ? (
          <g fill={mix(sk[0], '#2a6a5a', 0.6)} opacity=".75">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={'c' + i} x={250 + i * 24} y={120 - r() * 34} width="16" height={40 + r() * 34} />
            ))}
          </g>
        ) : null}
      </Fragment>
    );
  } else if (type === 'Shop') {
    body = (
      <Fragment>
        <rect y="196" width="400" height="66" fill="#7c8580" />
        <rect y="196" width="400" height="6" fill="#9aa39d" />
        <rect
          x="40"
          y="70"
          width="320"
          height="130"
          fill={['#e8d9bd', '#d9c3a1', '#e3cfc0', '#d7e0cf'][seed % 4]}
        />
        <rect x="40" y="70" width="320" height="14" fill="#6d5a3c" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <polygon
            key={i}
            points={`${60 + i * 34},132 ${94 + i * 34},132 ${100 + i * 34},152 ${54 + i * 34},152`
              .split(' ')
              .slice(0, 4)
              .join(' ')}
            fill={i % 2 ? '#fff' : '#0F3D2E'}
          />
        ))}
        <rect x="60" y="150" width="130" height="50" fill="#b8d5df" stroke="#fff" strokeWidth="4" />
        <rect x="215" y="150" width="60" height="50" fill="#35525f" />
        <rect x="290" y="150" width="50" height="50" fill="#b8d5df" stroke="#fff" strokeWidth="4" />
        <rect x="120" y="96" width="160" height="26" rx="5" fill="#fff" />
        <rect x="132" y="104" width="90" height="5" fill="#0F3D2E" />
        <rect x="132" y="112" width="55" height="4" fill="#B8903A" />
      </Fragment>
    );
  } else if (type === 'Office') {
    body = (
      <Fragment>
        <rect y="204" width="400" height="58" fill="#59635e" />
        {[0, 1, 2].map((i) => {
          const x = 70 + i * 100,
            h = 130 + ((seed + i * 3) % 3) * 30,
            w = 82;
          return (
            <g key={i}>
              <rect x={x} y={204 - h} width={w} height={h} fill={['#6aa0b4', '#5b8fa6', '#7bb0bf'][i]} />
              {Array.from({ length: Math.floor(h / 16) }).map((_, j) => (
                <rect
                  key={j}
                  x={x + 4}
                  y={204 - h + 6 + j * 16}
                  width={w - 8}
                  height="9"
                  fill="rgba(255,255,255,.35)"
                />
              ))}
              <rect x={x} y={204 - h} width={w} height="5" fill="#2d4a56" />
            </g>
          );
        })}
      </Fragment>
    );
  } else {
    body = (
      <Fragment>
        <rect y="208" width="400" height="54" fill="#6a736e" />
        <rect
          x="90"
          y="52"
          width="220"
          height="160"
          fill={['#d8c9b0', '#cbbfa8', '#e1d2bd', '#c9d3c3'][seed % 4]}
        />
        <rect x="84" y="46" width="232" height="10" fill="#4b5a52" />
        {[0, 1, 2, 3].map((f) =>
          [0, 1, 2, 3, 4].map((c) => (
            <rect
              key={f + '-' + c}
              x={104 + c * 40}
              y={66 + f * 34}
              width="26"
              height="20"
              fill={(f + c + seed) % 3 === 0 ? '#f3d98b' : '#8fb3c0'}
              stroke="#fff"
              strokeWidth="2"
            />
          )),
        )}
        <rect x="180" y="176" width="40" height="36" fill="#35525f" />
      </Fragment>
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={type + ' illustration (sample artwork)'}
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sk[0]} />
          <stop offset="1" stopColor={sk[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="262" fill={`url(#${g})`} />
      {type !== 'Land' ? null : <circle cx={60 + r() * 60} cy="52" r="20" fill="#fff6d6" opacity=".85" />}
      {body}
    </svg>
  );
}

export function ListingImage({ p, i = 0 }) {
  const src = p.images && p.images[i];
  return src ? (
    <img src={src} alt={p.title} loading="lazy" />
  ) : (
    <Scene type={p.type} seed={p.seed || 1} variant={i} />
  );
}
