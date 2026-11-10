import clsx from "clsx";

// Manama skyline at dusk: Financial Harbour towers, the World Trade Center with
// its three wind-turbine bridges, a dhow and palms over the Gulf
const buildingsBack = [
  [0, 330, 40], [38, 350, 35], [70, 310, 30], [215, 340, 30], [400, 300, 25],
  [425, 335, 28], [505, 315, 32], [540, 345, 30], [575, 290, 34], [612, 330, 30],
  [645, 305, 36], [684, 340, 28], [715, 295, 34], [752, 325, 48],
];

const buildingsFront = [
  [10, 370, 34], [46, 385, 28], [212, 375, 34], [402, 360, 44], [515, 372, 40],
  [560, 355, 30], [596, 380, 38], [640, 362, 34], [680, 385, 40], [726, 360, 30],
  [760, 378, 40],
];

const windows = [
  [18, 380], [24, 392], [54, 395], [220, 386], [228, 398], [410, 372], [420, 388],
  [432, 376], [523, 384], [533, 398], [568, 366], [604, 392], [648, 374],
  [690, 396], [734, 372], [770, 390],
];

const Palm = ({ x, scale = 1 }) => (
  <g transform={`translate(${x} 420) scale(${scale})`} fill="#010816">
    <path d="M-2 0 Q-6 -30 2 -62 L5 -62 Q-1 -30 3 0 Z" />
    <path d="M3 -62 Q-18 -72 -34 -56 Q-16 -66 3 -60 Z" />
    <path d="M3 -62 Q24 -74 40 -58 Q22 -67 3 -60 Z" />
    <path d="M3 -62 Q-8 -84 -26 -84 Q-8 -78 3 -61 Z" />
    <path d="M3 -62 Q16 -86 34 -82 Q16 -78 3 -61 Z" />
    <path d="M3 -62 Q2 -88 8 -94 Q6 -80 4 -61 Z" />
  </g>
);

const BahrainScene = ({ className }) => (
  <svg
    viewBox="0 0 800 500"
    preserveAspectRatio="xMidYMax slice"
    className={clsx("size-full", className)}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="bh-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#001233" />
        <stop offset="0.45" stopColor="#0B3A85" />
        <stop offset="0.72" stopColor="#6a4a8c" />
        <stop offset="0.88" stopColor="#e07a5f" />
        <stop offset="1" stopColor="#f2a65a" />
      </linearGradient>
      <radialGradient id="bh-sun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff1c1" />
        <stop offset="0.6" stopColor="#ffc56b" />
        <stop offset="1" stopColor="#ffc56b" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="bh-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0d2350" />
        <stop offset="1" stopColor="#000814" />
      </linearGradient>
    </defs>

    <rect width="800" height="420" fill="url(#bh-sky)" />

    {/* Stars */}
    <g fill="#fff" opacity="0.7">
      {[[420, 40], [520, 70], [610, 30], [700, 90], [760, 45], [470, 120], [660, 150], [560, 20]].map(
        ([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" />
      )}
    </g>

    {/* Setting sun */}
    <circle cx="470" cy="408" r="70" fill="url(#bh-sun)" />

    {/* Distant city */}
    <g fill="#132a5c" opacity="0.85">
      {buildingsBack.map(([x, y, w]) => (
        <rect key={x} x={x} y={y} width={w} height={420 - y} />
      ))}
    </g>

    <g fill="#04102b">
      {/* Bahrain Financial Harbour twin towers */}
      <path d="M118 420 L118 250 Q138 222 158 236 L158 420 Z" />
      <path d="M166 420 L166 236 Q186 222 206 250 L206 420 Z" />

      {/* Bahrain World Trade Center */}
      <path d="M244 420 L300 420 L298 196 Q262 290 244 420 Z" />
      <path d="M340 420 L396 420 Q378 290 342 196 L340 420 Z" />
      {[262, 312, 362].map((y) => (
        <rect key={y} x="298" y={y} width="44" height="5" />
      ))}

      {/* Bahrain Bay tower with its sky opening */}
      <path
        fillRule="evenodd"
        d="M452 420 L452 238 L498 226 L498 420 Z M460 296 L490 296 L490 326 L460 326 Z"
      />

      {buildingsFront.map(([x, y, w]) => (
        <rect key={x} x={x} y={y} width={w} height={420 - y} />
      ))}
    </g>

    {/* Wind turbines on the World Trade Center bridges */}
    <g stroke="#A4E400" strokeWidth="1.5" fill="none" opacity="0.8">
      {[264, 314, 364].map((y) => (
        <circle key={y} cx="320" cy={y + 2} r="13" />
      ))}
    </g>

    {/* Lit windows */}
    <g fill="#ffd27a" opacity="0.75">
      {windows.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="5" />
      ))}
    </g>

    <Palm x={86} scale={1.1} />
    <Palm x={226} scale={0.8} />
    <Palm x={540} scale={0.9} />

    {/* Gulf water with the sun's reflection */}
    <rect y="420" width="800" height="80" fill="url(#bh-sea)" />
    <g fill="#ffc56b">
      <rect x="440" y="428" width="60" height="2.5" opacity="0.7" rx="1" />
      <rect x="425" y="440" width="90" height="2" opacity="0.5" rx="1" />
      <rect x="448" y="452" width="44" height="2" opacity="0.4" rx="1" />
      <rect x="415" y="466" width="110" height="1.5" opacity="0.25" rx="1" />
    </g>

    {/* Traditional dhow */}
    <g transform="translate(150 446)" fill="#010816">
      <path d="M-34 0 L34 0 Q28 12 -22 12 Z" />
      <path d="M-4 -2 L-4 -46 L28 -4 Z" />
      <path d="M-8 -2 L-8 -34 L-26 -4 Z" opacity="0.85" />
    </g>
  </svg>
);

export default BahrainScene;
