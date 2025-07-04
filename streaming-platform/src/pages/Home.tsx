import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Fab,
} from '@mui/material';
import { Search, PlayArrow, Add } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Movie, Series } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ContentCarousel from '../components/ContentCarousel';
import FeaturedContent from '../components/FeaturedContent';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home: React.FC = () => {
  const { user, isSubscribed, hasFreeTrial } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [featuredContent, setFeaturedContent] = useState<Movie | Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
    if (user) {
      loadContinueWatching();
    }
  }, [user]);

  const loadContent = async () => {
    try {
      // Load movies
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (moviesError) throw moviesError;

      // Load series
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select(`
          *,
          seasons(
            *,
            episodes(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (seriesError) throw seriesError;

      setMovies(moviesData || []);
      setSeries(seriesData || []);

      // Set featured content (most recent exclusive)
      const allContent = [...(moviesData || []), ...(seriesData || [])];
      const exclusiveContent = allContent.filter(content => content.is_exclusive);
      if (exclusiveContent.length > 0) {
        setFeaturedContent(exclusiveContent[0]);
      } else if (allContent.length > 0) {
        setFeaturedContent(allContent[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoading(false);
    }
  };

  const loadContinueWatching = async () => {
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select(`
          *,
          movies(*),
          episodes(*, seasons(*, series(*)))
        `)
        .eq('user_id', user?.id)
        .eq('completed', false)
        .order('last_watched_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setContinueWatching(data || []);
    } catch (error) {
      console.error('Error loading continue watching:', error);
    }
  };

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSeries = series.filter(show =>
    show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canWatchContent = isSubscribed || hasFreeTrial;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff' }}>
      {/* Hero Section */}
      {featuredContent && (
        <FeaturedContent 
          content={featuredContent} 
          canWatch={canWatchContent}
        />
      )}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Busque por filmes, séries ou gêneros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#fff' }} />
                </InputAdornment>
              ),
              sx: {
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e50914',
                },
              }
            }}
          />
        </Box>

        {/* Access Status Banner */}
        {!canWatchContent && (
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            bgcolor: '#e50914', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Teste grátis por 3 dias!
            </Typography>
            <Typography variant="body2">
              Acesse todo nosso catálogo sem custo por 3 dias
            </Typography>
          </Box>
        )}

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <ContentCarousel
            title="Continuar Assistindo"
            items={continueWatching.map(item => ({
              id: item.content_type === 'movie' ? item.movies.id : item.episodes.id,
              title: item.content_type === 'movie' ? item.movies.title : item.episodes.title,
              cover_image: item.content_type === 'movie' 
                ? item.movies.cover_image 
                : item.episodes.seasons.series.cover_image,
              type: item.content_type,
              progress: (item.watch_time / item.total_duration) * 100,
            }))}
            canWatch={canWatchContent}
          />
        )}

        {/* New Releases */}
        <ContentCarousel
          title="Lançamentos"
          items={[...movies, ...series]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 20)
            .map(item => ({
              id: item.id,
              title: item.title,
              cover_image: item.cover_image,
              type: 'seasons' in item ? 'series' : 'movie',
            }))}
          canWatch={canWatchContent}
        />

        {/* Popular Movies */}
        <ContentCarousel
          title="Filmes Populares"
          items={movies
            .sort((a, b) => b.views_count - a.views_count)
            .slice(0, 20)
            .map(movie => ({
              id: movie.id,
              title: movie.title,
              cover_image: movie.cover_image,
              type: 'movie',
            }))}
          canWatch={canWatchContent}
        />

        {/* Popular Series */}
        <ContentCarousel
          title="Séries Populares"
          items={series
            .sort((a, b) => b.views_count - a.views_count)
            .slice(0, 20)
            .map(show => ({
              id: show.id,
              title: show.title,
              cover_image: show.cover_image,
              type: 'series',
            }))}
          canWatch={canWatchContent}
        />

        {/* Exclusive Content */}
        <ContentCarousel
          title="Conteúdo Exclusivo"
          items={[...movies, ...series]
            .filter(item => item.is_exclusive)
            .map(item => ({
              id: item.id,
              title: item.title,
              cover_image: item.cover_image,
              type: 'seasons' in item ? 'series' : 'movie',
            }))}
          canWatch={canWatchContent}
        />

        {/* Search Results */}
        {searchTerm && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Resultados da busca por "{searchTerm}"
            </Typography>
            
            <Grid container spacing={3}>
              {[...filteredMovies, ...filteredSeries].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={item.id}>
                  <Card 
                    sx={{ 
                      bgcolor: '#111', 
                      color: '#fff',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s',
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="300"
                      image={item.cover_image}
                      alt={item.title}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="#aaa">
                        {item.release_year}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {item.genres.slice(0, 2).map((genre) => (
                          <Chip
                            key={genre}
                            label={genre}
                            size="small"
                            sx={{ 
                              mr: 1, 
                              bgcolor: '#333', 
                              color: '#fff',
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;