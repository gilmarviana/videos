import React, { useState } from 'react';
import ReactPlayer from 'react-player';

export default function MeuPlayer() {
  const [url, setUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#18181c', padding: 20, borderRadius: 10 }}>
      <h2 style={{ color: '#fff' }}>Player HLS com React Player</h2>
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Cole a URL .m3u8 aqui"
        style={{ width: '100%', marginBottom: 20, padding: 8, borderRadius: 4 }}
      />
      <ReactPlayer
        url={url}
        controls
        playing
        width="100%"
        height="360px"
        style={{ background: '#000' }}
      />
    </div>
  );
} 