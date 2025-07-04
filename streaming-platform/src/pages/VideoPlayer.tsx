import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Paper,
  Fade,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  SkipNext,
  SkipPrevious,
  Settings,
  Subtitles,
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Movie, Episode } from '../types';

interface VideoPlayerProps {
  type: 'movie' | 'episode';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState<Movie | Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [subtitles, setSubtitles] = useState(false);

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setPlaying(!playing);
          break;
        case 'ArrowLeft':
          seekTo(Math.max(0, played - 0.1));
          break;
        case 'ArrowRight':
          seekTo(Math.min(1, played + 0.1));
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          setMuted(!muted);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [playing, played, muted]);

  const loadContent = async () => {
    if (!id) return;

    try {
      let data;
      let error;

      if (type === 'movie') {
        ({ data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('id', id)
          .single());
      } else {
        ({ data, error } = await supabase
          .from('episodes')
          .select(`
            *,
            seasons(
              *,
              series(*)
            )
          `)
          .eq('id', id)
          .single());
      }

      if (error) throw error;

      setContent(data);
      
      // Track viewing
      await trackWatchHistory();
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoading(false);
    }
  };

  const trackWatchHistory = async () => {
    if (!user || !content || !id) return;

    try {
      await supabase.from('watch_history').upsert({
        user_id: user.id,
        content_id: id,
        content_type: type,
        watch_time: 0,
        total_duration: 0,
        last_watched_at: new Date().toISOString(),
        completed: false,
      });
    } catch (error) {
      console.error('Error tracking watch history:', error);
    }
  };

  const updateWatchProgress = async (currentTime: number, totalDuration: number) => {
    if (!user || !content || !id) return;

    try {
      const completed = currentTime / totalDuration > 0.9;
      
      await supabase.from('watch_history').upsert({
        user_id: user.id,
        content_id: id,
        content_type: type,
        watch_time: currentTime,
        total_duration: totalDuration,
        last_watched_at: new Date().toISOString(),
        completed,
      });

      // Increment view count if 80% watched
      if (currentTime / totalDuration > 0.8) {
        if (type === 'movie') {
          await supabase
            .from('movies')
            .update({ views_count: content.views_count + 1 })
            .eq('id', id);
        } else {
          await supabase
            .from('episodes')
            .update({ views_count: content.views_count + 1 })
            .eq('id', id);
        }
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  const handleProgress = (state: any) => {
    if (!seeking) {
      setPlayed(state.played);
      updateWatchProgress(state.playedSeconds, duration);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const seekTo = (value: number) => {
    setPlayed(value);
    playerRef.current?.seekTo(value, 'fraction');
  };

  const handleSeekChange = (event: Event, newValue: number | number[]) => {
    setPlayed(newValue as number);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (event: Event, newValue: number | number[]) => {
    setSeeking(false);
    seekTo(newValue as number);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoUrl = (url: string) => {
    // Handle different video sources
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return url;
    }
    if (url.includes('drive.google.com')) {
      // Convert Google Drive sharing URL to direct video URL
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      return fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : url;
    }
    if (url.includes('onedrive.live.com')) {
      // Handle OneDrive URLs
      return url.replace('redir', 'embed');
    }
    // Direct file URLs (MP4, MKV, TS)
    return url;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          bgcolor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#e50914' }} />
      </Box>
    );
  }

  if (!content) {
    return (
      <Box
        sx={{
          height: '100vh',
          bgcolor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Typography variant="h5">Conteúdo não encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height: '100vh',
        bgcolor: '#000',
        color: '#fff',
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
    >
      <ReactPlayer
        ref={playerRef}
        url={getVideoUrl(content.video_url)}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={() => setPlaying(false)}
        config={{
          youtube: {
            playerVars: {
              showinfo: 0,
              controls: 0,
              modestbranding: 1,
            }
          },
          file: {
            attributes: {
              crossOrigin: 'anonymous',
            }
          }
        }}
      />

      {/* Controls overlay */}
      <Fade in={showControls || !playing}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          {/* Top bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {content.title}
              </Typography>
              {'seasons' in content && (
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  {content.seasons?.series?.title} - T{content.seasons?.season_number}E{content.episode_number}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(e.target.value as number)}
                  sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                >
                  <MenuItem value={0.5}>0.5x</MenuItem>
                  <MenuItem value={0.75}>0.75x</MenuItem>
                  <MenuItem value={1}>1x</MenuItem>
                  <MenuItem value={1.25}>1.25x</MenuItem>
                  <MenuItem value={1.5}>1.5x</MenuItem>
                  <MenuItem value={2}>2x</MenuItem>
                </Select>
              </FormControl>
              
              <IconButton onClick={() => setSubtitles(!subtitles)} sx={{ color: '#fff' }}>
                <Subtitles />
              </IconButton>
              
              <IconButton sx={{ color: '#fff' }}>
                <Settings />
              </IconButton>
            </Box>
          </Box>

          {/* Bottom controls */}
          <Box>
            {/* Progress bar */}
            <Box sx={{ mb: 2 }}>
              <Slider
                value={played}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onChangeCommitted={handleSeekMouseUp}
                step={0.001}
                min={0}
                max={1}
                sx={{
                  color: '#e50914',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                  '& .MuiSlider-track': {
                    height: 6,
                  },
                  '& .MuiSlider-rail': {
                    height: 6,
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                }}
              />
            </Box>

            {/* Control buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => setPlaying(!playing)} sx={{ color: '#fff' }}>
                  {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                
                <IconButton sx={{ color: '#fff' }}>
                  <SkipPrevious />
                </IconButton>
                
                <IconButton sx={{ color: '#fff' }}>
                  <SkipNext />
                </IconButton>
                
                <IconButton onClick={() => setMuted(!muted)} sx={{ color: '#fff' }}>
                  {muted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
                
                <Slider
                  value={muted ? 0 : volume}
                  onChange={(e, value) => setVolume(value as number)}
                  step={0.01}
                  min={0}
                  max={1}
                  sx={{
                    width: 100,
                    color: '#fff',
                    '& .MuiSlider-thumb': {
                      width: 12,
                      height: 12,
                    },
                  }}
                />
                
                <Typography variant="body2" sx={{ ml: 2, minWidth: 100 }}>
                  {formatTime(played * duration)} / {formatTime(duration)}
                </Typography>
              </Box>
              
              <IconButton onClick={toggleFullscreen} sx={{ color: '#fff' }}>
                {fullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Click to play/pause */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setPlaying(!playing)}
      >
        {!playing && (
          <Fade in={!playing}>
            <IconButton
              sx={{
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.5)',
                width: 80,
                height: 80,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              <PlayArrow sx={{ fontSize: 40 }} />
            </IconButton>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default VideoPlayer;