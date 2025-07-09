import React, { useState } from 'react';

const categoriasExemplo = [
  'FILMES | LANÇAMENTOS CINEMA',
  'FILMES | AÇÃO',
  'FILMES | ANIMES',
  'FILMES | AVENTURA',
  'FILMES | CRIME',
  'FILMES | BIOGRAFIA',
  'FILMES | COLETÂNEAS ESPECIAIS',
  'FILMES | COMÉDIA',
  'FILMES | COMÉDIA ROMANTICA',
  'FILMES | DRAMA',
  'FILMES | DOCUMENTÁRIOS',
  'FILMES | FAROESTE',
  'FILMES | FICÇÃO E FANTASIA',
  'FILMES | GOSPEL MUSIC',
  'FILMES | GUERRA',
  'FILMES | HERÓIS',
  'FILMES | INFANTIS',
  'FILMES | MISTÉRIO',
  'FILMES | NACIONAL',
  'FILMES | POLICIAL',
];

const filmesExemplo = [
  { titulo: 'Inferno na montanha', capa: 'https://image.tmdb.org/t/p/w300/8QVDXDiOGHRcAD4oM6MXjE0osSj.jpg', categoria: 0 },
  { titulo: 'Como Treinar o Seu Dragão [CAM]', capa: 'https://image.tmdb.org/t/p/w300/ygO9lowFMXWymATCrhoQXd6gCEh.jpg', categoria: 0 },
  { titulo: '15 Anos em Silêncio', capa: 'https://image.tmdb.org/t/p/w300/6b7swg6DLqXCO3XUsMnv6RwDMW2.jpg', categoria: 0 },
  { titulo: 'Verdades Dolorosas', capa: 'https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg', categoria: 0 },
  { titulo: 'The Old Guard 2', capa: 'https://image.tmdb.org/t/p/w300/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg', categoria: 0 },
  { titulo: 'O Esquema Fenício', capa: 'https://image.tmdb.org/t/p/w300/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', categoria: 0 },
  { titulo: 'Desastre Total: A Seita da American Apparel', capa: 'https://image.tmdb.org/t/p/w300/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', categoria: 0 },
  { titulo: 'O Inimigo Está Por Perto', capa: 'https://image.tmdb.org/t/p/w300/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg', categoria: 0 },
  { titulo: 'Hurry Up Tomorrow: Além dos Holofotes', capa: 'https://image.tmdb.org/t/p/w300/6b7swg6DLqXCO3XUsMnv6RwDMW2.jpg', categoria: 0 },
  { titulo: 'Encantadora de Tubarões', capa: 'https://image.tmdb.org/t/p/w300/ygO9lowFMXWymATCrhoQXd6gCEh.jpg', categoria: 0 },
  { titulo: 'Dora e a Busca pela Cidade de Ouro', capa: 'https://image.tmdb.org/t/p/w300/8QVDXDiOGHRcAD4oM6MXjE0osSj.jpg', categoria: 0 },
  { titulo: 'Matadores De Aliens Do Espaço Sideral', capa: 'https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg', categoria: 0 },
  { titulo: 'Melhores Amigos', capa: 'https://image.tmdb.org/t/p/w300/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', categoria: 0 },
  { titulo: 'O palhaço no milharal', capa: 'https://image.tmdb.org/t/p/w300/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg', categoria: 0 },
  { titulo: 'Os Conflitos na Irlanda', capa: 'https://image.tmdb.org/t/p/w300/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg', categoria: 0 },
  { titulo: 'Vale das Sombras', capa: 'https://image.tmdb.org/t/p/w300/ygO9lowFMXWymATCrhoQXd6gCEh.jpg', categoria: 0 },
  { titulo: 'Bailarina - Do Universo de John Wick', capa: 'https://image.tmdb.org/t/p/w300/8QVDXDiOGHRcAD4oM6MXjE0osSj.jpg', categoria: 0 },
  { titulo: 'Chefes de Estado', capa: 'https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg', categoria: 0 },
  { titulo: 'Noivo à Indiana', capa: 'https://image.tmdb.org/t/p/w300/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', categoria: 0 },
  { titulo: 'Crime e Sentença', capa: 'https://image.tmdb.org/t/p/w300/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg', categoria: 0 },
  { titulo: 'Criatura Voraz', capa: 'https://image.tmdb.org/t/p/w300/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg', categoria: 0 },
  { titulo: 'Bela', capa: 'https://image.tmdb.org/t/p/w300/ygO9lowFMXWymATCrhoQXd6gCEh.jpg', categoria: 0 },
  { titulo: 'A Obsessão de Celine', capa: 'https://image.tmdb.org/t/p/w300/8QVDXDiOGHRcAD4oM6MXjE0osSj.jpg', categoria: 0 },
  { titulo: 'A Era de Kasym', capa: 'https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg', categoria: 0 },
  { titulo: 'Uma Vida Sem Roteiro', capa: 'https://image.tmdb.org/t/p/w300/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', categoria: 0 },
  // ...adicione mais filmes se quiser
];

export default function Filmes() {
  const [categoriaIdx, setCategoriaIdx] = useState(0);
  const filmes = filmesExemplo.filter(f => f.categoria === categoriaIdx);

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
      {/* Grid de filmes */}
      <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24 }}>
          {filmes.map((f, idx) => (
            <div key={idx} style={{ background: '#23232a', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={f.capa} alt={f.titulo} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
              <div style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 500, fontSize: 15, color: '#fff' }}>{f.titulo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 