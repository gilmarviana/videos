import React, { useState } from 'react';

const categoriasExemplo = [
  {
    nome: 'FILMES | SÉRIES',
    canais: [
      { nome: 'Assassinato no Expresso do Oriente', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { nome: 'Meu Filho', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { nome: 'Amor Sob Suspeita', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { nome: 'Na Trilha do Perigo', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { nome: 'A Melhor Cartada', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    ]
  },
  {
    nome: 'CANAIS | ESPORTES',
    canais: [
      { nome: 'UFC TV 01', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { nome: 'ESPN', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    ]
  }
];

const epgExemplo = [
  { hora: '15:40 - 17:5', titulo: 'Copa do Mundo de Clubes da Fifa' },
  { hora: '17:5 - 18:5', titulo: 'Boletim DF2' },
  { hora: '18:5 - 18:40', titulo: 'Vale a Pena Ver de Novo - A Viagem' },
  { hora: '18:40 - 19:25', titulo: 'Êta Mundo Melhor!' },
  { hora: '19:25 - 19:50', titulo: 'DF2' },
];

export default function Canais() {
  const [categoriaIdx, setCategoriaIdx] = useState(0);
  const [canalIdx, setCanalIdx] = useState(0);
  const categoria = categoriasExemplo[categoriaIdx];
  const canal = categoria.canais[canalIdx];

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
              key={cat.nome}
              onClick={() => { setCategoriaIdx(idx); setCanalIdx(0); }}
              style={{
                padding: '10px 18px',
                color: idx === categoriaIdx ? '#fff' : '#bbb',
                background: idx === categoriaIdx ? '#292933' : 'none',
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                marginBottom: 2
              }}
            >
              {cat.nome}
            </li>
          ))}
        </ul>
      </div>
      {/* Lista de canais */}
      <div style={{ width: 270, background: '#23232a', padding: '18px 0', borderRight: '1px solid #23232a', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categoria.canais.map((c, idx) => (
            <li
              key={c.nome}
              onClick={() => setCanalIdx(idx)}
              style={{
                display: 'flex', alignItems: 'center', padding: '10px 12px', color: idx === canalIdx ? '#fff' : '#bbb',
                background: idx === canalIdx ? '#292933' : 'none', borderRadius: 6, cursor: 'pointer', marginBottom: 2
              }}
            >
              <span style={{ width: 28, height: 28, display: 'inline-block', background: '#fff1', borderRadius: 4, textAlign: 'center', lineHeight: '28px', marginRight: 10, color: '#fff', fontWeight: 'bold' }}>{c.nome.charAt(0)}</span>
              {c.nome}
            </li>
          ))}
        </ul>
      </div>
      {/* Player e EPG */}
      <div style={{ flex: 1, background: '#18181c', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 800, background: '#000', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ 
            width: '100%', 
            height: '340px', 
            background: '#000', 
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px'
          }}>
            Clique para reproduzir
          </div>
        </div>
        <div style={{ color: '#fff', marginBottom: 18, fontSize: 18, fontWeight: 500 }}>{canal.nome}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', maxWidth: 800 }}>
          {epgExemplo.map((epg, idx) => (
            <li key={idx} style={{ color: '#b6b6d6', padding: '7px 0', borderBottom: '1px solid #23232a', fontSize: 16 }}>
              <strong style={{ color: '#fff' }}>{epg.hora}</strong> | {epg.titulo}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 