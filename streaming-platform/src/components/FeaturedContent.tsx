import React from 'react';
import { Box, Typography, Button, Chip, Container } from '@mui/material';
import { PlayArrow, Add, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Movie, Series } from '../types';

interface FeaturedContentProps {
  content: Movie | Series;
  canWatch: boolean;
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({ content, canWatch }) => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    if (canWatch) {
      if ('seasons' in content) {
        // It's a series, navigate to first episode
        navigate(`/series/${content.id}`);
      } else {
        // It's a movie
        navigate(`/watch/movie/${content.id}`);
      }
    } else {
      navigate('/subscription');
    }
  };

  const handleInfoClick = () => {
    if ('seasons' in content) {
      navigate(`/series/${content.id}`);
    } else {
      navigate(`/movie/${content.id}`);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%), url(${content.cover_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: '#fff',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ maxWidth: '50%', ml: 4 }}>
          {/* Content type badge */}
          <Chip
            label={'seasons' in content ? 'SÉRIE' : 'FILME'}
            sx={{
              bgcolor: '#e50914',
              color: '#fff',
              fontWeight: 'bold',
              mb: 2,
            }}
          />

          {/* Exclusive badge */}
          {content.is_exclusive && (
            <Chip
              label="EXCLUSIVO"
              sx={{
                bgcolor: '#gold',
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
            {content.title}
          </Typography>

          {/* Release year and rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              {content.release_year}
            </Typography>
            {content.rating && (
              <Chip
                label={content.rating}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  mr: 2,
                }}
              />
            )}
            <Typography variant="body1" sx={{ color: '#aaa' }}>
              {content.views_count.toLocaleString()} visualizações
            </Typography>
          </Box>

          {/* Genres */}
          <Box sx={{ mb: 3 }}>
            {content.genres.slice(0, 3).map((genre, index) => (
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
            {content.description}
          </Typography>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={canWatch ? <PlayArrow /> : <Add />}
              onClick={handlePlayClick}
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
              onClick={handleInfoClick}
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
  );
};

export default FeaturedContent;