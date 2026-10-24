// Holy card definitions (AI-generated, CC BY-SA 4.0). Built into src/data/santini/ by
// scripts/build-santini.mjs. Emblems are drawn around the halo centre (150,180), roughly
// inside x 90–210, y 115–250. niche = [top, bottom] gradient colours, accent = ribbon colour.
const INK = '#2b1d14';
const GOLD = '#d9ad55';
const CREAM = '#fbf3dd';

export default {
  ldapnightmare: {
    label: 'LDAPNightmare',
    motto: 'NOX SINE LDAP',
    niche: ['#1d2a4d', '#3b4c7a'],
    accent: '#1d2a4d',
    emblem: `
      <path d="M150 122 A58 58 0 1 0 150 238 A72 72 0 0 1 150 122 Z" fill="#f4e3a1"/>
      <g stroke="${CREAM}" stroke-width="3" fill="none"><path d="M178 150 V172 M178 172 L162 196 M178 172 L194 196"/></g>
      <g fill="${CREAM}"><circle cx="178" cy="148" r="7"/><circle cx="162" cy="200" r="7"/><circle cx="194" cy="200" r="7"/></g>
      <path d="M190 196 l8 8 M198 196 l-8 8" stroke="#c0392b" stroke-width="3"/>
      <g fill="#fff8d6"><circle cx="112" cy="132" r="2"/><circle cx="200" cy="128" r="2.5"/><circle cx="208" cy="232" r="2"/></g>`,
  },
  chronomaly: {
    label: 'Chronomaly',
    motto: 'TEMPUS FUGIT, THREAD QUOQUE',
    niche: ['#2e3d35', '#55705f'],
    accent: '#2e5a46',
    emblem: `
      <circle cx="150" cy="180" r="56" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      <g stroke="${INK}" stroke-width="3">${Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return `<line x1="${(150 + Math.cos(a) * 46).toFixed(1)}" y1="${(180 + Math.sin(a) * 46).toFixed(1)}" x2="${(150 + Math.cos(a) * 52).toFixed(1)}" y2="${(180 + Math.sin(a) * 52).toFixed(1)}"/>`;
      }).join('')}</g>
      <path d="M150 180 L150 140 M150 180 L178 192" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M150 180 L122 160" stroke="#9e1b1b" stroke-width="3" stroke-dasharray="5 4" stroke-linecap="round"/>
      <circle cx="150" cy="180" r="5" fill="${INK}"/>
      <path d="M168 128 L160 150 L172 160 L158 186 L170 200 L162 232" fill="none" stroke="${INK}" stroke-width="2.5"/>`,
  },
  meltdown: {
    label: 'Meltdown',
    motto: 'SPECULARE HUMANUM EST',
    niche: ['#5a2414', '#a14a22'],
    accent: '#a14a22',
    emblem: `
      <g stroke="${GOLD}" stroke-width="4">${[0, 1, 2, 3, 4]
        .map((i) => `<line x1="${116 + i * 17}" y1="124" x2="${116 + i * 17}" y2="136"/><line x1="98" y1="${142 + i * 13}" x2="110" y2="${142 + i * 13}"/><line x1="190" y1="${142 + i * 13}" x2="202" y2="${142 + i * 13}"/>`)
        .join('')}</g>
      <path d="M108 136 H192 V200 C192 214 184 214 182 204 C180 226 170 226 168 206 C166 240 152 240 150 208 C148 222 138 224 136 204 C134 216 120 218 118 202 C116 210 108 210 108 200 Z" fill="#3a3a3a" stroke="${GOLD}" stroke-width="2"/>
      <rect x="126" y="152" width="48" height="36" rx="3" fill="#f39c12"/>
      <path d="M150 208 C148 222 152 232 150 246" stroke="#f39c12" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="150" cy="250" r="5" fill="#f39c12"/>`,
  },
  noreboot: {
    label: 'NoReboot',
    motto: 'DORMIO SED VIGILO',
    niche: ['#26262e', '#4a4a58'],
    accent: '#3a3a48',
    emblem: `
      <rect x="117" y="118" width="66" height="124" rx="12" fill="#111" stroke="${GOLD}" stroke-width="3"/>
      <rect x="140" y="124" width="20" height="4" rx="2" fill="#333"/>
      <path d="M130 180 Q150 162 170 180 Q150 198 130 180 Z" fill="${CREAM}"/>
      <circle cx="150" cy="180" r="7" fill="#9e1b1b"/>
      <circle cx="150" cy="180" r="3" fill="#111"/>
      <g fill="none" stroke="${CREAM}" stroke-width="3" stroke-linecap="round" opacity="0.8"><path d="M143 212 A12 12 0 1 0 157 212"/><path d="M150 204 V216"/></g>`,
  },
  cablehaunt: {
    label: 'Cable Haunt',
    motto: 'SPIRITUS IN MODEMO',
    niche: ['#2c3e50', '#4f6d7a'],
    accent: '#34495e',
    emblem: `
      <path d="M150 238 C176 238 196 226 204 214" fill="none" stroke="#bfc9d1" stroke-width="7" stroke-linecap="round"/>
      <rect x="198" y="198" width="16" height="20" rx="3" fill="${GOLD}" transform="rotate(-30 206 208)"/>
      <path d="M112 232 V164 A38 38 0 0 1 188 164 V232 L175 220 L162 232 L150 220 L138 232 L125 220 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="136" cy="168" rx="7" ry="10" fill="${INK}"/><ellipse cx="164" cy="168" rx="7" ry="10" fill="${INK}"/>
      <ellipse cx="150" cy="196" rx="9" ry="7" fill="${INK}"/>`,
  },
  freak: {
    label: 'FREAK',
    motto: 'CLAVIS BREVIS',
    niche: ['#3d2f12', '#7a5d22'],
    accent: '#7a5d22',
    emblem: `
      <path d="M122 172 V150 A28 28 0 0 1 178 150 V172" fill="none" stroke="#8a8a8a" stroke-width="10"/>
      <rect x="110" y="168" width="80" height="66" rx="8" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
      <text x="150" y="210" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="26" fill="${INK}">512</text>
      <path d="M200 132 V170 M190 160 L200 172 L210 160" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <text x="96" y="140" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="14" fill="${CREAM}">1995</text>`,
  },
  connectaround: {
    label: 'ConnectAround',
    motto: 'PORTA APERTA',
    niche: ['#3b1f4a', '#6a3d7f'],
    accent: '#5b2c6f',
    emblem: `
      <path d="M120 240 V150 A30 30 0 0 1 180 150 V240 Z" fill="#4a2c1a" stroke="${GOLD}" stroke-width="3"/>
      <path d="M126 240 V152 A24 24 0 0 1 150 128 L162 134 V246 Z" fill="#8b5a2b"/>
      <circle cx="156" cy="192" r="3" fill="${GOLD}"/>
      <text x="150" y="232" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="13" fill="${CREAM}">VPN</text>
      <path d="M96 210 C88 150 116 112 150 112 C184 112 212 150 204 200" fill="none" stroke="#e74c3c" stroke-width="5" stroke-linecap="round"/>
      <path d="M196 192 L204 206 L214 194" fill="none" stroke="#e74c3c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  symstealer: {
    label: 'SymStealer',
    motto: 'SEQUERE NEXUM',
    niche: ['#153a3a', '#2f6b66'],
    accent: '#1f5753',
    emblem: `
      <g fill="none" stroke="${GOLD}" stroke-width="9">
        <rect x="102" y="150" width="58" height="30" rx="15" transform="rotate(-25 131 165)"/>
        <rect x="138" y="168" width="58" height="30" rx="15" transform="rotate(-25 167 183)"/>
      </g>
      <path d="M118 222 C140 240 172 238 186 222" fill="none" stroke="${CREAM}" stroke-width="3" stroke-dasharray="6 5"/>
      <g transform="translate(186 212)"><circle r="9" fill="none" stroke="${CREAM}" stroke-width="4"/><path d="M8 4 L26 14 M18 9 L22 2 M23 12 L27 5" stroke="${CREAM}" stroke-width="4" stroke-linecap="round"/></g>`,
  },
  shitrix: {
    label: 'Shitrix',
    motto: 'PER ASPERA AD ROOT',
    niche: ['#4a3420', '#8a6440'],
    accent: '#6e4b2a',
    emblem: `
      <path d="M100 244 H130 V222 H160 V200 H190 V178 H210" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linejoin="round"/>
      <text x="146" y="184" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="66" fill="${CREAM}">../</text>
      <path d="M196 130 L204 150 L212 130 Z" fill="${GOLD}"/><rect x="200" y="150" width="8" height="10" fill="${GOLD}"/>
      <text x="204" y="126" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="14" fill="${GOLD}">root</text>`,
  },
  bodysnatcher: {
    label: 'BodySnatcher',
    motto: 'EGO SUM TU',
    niche: ['#173548', '#2d5f7c'],
    accent: '#214d68',
    emblem: `
      <line x1="150" y1="124" x2="150" y2="140" stroke="#bfc9d1" stroke-width="4"/><circle cx="150" cy="120" r="6" fill="#e74c3c"/>
      <rect x="112" y="140" width="76" height="70" rx="14" fill="#bfc9d1" stroke="${INK}" stroke-width="2"/>
      <path d="M104 170 Q114 156 132 162 L150 170 L168 162 Q186 156 196 170 Q186 186 168 180 L150 176 L132 180 Q114 186 104 170 Z" fill="${INK}"/>
      <circle cx="132" cy="170" r="5" fill="#5dade2"/><circle cx="168" cy="170" r="5" fill="#5dade2"/>
      <rect x="132" y="192" width="36" height="6" rx="3" fill="${INK}"/>
      <path d="M120 210 L112 244 H188 L180 210 Z" fill="#7f8c8d"/>
      <text x="150" y="236" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="12" fill="${CREAM}">@ admin</text>`,
  },
  curveball: {
    label: 'CurveBall',
    motto: 'CURVA NON RECTA',
    niche: ['#1e3a5f', '#3d6a9e'],
    accent: '#1e3a5f',
    emblem: `
      <path d="M96 120 C130 150 120 176 150 180 C180 184 170 210 204 242" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="7 5"/>
      <circle cx="150" cy="180" r="44" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <path d="M124 146 C140 166 140 194 124 214" fill="none" stroke="#c0392b" stroke-width="3"/>
      <path d="M176 146 C160 166 160 194 176 214" fill="none" stroke="#c0392b" stroke-width="3"/>
      <g stroke="#c0392b" stroke-width="2">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${127 + (i % 3 === 0 ? 4 : 7)} ${152 + i * 10} l7 -3 M${173 - (i % 3 === 0 ? 4 : 7)} ${152 + i * 10} l-7 -3"/>`).join('')}</g>`,
  },
  whisperpair: {
    label: 'WhisperPair',
    motto: 'AUDIO TE',
    niche: ['#3c1a3c', '#6e3a6e'],
    accent: '#5e2a5e',
    emblem: `
      <path d="M108 190 V170 A42 42 0 0 1 192 170 V190" fill="none" stroke="#bfc9d1" stroke-width="9" stroke-linecap="round"/>
      <rect x="96" y="182" width="26" height="46" rx="10" fill="#bfc9d1"/><rect x="178" y="182" width="26" height="46" rx="10" fill="#bfc9d1"/>
      <rect x="101" y="190" width="16" height="30" rx="6" fill="#9b59b6"/><rect x="183" y="190" width="16" height="30" rx="6" fill="#9b59b6"/>
      <g fill="none" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"><path d="M214 192 Q222 205 214 218"/><path d="M222 184 Q234 205 222 226"/></g>
      <path d="M136 240 Q150 228 164 240" fill="none" stroke="${GOLD}" stroke-width="3"/><text x="150" y="252" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="12" fill="${CREAM}">psst</text>`,
  },
  leftoverlocals: {
    label: 'LeftoverLocals',
    motto: 'NIHIL DELETUR',
    niche: ['#2b3a1f', '#56713c'],
    accent: '#46602f',
    emblem: `
      <ellipse cx="150" cy="200" rx="66" ry="30" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="150" cy="198" rx="46" ry="19" fill="none" stroke="#c9b98f" stroke-width="2"/>
      <rect x="126" y="160" width="48" height="34" rx="4" fill="#2f2f2f"/>
      <circle cx="150" cy="177" r="11" fill="none" stroke="#76b041" stroke-width="3"/><path d="M150 166 V188 M139 177 H161" stroke="#76b041" stroke-width="2"/>
      <g fill="#a67c52"><circle cx="118" cy="204" r="3"/><circle cx="128" cy="210" r="2"/><circle cx="176" cy="206" r="3"/><circle cx="186" cy="200" r="2"/><circle cx="160" cy="212" r="2"/></g>
      <path d="M212 150 V214 M206 150 V170 M212 150 V170 M218 150 V170 M206 170 Q212 176 218 170" fill="none" stroke="#bfc9d1" stroke-width="3"/>`,
  },
  etherleak: {
    label: 'Etherleak',
    motto: 'ZERO NON IMPLEVIT',
    niche: ['#14394a', '#2f6d87'],
    accent: '#1d5168',
    emblem: `
      <path d="M150 118 V140" stroke="#3498db" stroke-width="10" stroke-linecap="round"/>
      <rect x="122" y="140" width="56" height="58" rx="4" fill="#dfe6e9" stroke="${INK}" stroke-width="2"/>
      <rect x="138" y="198" width="24" height="10" fill="#dfe6e9" stroke="${INK}" stroke-width="2"/>
      <g fill="${GOLD}">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${127 + i * 6}" y="184" width="3" height="12"/>`).join('')}</g>
      <g fill="#5dade2"><path d="M136 216 q-6 10 0 14 q6 -4 0 -14z"/><path d="M152 222 q-7 12 0 16 q7 -4 0 -16z"/><path d="M166 214 q-5 9 0 12 q5 -3 0 -12z"/></g>
      <text x="196" y="236" font-family="'EB Garamond', Georgia, serif" font-size="12" fill="${CREAM}">0x?</text>`,
  },
  markdowntime: {
    label: 'MarkDownTime',
    motto: 'FESTINA LENTE',
    niche: ['#4a1f2b', '#80374d'],
    accent: '#6b2a3d',
    emblem: `
      <rect x="112" y="118" width="76" height="10" rx="3" fill="${GOLD}"/><rect x="112" y="234" width="76" height="10" rx="3" fill="${GOLD}"/>
      <path d="M120 128 C120 166 146 170 146 181 C146 192 120 196 120 234 H180 C180 196 154 192 154 181 C154 170 180 166 180 128 Z" fill="${CREAM}" fill-opacity="0.9" stroke="${INK}" stroke-width="2"/>
      <text x="150" y="160" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="30" fill="${INK}">#</text>
      <path d="M128 232 Q150 206 172 232 Z" fill="#e2b866"/><line x1="150" y1="184" x2="150" y2="214" stroke="#e2b866" stroke-width="2"/>
      <text x="206" y="150" font-family="'EB Garamond', Georgia, serif" font-size="14" fill="${CREAM}">*</text><text x="88" y="214" font-family="'EB Garamond', Georgia, serif" font-size="14" fill="${CREAM}">*</text>`,
  },
  dnspooq: {
    label: 'DNSpooq',
    motto: 'VIA FALSA',
    niche: ['#20203a', '#45456e'],
    accent: '#38385e',
    emblem: `
      <rect x="146" y="130" width="8" height="118" fill="#6e4b2a"/>
      <path d="M152 140 H204 L216 152 L204 164 H152 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <text x="180" y="157" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="12" fill="${INK}">bank.com</text>
      <path d="M148 176 H96 L84 188 L96 200 H148 Z" fill="#c0392b" stroke="${INK}" stroke-width="2"/>
      <text x="118" y="193" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="12" fill="${CREAM}">bank.com</text>
      <path d="M184 236 V212 A14 14 0 0 1 212 212 V236 l-5 -5 l-4 5 l-5 -5 l-4 5 l-5 -5 z" fill="${CREAM}" opacity="0.9"/>
      <circle cx="194" cy="214" r="2.5" fill="${INK}"/><circle cx="202" cy="214" r="2.5" fill="${INK}"/>`,
  },
  evilesp: {
    label: 'EvilESP',
    motto: 'CAVE CIPHRAM',
    niche: ['#3a0f0f', '#7a1f1f'],
    accent: '#7a1f1f',
    emblem: `
      <path d="M118 150 L106 124 L132 144 Z M182 150 L194 124 L168 144 Z" fill="#c0392b"/>
      <rect x="104" y="146" width="92" height="64" rx="4" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <path d="M104 148 L150 184 L196 148" fill="none" stroke="${INK}" stroke-width="2"/>
      <rect x="138" y="190" width="24" height="16" rx="2" fill="${GOLD}"/><path d="M142 190 V184 A8 8 0 0 1 158 184 V190" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <path d="M196 196 C214 200 214 226 200 232 C192 236 188 228 194 224" fill="none" stroke="#c0392b" stroke-width="3"/>
      <path d="M190 220 L198 228 L188 230 Z" fill="#c0392b"/>`,
  },
  'skip-tls': {
    label: 'SKIP-TLS',
    motto: 'SALTUS IN HANDSHAKE',
    niche: ['#1f3b2c', '#3f7356'],
    accent: '#2f5b43',
    emblem: `
      <path d="M96 244 H124 V222 H152" fill="none" stroke="${CREAM}" stroke-width="5"/>
      <path d="M178 178 H206 V156" fill="none" stroke="${CREAM}" stroke-width="5"/>
      <path d="M152 222 V218 M178 178 V182" stroke="${CREAM}" stroke-width="5"/>
      <path d="M152 222 Q166 160 178 178" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="5 5"/>
      <g fill="${GOLD}"><ellipse cx="110" cy="236" rx="5" ry="3"/><ellipse cx="138" cy="214" rx="5" ry="3"/><ellipse cx="192" cy="170" rx="5" ry="3"/></g>
      <text x="166" y="208" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="13" fill="#e74c3c">?</text>
      <text x="150" y="140" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="14" fill="${CREAM}">Hello · · · Finished</text>`,
  },
  'cookie-sandwich': {
    label: 'Cookie Sandwich',
    motto: 'INTER DUAS VIRGULAS',
    niche: ['#4a2f17', '#8a5a2e'],
    accent: '#7a4e24',
    emblem: `
      <path d="M104 160 Q104 132 150 132 Q196 132 196 160 V166 H104 Z" fill="#e0b16b" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="150" cy="182" rx="50" ry="14" fill="#8b5a2b" stroke="${INK}" stroke-width="2"/>
      <g fill="#3b2412"><circle cx="128" cy="180" r="3"/><circle cx="146" cy="186" r="3"/><circle cx="164" cy="178" r="3"/><circle cx="178" cy="185" r="2.5"/></g>
      <rect x="104" y="198" width="92" height="22" rx="6" fill="#e0b16b" stroke="${INK}" stroke-width="2"/>
      <text x="88" y="196" font-family="'EB Garamond', Georgia, serif" font-size="30" fill="${CREAM}">"</text>
      <text x="200" y="196" font-family="'EB Garamond', Georgia, serif" font-size="30" fill="${CREAM}">"</text>`,
  },
  pantsdown: {
    label: 'pantsdown',
    motto: 'BRACAE DEMISSAE',
    niche: ['#1f2f4a', '#3f5a85'],
    accent: '#2f4670',
    emblem: `
      <rect x="116" y="124" width="68" height="44" rx="4" fill="#2f2f2f" stroke="${GOLD}" stroke-width="2"/>
      <text x="150" y="152" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="14" fill="${GOLD}">BMC</text>
      <g stroke="${GOLD}" stroke-width="3">${[0, 1, 2, 3].map((i) => `<line x1="${126 + i * 16}" y1="168" x2="${126 + i * 16}" y2="176"/>`).join('')}</g>
      <path d="M112 212 H188 L194 248 H160 L150 226 L140 248 H106 Z" fill="#2e86c1" stroke="${INK}" stroke-width="2"/>
      <rect x="110" y="206" width="80" height="10" fill="#6e4b2a"/><rect x="144" y="205" width="12" height="12" fill="${GOLD}"/>
      <path d="M150 178 V202" stroke="${CREAM}" stroke-width="2" stroke-dasharray="3 3"/>`,
  },
  chameleon: {
    label: 'Chameleon',
    motto: 'MUTATIS MUTANDIS',
    niche: ['#1e3d26', '#3e7a4c'],
    accent: '#2e6b3e',
    emblem: `
      <path d="M118 196 C100 196 98 228 116 230 C130 232 132 212 120 212 C112 212 112 222 118 222" fill="none" stroke="#e67e22" stroke-width="7" stroke-linecap="round"/>
      <path d="M118 196 C126 158 176 150 196 172 C204 182 200 196 188 198 C170 202 140 204 118 196 Z" fill="#27ae60" stroke="${INK}" stroke-width="2"/>
      <path d="M150 160 C156 176 160 186 160 200" fill="none" stroke="#9b59b6" stroke-width="5"/>
      <circle cx="184" cy="178" r="8" fill="${CREAM}" stroke="${INK}" stroke-width="2"/><circle cx="186" cy="178" r="3" fill="${INK}"/>
      <path d="M140 200 L136 214 M170 199 L172 214" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M150 128 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 z" fill="${GOLD}"/>`,
  },
  pwnkit: {
    label: 'PwnKit',
    motto: 'ARGC NULLUS',
    niche: ['#3d1f0f', '#7a4220'],
    accent: '#8a4a1e',
    emblem: `
      <path d="M108 196 L100 140 L126 164 L150 128 L174 164 L200 140 L192 196 Z" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
      <rect x="106" y="196" width="88" height="16" rx="3" fill="#b8892b" stroke="${INK}" stroke-width="2"/>
      <g fill="#c0392b"><circle cx="150" cy="178" r="7"/></g><g fill="#2980b9"><circle cx="124" cy="182" r="5"/><circle cx="176" cy="182" r="5"/></g>
      <text x="150" y="240" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="20" fill="${CREAM}">argc = 0</text>`,
  },
  'baron-samedit': {
    label: 'Baron Samedit',
    motto: 'SUDO ERGO SUM',
    niche: ['#1c1424', '#3d2a52'],
    accent: '#3d2a52',
    emblem: `
      <circle cx="150" cy="194" r="32" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="138" cy="190" rx="8" ry="9" fill="${INK}"/><ellipse cx="162" cy="190" rx="8" ry="9" fill="${INK}"/>
      <path d="M146 204 L150 198 L154 204 Z" fill="${INK}"/>
      <path d="M134 216 H166 M140 212 V220 M147 212 V221 M153 212 V221 M160 212 V220" stroke="${INK}" stroke-width="2"/>
      <rect x="116" y="164" width="68" height="8" rx="3" fill="#111" stroke="${GOLD}" stroke-width="1.5"/>
      <rect x="126" y="120" width="48" height="46" fill="#111" stroke="${GOLD}" stroke-width="1.5"/><rect x="126" y="152" width="48" height="8" fill="#8e44ad"/>
      <text x="206" y="240" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="30" fill="${GOLD}">\\</text>`,
  },
  sgaxe: {
    label: 'SGAxe',
    motto: 'CLAUSTRUM FRACTUM',
    niche: ['#0f2d40', '#24597a'],
    accent: '#1b4a66',
    emblem: `
      <path d="M112 176 L150 160 L188 176 L150 192 Z" fill="#5dade2" stroke="${INK}" stroke-width="2"/>
      <path d="M112 176 V222 L150 238 V192 Z" fill="#2e86c1" stroke="${INK}" stroke-width="2"/>
      <path d="M188 176 V222 L150 238 V192 Z" fill="#1b4f72" stroke="${INK}" stroke-width="2"/>
      <path d="M150 192 L144 206 L154 214 L146 236" fill="none" stroke="${CREAM}" stroke-width="3"/>
      <rect x="160" y="118" width="8" height="74" rx="3" fill="#8b5a2b" transform="rotate(30 164 155)"/>
      <path d="M172 118 C190 112 206 124 204 142 L182 136 Z" fill="#bfc9d1" stroke="${INK}" stroke-width="2"/>
      <circle cx="150" cy="212" r="5" fill="${GOLD}"/>`,
  },
  ghost: {
    label: 'GHOST',
    motto: 'SPIRITUS GLIBCI',
    niche: ['#2a2a3a', '#545470'],
    accent: '#45455e',
    emblem: `
      <path d="M110 240 V170 A40 40 0 0 1 190 170 V240 L177 228 L164 240 L150 228 L136 240 L123 228 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <circle cx="136" cy="172" r="8" fill="${INK}"/><circle cx="164" cy="172" r="8" fill="${INK}"/>
      <path d="M134 202 Q150 192 166 202 Q150 216 134 202 Z" fill="${INK}"/>
      <g fill="none" stroke="${GOLD}" stroke-width="3"><ellipse cx="198" cy="226" rx="6" ry="4"/><ellipse cx="208" cy="234" rx="6" ry="4"/><ellipse cx="218" cy="242" rx="6" ry="4"/></g>
      <text x="150" y="132" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="12" fill="${CREAM}">gethostbyname()</text>`,
  },
  thunderstrike: {
    label: 'Thunderstrike',
    motto: 'FULGUR IN FIRMWARE',
    niche: ['#1d1d33', '#3c3c66'],
    accent: '#2f2f55',
    emblem: `
      <rect x="112" y="196" width="76" height="44" rx="4" fill="#1e8449" stroke="${INK}" stroke-width="2"/>
      <rect x="136" y="206" width="28" height="24" fill="#2f2f2f"/><text x="150" y="222" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="10" fill="${GOLD}">EFI</text>
      <g stroke="${GOLD}" stroke-width="2">${[0, 1, 2, 3, 4].map((i) => `<line x1="${120 + i * 14}" y1="240" x2="${120 + i * 14}" y2="246"/>`).join('')}</g>
      <path d="M164 120 L130 170 H152 L138 210 L180 156 H158 L172 120 Z" fill="#f1c40f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  },
  'leaky-vessels': {
    label: 'Leaky Vessels',
    motto: 'NAVIS PERFORATA',
    niche: ['#0f3a4a', '#1f6f87'],
    accent: '#17566b',
    emblem: `
      <rect x="118" y="158" width="30" height="22" fill="#e74c3c" stroke="${INK}" stroke-width="1.5"/><rect x="150" y="158" width="30" height="22" fill="#2980b9" stroke="${INK}" stroke-width="1.5"/>
      <rect x="134" y="136" width="30" height="22" fill="#f39c12" stroke="${INK}" stroke-width="1.5"/>
      <path d="M100 180 H204 L190 212 H112 Z" fill="#34495e" stroke="${INK}" stroke-width="2"/>
      <circle cx="160" cy="198" r="4" fill="#111"/>
      <g fill="#5dade2"><path d="M160 204 q-5 9 0 12 q5 -3 0 -12z"/><path d="M160 222 q-4 7 0 10 q4 -3 0 -10z"/></g>
      <path d="M90 232 Q105 222 120 232 T150 232 T180 232 T210 232" fill="none" stroke="#aed6f1" stroke-width="3"/>`,
  },
  log4shell: {
    label: 'Log4Shell',
    motto: 'JNDI DELENDA EST',
    niche: ['#4a1a10', '#8a3a1c'],
    accent: '#9e1b1b',
    emblem: `
      <path d="M200 206 C214 186 206 172 196 160 C198 176 188 180 184 170 C178 186 186 196 182 206 Z" fill="#e67e22"/>
      <path d="M196 206 C204 194 200 186 194 180 C194 190 188 192 188 188 C186 196 190 202 188 206 Z" fill="#f1c40f"/>
      <rect x="104" y="182" width="84" height="40" rx="6" fill="#8b5a2b" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="104" cy="202" rx="14" ry="20" fill="#d4a373" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="104" cy="202" rx="8" ry="12" fill="none" stroke="#8b5a2b" stroke-width="2"/><ellipse cx="104" cy="202" rx="3" ry="5" fill="#8b5a2b"/>
      <path d="M126 192 H176 M132 204 H170 M124 214 H160" stroke="#6e4b2a" stroke-width="2"/>
      <text x="150" y="156" text-anchor="middle" font-family="'EB Garamond', Georgia, serif" font-size="26" fill="${CREAM}">\${jndi:}</text>`,
  },
};
