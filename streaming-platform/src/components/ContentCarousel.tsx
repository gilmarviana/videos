import React from 'react';
import { Box, Typography, Card, CardMedia, IconButton, LinearProgress } from '@mui/material';
import { PlayArrow, Lock } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

interface ContentItem {
  id: string;
  title: string;
  cover_image: string;
  type: 'movie' | 'series' | 'episode';
  progress?: number;
}

interface ContentCarouselProps {
  title: string;
  items: ContentItem[];
  canWatch: boolean;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ title, items, canWatch }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: ContentItem) => {
    if (canWatch) {
      if (item.type === 'movie') {
        navigate(`/watch/movie/${item.id}`);
      } else if (item.type === 'series') {
        navigate(`/series/${item.id}`);
      } else {
        navigate(`/watch/episode/${item.id}`);
      }
    } else {
      navigate('/subscription');
    }
  };

  if (items.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={16}
        slidesPerView="auto"
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1200: { slidesPerView: 6 },
          1536: { slidesPerView: 7 },
        }}
        style={{
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} style={{ width: 'auto' }}>
            <Card
              sx={{
                position: 'relative',
                bgcolor: '#111',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  '& .play-overlay': {
                    opacity: 1,
                  }
                },
                borderRadius: 2,
                overflow: 'hidden',
                width: 200,
                height: 280,
              }}
              onClick={() => handleItemClick(item)}
            >
              <CardMedia
                component="img"
                image={item.cover_image}
                alt={item.title}
                sx={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              
              {/* Progress bar for continue watching */}
              {item.progress !== undefined && (
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#e50914',
                    }
                  }}
                />
              )}

              {/* Play/Lock overlay */}
              <Box
                className="play-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <IconButton
                  sx={{
                    bgcolor: canWatch ? '#e50914' : '#666',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: canWatch ? '#b20710' : '#555',
                    },
                    width: 60,
                    height: 60,
                  }}
                >
                  {canWatch ? <PlayArrow sx={{ fontSize: 30 }} /> : <Lock sx={{ fontSize: 30 }} />}
                </IconButton>
              </Box>

              {/* Title overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: item.progress !== undefined ? 12 : 8,
                  left: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                  noWrap
                >
                  {item.title}
                </Typography>
              </Box>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default ContentCarousel;