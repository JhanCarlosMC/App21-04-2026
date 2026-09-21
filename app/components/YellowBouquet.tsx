export default function YellowBouquet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 400" fill="none" aria-hidden="true">
      <ellipse cx="180" cy="361" rx="95" ry="13" fill="#AD8624" opacity=".1" />
      <g stroke="#788046" strokeWidth="5" strokeLinecap="round">
        <path d="M178 345Q150 230 95 131M183 345Q203 227 267 143M182 344 179 88M183 345Q157 259 137 204M181 344Q213 242 229 204" />
      </g>
      <g fill="#899354">
        <path d="M167 279Q109 275 114 232Q161 233 167 279ZM194 267Q249 249 256 218Q204 218 194 267ZM176 221Q144 197 151 168Q181 178 176 221Z" />
      </g>
      {[{ x: 94, y: 128, r: -18 }, { x: 267, y: 141, r: 22 }, { x: 179, y: 88, r: 4 }, { x: 137, y: 204, r: -8 }, { x: 229, y: 204, r: 12 }].map(({ x, y, r }, index) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
          {Array.from({ length: 12 }, (_, petal) => (
            <ellipse key={petal} cy="-29" rx="12" ry="28" transform={`rotate(${petal * 30})`} fill={petal % 2 ? '#F2BA32' : '#FFD65A'} stroke="#E8AC25" strokeWidth=".6" />
          ))}
          <circle r="21" fill={index % 2 ? '#8D602B' : '#785129'} />
          <circle r="15" stroke="#BB8B40" strokeWidth="2" strokeDasharray="1 5" />
          <circle r="8" stroke="#D4A355" strokeWidth="2" strokeDasharray="1 4" />
        </g>
      ))}
      <path d="m124 270 57 22 58-22-34 84h-48Z" fill="#F3DFAD" fillOpacity=".88" stroke="#D8BD7F" />
      <path d="m124 270 57 22-24 62M239 270l-58 22 24 62" stroke="#FFF9E8" strokeWidth="2" />
      <path d="M181 318c-44-30-42 17 0 0 42-32 43 17 0 0Zm0 0-17 35m17-35 19 34" stroke="#B98A31" strokeWidth="4" strokeLinecap="round" />
      <g fill="#D7AD3F"><path d="m44 202 3 8 8 3-8 3-3 8-3-8-8-3 8-3ZM304 72l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" /><circle cx="61" cy="67" r="3" /><circle cx="300" cy="257" r="3" /></g>
    </svg>
  )
}
