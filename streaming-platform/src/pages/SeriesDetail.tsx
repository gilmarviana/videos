import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from '@mui/material';
import { PlayArrow, Add } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Series } from '../types';

const SeriesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isSubscribed, hasFreeTrial } = useAuth();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeries();
  }, [id]);

  const loadSeries = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('series')
        .select(`
          *,
          seasons(
            *,
            episodes(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setSeries(data);
    } catch (error) {
      console.error('Error loading series:', error);
    } finally {
      setLoading(false);
    }
  };

  const canWatch = isSubscribed || hasFreeTrial;

  if (loading) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#e50914' }} />
      </Box>
    );
  }

  if (!series) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Typography variant="h5">Série não encontrada</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff' }}>
      {/* Hero section */}
      <Box
        sx={{
          height: '60vh',
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%), url(${series.cover_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          p: 4,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            {series.title}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, color: '#ccc' }}>
            {series.release_year} • {series.genres.join(', ')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '60%' }}>
            {series.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={canWatch ? <PlayArrow /> : <Add />}
              sx={{
                bgcolor: canWatch ? '#fff' : '#e50914',
                color: canWatch ? '#000' : '#fff',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  bgcolor: canWatch ? '#ddd' : '#b20710',
                },
              }}
            >
              {canWatch ? 'Assistir' : 'Assinar para assistir'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Seasons and episodes */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Temporadas e Episódios
        </Typography>

        {series.seasons?.map((season) => (
          <Box key={season.id} sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Temporada {season.season_number}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {season.episodes?.map((episode) => (
                <Card
                  key={episode.id}
                  sx={{
                    bgcolor: '#111',
                    color: '#fff',
                    cursor: canWatch ? 'pointer' : 'default',
                    '&:hover': canWatch ? {
                      bgcolor: '#222',
                      transform: 'scale(1.02)',
                      transition: 'all 0.3s',
                    } : {},
                  }}
                  onClick={() => {
                    if (canWatch) {
                      window.location.href = `/watch/episode/${episode.id}`;
                    }
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                    <Typography variant="h6" sx={{ mr: 3, minWidth: 60 }}>
                      {episode.episode_number}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {episode.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ccc' }}>
                        {episode.description}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>
                        {Math.floor(episode.duration / 60)} min • {episode.views_count} visualizações
                      </Typography>
                    </Box>
                    {canWatch && (
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        sx={{
                          bgcolor: '#e50914',
                          '&:hover': { bgcolor: '#b20710' },
                        }}
                      >
                        Assistir
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default SeriesDetail;