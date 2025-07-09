import React, { useState } from 'react';

const categoriasExemplo = [
  'SÉRIES | LANÇAMENTOS',
  'SÉRIES | DRAMA',
  'SÉRIES | COMÉDIA',
  'SÉRIES | POLICIAL',
  'SÉRIES | FICÇÃO',
  'SÉRIES | ANIMAÇÃO',
  'SÉRIES | DOCUMENTÁRIO',
  'SÉRIES | AÇÃO',
  'SÉRIES | FANTASIA',
  'SÉRIES | ROMANCE',
];

const seriesExemplo = [
  { titulo: 'Stranger Things', capa: 'https://image.tmdb.org/t/p/w300/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', categoria: 0 },
  { titulo: 'The Witcher', capa: 'https://image.tmdb.org/t/p/w300/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', categoria: 0 },
  { titulo: 'La Casa de Papel', capa: 'https://image.tmdb.org/t/p/w300/mo0FP1GxOFZT4UDde7RFDz5APXF.jpg', categoria: 0 },
  { titulo: 'Loki', capa: 'https://image.tmdb.org/t/p/w300/voHUmluYmKyleFkTu3lOXQG702u.jpg', categoria: 0 },
  { titulo: 'The Boys', capa: 'https://image.tmdb.org/t/p/w300/mY7SeH4HFFxW1hiI6cWuwCRKptN.jpg', categoria: 0 },
  { titulo: 'Wandinha', capa: 'https://image.tmdb.org/t/p/w300/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', categoria: 0 },
  { titulo: 'Round 6', capa: 'https://image.tmdb.org/t/p/w300/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', categoria: 0 },
  { titulo: 'The Mandalorian', capa: 'https://image.tmdb.org/t/p/w300/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', categoria: 0 },
  { titulo: 'Breaking Bad', capa: 'https://image.tmdb.org/t/p/w300/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', categoria: 0 },
  { titulo: 'Game of Thrones', capa: 'https://image.tmdb.org/t/p/w300/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', categoria: 0 },
  // ...adicione mais séries se quiser
];

export default function Series() {
  const [categoriaIdx, setCategoriaIdx] = useState(0);
  const series = seriesExemplo.filter(s => s.categoria === categoriaIdx);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#18181c', color: '#fff', fontFamily: 'Segoe UI, Arial' }}>
      {/* Sidebar simples */}
      <aside style={{ width: 80, background: '#111116', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
        <div style={{ marginBottom: 30, fontSize: 24 }}>☰</div>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '20px 0' }}><span role="img" aria-label="home">🏠</span></li>
            <li style={{ margin: '20px 0', color: '#fff' }}><span role="img" aria-label="tv">📺</span></li>
            <li style={{ margin: '20px 0' }}><span role="img" aria-label="movie">🎬</span></li>
            <li style={{ margin: '20px 0' }}><span role="img" aria-label="series">📼</span></li>
          </ul>
        </nav>
      </aside>
      {/* Categorias */}
      <div style={{ width: 220, background: '#1e1e23', padding: '18px 0', borderRight: '1px solid #23232a', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categoriasExemplo.map((cat, idx) => (
            <li
              key={cat}
              onClick={() => setCategoriaIdx(idx)}
              style={{
                padding: '10px 18px',
                color: idx === categoriaIdx ? '#fff' : '#bbb',
                background: idx === categoriaIdx ? '#6c63ff' : 'none',
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                marginBottom: 2,
                fontWeight: idx === categoriaIdx ? 600 : 400
              }}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>
      {/* Grid de séries */}
      <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24 }}>
          {series.map((s, idx) => (
            <div key={idx} style={{ background: '#23232a', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={s.capa} alt={s.titulo} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
              <div style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 500, fontSize: 15, color: '#fff' }}>{s.titulo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 