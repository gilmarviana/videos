import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import { PlayArrow, Add, Info } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '../types';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isSubscribed, hasFreeTrial } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMovie(data);
    } catch (error) {
      console.error('Error loading movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const canWatch = isSubscribed || hasFreeTrial;

  const handleWatch = () => {
    if (canWatch) {
      window.location.href = `/watch/movie/${id}`;
    } else {
      window.location.href = '/subscription';
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#e50914' }} />
      </Box>
    );
  }

  if (!movie) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Typography variant="h5">Filme não encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff' }}>
      {/* Hero section */}
      <Box
        sx={{
          height: '100vh',
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%), url(${movie.cover_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: '50%', ml: 4 }}>
            {/* Type badge */}
            <Chip
              label="FILME"
              sx={{
                bgcolor: '#e50914',
                color: '#fff',
                fontWeight: 'bold',
                mb: 2,
              }}
            />

            {/* Exclusive badge */}
            {movie.is_exclusive && (
              <Chip
                label="EXCLUSIVO"
                sx={{
                  bgcolor: '#ffd700',
                  color: '#000',
                  fontWeight: 'bold',
                  ml: 1,
                  mb: 2,
                }}
              />
            )}

            {/* Title */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              }}
            >
              {movie.title}
            </Typography>

            {/* Release year and rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                {movie.release_year}
              </Typography>
              {movie.rating && (
                <Chip
                  label={movie.rating}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    mr: 2,
                  }}
                />
              )}
              <Typography variant="body1" sx={{ color: '#aaa', mr: 2 }}>
                {Math.floor(movie.duration / 60)} min
              </Typography>
              <Typography variant="body1" sx={{ color: '#aaa' }}>
                {movie.views_count.toLocaleString()} visualizações
              </Typography>
            </Box>

            {/* Genres */}
            <Box sx={{ mb: 3 }}>
              {movie.genres.slice(0, 3).map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  sx={{
                    mr: 1,
                    mb: 1,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    }
                  }}
                />
              ))}
            </Box>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                lineHeight: 1.6,
                maxWidth: '80%',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                fontSize: { xs: '0.9rem', md: '1.1rem' },
              }}
            >
              {movie.description}
            </Typography>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={canWatch ? <PlayArrow /> : <Add />}
                onClick={handleWatch}
                sx={{
                  bgcolor: canWatch ? '#fff' : '#e50914',
                  color: canWatch ? '#000' : '#fff',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: canWatch ? '#ddd' : '#b20710',
                  },
                  minWidth: 180,
                }}
              >
                {canWatch ? 'Assistir' : 'Assinar para assistir'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<Info />}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: '#fff',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                  minWidth: 150,
                }}
              >
                Mais Info
              </Button>
            </Box>

            {/* Additional info */}
            <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Detalhes do Filme
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" sx={{ color: '#ccc', minWidth: 120 }}>
                    Duração:
                  </Typography>
                  <Typography variant="body2">
                    {Math.floor(movie.duration / 60)} minutos
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" sx={{ color: '#ccc', minWidth: 120 }}>
                    Gêneros:
                  </Typography>
                  <Typography variant="body2">
                    {movie.genres.join(', ')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex' }}>
                  <Typography variant="body2" sx={{ color: '#ccc', minWidth: 120 }}>
                    Ano:
                  </Typography>
                  <Typography variant="body2">
                    {movie.release_year}
                  </Typography>
                </Box>
                
                {movie.rating && (
                  <Box sx={{ display: 'flex' }}>
                    <Typography variant="body2" sx={{ color: '#ccc', minWidth: 120 }}>
                      Classificação:
                    </Typography>
                    <Typography variant="body2">
                      {movie.rating}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Gradient overlay at bottom */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '20%',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
          }}
        />
      </Box>
    </Box>
  );
};

export default MovieDetail;