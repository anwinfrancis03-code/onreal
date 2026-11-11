import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function ChartTip({ active, payload, label, fmt }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tip">
      <div className="chart-tip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <span style={{ color: p.color }}>● </span>
          {payload.length > 1 ? p.dataKey + ': ' : ''}
          {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

/* Price chart built on Recharts. series = [{ name, color, points: [{ label, value }] }] */
export function MarketChart({ series, height = 320, fmt = (v) => v, area = true, id = 'lc' }) {
  const data = series[0].points.map((p, i) => {
    const row = { label: p.label };
    series.forEach((s) => {
      row[s.name] = s.points[i].value;
    });
    return row;
  });
  const vals = series.flatMap((s) => s.points.map((p) => p.value));
  const lo = Math.min(...vals),
    hi = Math.max(...vals),
    pad = (hi - lo) * 0.15 || 1;
  const domain = [lo - pad, hi + pad];
  const ticks = [0, 1, 2, 3].map((i) => +(domain[0] + ((domain[1] - domain[0]) * i) / 3).toFixed(2));
  const axis = {
    stroke: 'var(--muted)',
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  };
  const common = (
    <>
      <CartesianGrid stroke="var(--line)" vertical={false} />
      <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={28} />
      <YAxis {...axis} domain={domain} width={76} tickFormatter={fmt} ticks={ticks} />
      <Tooltip content={<ChartTip fmt={fmt} />} cursor={{ stroke: 'var(--muted)', strokeDasharray: '4 4' }} />
    </>
  );
  return (
    <div className="w-full" style={{ height }} role="img" aria-label="Illustrative land price chart">
      <ResponsiveContainer width="100%" height="100%">
        {area && series.length === 1 ? (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            key={series[0].name + data.length}
          >
            <defs>
              <linearGradient id={id + 'g'} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={series[0].color} stopOpacity={0.32} />
                <stop offset="1" stopColor={series[0].color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {common}
            <Area
              type="monotone"
              dataKey={series[0].name}
              stroke={series[0].color}
              strokeWidth={3}
              fill={`url(#${id}g)`}
              animationDuration={1400}
              dot={false}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: `drop-shadow(0 0 6px ${series[0].color}88)` }}
            />
          </AreaChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            key={series.map((s) => s.name).join('|') + data.length}
          >
            {common}
            <Legend iconType="circle" />
            {series.map((s) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={s.color}
                strokeWidth={3}
                dot={false}
                animationDuration={1400}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/* Tiny trend line used on locality cards. */
export function Spark({ points, color = '#2FBF71', w = 140, h = 44 }) {
  const data = points.map((p) => ({ v: p.value }));
  return (
    <LineChart
      width={w}
      height={h}
      data={data}
      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
      aria-hidden="true"
    >
      <YAxis hide domain={['dataMin', 'dataMax']} />
      <Line
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={2.4}
        dot={false}
        animationDuration={1500}
      />
    </LineChart>
  );
}
