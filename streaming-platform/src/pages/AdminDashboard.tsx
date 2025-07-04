import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, TrendingUp, People, Movie, Tv } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [message, setMessage] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [genres, setGenres] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [duration, setDuration] = useState('');
  const [isExclusive, setIsExclusive] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load movies
      const { data: moviesData } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      // Load series
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false });

      // Load users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      setMovies(moviesData || []);
      setSeries(seriesData || []);
      setUsers(usersData || []);

      // Calculate analytics
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(user => 
        user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date()
      ).length || 0;
      
      setAnalytics({
        totalUsers,
        activeUsers,
        totalMovies: moviesData?.length || 0,
        totalSeries: seriesData?.length || 0,
      });

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title || '');
      setDescription(item.description || '');
      setCoverImage(item.cover_image || '');
      setVideoUrl(item.video_url || '');
      setGenres(item.genres?.join(', ') || '');
      setReleaseYear(item.release_year?.toString() || '');
      setDuration(item.duration?.toString() || '');
      setIsExclusive(item.is_exclusive || false);
    } else {
      setEditingItem(null);
      setTitle('');
      setDescription('');
      setCoverImage('');
      setVideoUrl('');
      setGenres('');
      setReleaseYear('');
      setDuration('');
      setIsExclusive(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        title,
        description,
        cover_image: coverImage,
        video_url: videoUrl,
        genres: genres.split(',').map(g => g.trim()),
        release_year: parseInt(releaseYear),
        duration: parseInt(duration),
        is_exclusive: isExclusive,
        views_count: 0,
      };

      const table = tabValue === 1 ? 'movies' : 'series';

      if (editingItem) {
        await supabase
          .from(table)
          .update(data)
          .eq('id', editingItem.id);
        setMessage('Item atualizado com sucesso!');
      } else {
        await supabase
          .from(table)
          .insert([data]);
        setMessage('Item adicionado com sucesso!');
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      setMessage('Erro ao salvar item');
    }
  };

  const handleDelete = async (id: string, table: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await supabase
          .from(table)
          .delete()
          .eq('id', id);
        
        setMessage('Item excluído com sucesso!');
        loadData();
      } catch (error) {
        console.error('Error deleting item:', error);
        setMessage('Erro ao excluir item');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
          Painel de Administração
        </Typography>

        {message && (
          <Alert 
            severity={message.includes('sucesso') ? 'success' : 'error'} 
            sx={{ mb: 3, bgcolor: message.includes('sucesso') ? '#4caf50' : '#f44336', color: '#fff' }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        {/* Analytics Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ bgcolor: '#111', color: '#fff', minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ mr: 1, color: '#e50914' }} />
                <Typography variant="h6">Usuários Totais</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {analytics.totalUsers}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#111', color: '#fff', minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="h6">Assinantes Ativos</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {analytics.activeUsers}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#111', color: '#fff', minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Movie sx={{ mr: 1, color: '#ffd700' }} />
                <Typography variant="h6">Filmes</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {analytics.totalMovies}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#111', color: '#fff', minWidth: 200 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tv sx={{ mr: 1, color: '#2196f3' }} />
                <Typography variant="h6">Séries</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {analytics.totalSeries}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: '#333' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { color: '#ccc', fontWeight: 'bold' },
              '& .Mui-selected': { color: '#e50914 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#e50914' },
            }}
          >
            <Tab label="Usuários" />
            <Tab label="Filmes" />
            <Tab label="Séries" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} sx={{ bgcolor: '#111' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Data de Cadastro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell sx={{ color: '#fff' }}>{user.name}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date()
                            ? 'Ativo'
                            : user.free_trial_expires_at && new Date(user.free_trial_expires_at) > new Date()
                            ? 'Teste Gratuito'
                            : 'Inativo'
                        }
                        size="small"
                        sx={{
                          bgcolor: user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date()
                            ? '#4caf50'
                            : user.free_trial_expires_at && new Date(user.free_trial_expires_at) > new Date()
                            ? '#ffd700'
                            : '#f44336',
                          color: '#fff',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Movies Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Gerenciar Filmes
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b20710' } }}
            >
              Adicionar Filme
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: '#111' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Título</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Ano</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Visualizações</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Exclusivo</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell sx={{ color: '#fff' }}>{movie.title}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{movie.release_year}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{movie.views_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={movie.is_exclusive ? 'Sim' : 'Não'}
                        size="small"
                        sx={{
                          bgcolor: movie.is_exclusive ? '#ffd700' : '#666',
                          color: movie.is_exclusive ? '#000' : '#fff',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenDialog(movie)}
                        sx={{ color: '#fff', mr: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(movie.id, 'movies')}
                        sx={{ color: '#f44336' }}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Series Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Gerenciar Séries
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b20710' } }}
            >
              Adicionar Série
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: '#111' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Título</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Ano</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Visualizações</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Exclusivo</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {series.map((show) => (
                  <TableRow key={show.id}>
                    <TableCell sx={{ color: '#fff' }}>{show.title}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{show.release_year}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{show.views_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={show.is_exclusive ? 'Sim' : 'Não'}
                        size="small"
                        sx={{
                          bgcolor: show.is_exclusive ? '#ffd700' : '#666',
                          color: show.is_exclusive ? '#000' : '#fff',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenDialog(show)}
                        sx={{ color: '#fff', mr: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(show.id, 'series')}
                        sx={{ color: '#f44336' }}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Analytics e Relatórios
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ bgcolor: '#111', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Resumo da Plataforma
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>Total de usuários cadastrados: {analytics.totalUsers}</Typography>
                  <Typography>Usuários com assinatura ativa: {analytics.activeUsers}</Typography>
                  <Typography>Taxa de conversão: {analytics.totalUsers > 0 ? ((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1) : 0}%</Typography>
                  <Typography>Total de filmes: {analytics.totalMovies}</Typography>
                  <Typography>Total de séries: {analytics.totalSeries}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { bgcolor: '#111', color: '#fff' }
          }}
        >
          <DialogTitle>
            {editingItem ? 'Editar' : 'Adicionar'} {tabValue === 1 ? 'Filme' : 'Série'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#e50914' },
                  },
                }}
              />
              <TextField
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#e50914' },
                  },
                }}
              />
              <TextField
                label="URL da Capa"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#e50914' },
                  },
                }}
              />
              <TextField
                label="URL do Vídeo"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#e50914' },
                  },
                }}
              />
              <TextField
                label="Gêneros (separados por vírgula)"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#e50914' },
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Ano de Lançamento"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  type="number"
                  sx={{
                    flexGrow: 1,
                    '& .MuiInputLabel-root': { color: '#ccc' },
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#555' },
                      '&.Mui-focused fieldset': { borderColor: '#e50914' },
                    },
                  }}
                />
                {tabValue === 1 && (
                  <TextField
                    label="Duração (minutos)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    type="number"
                    sx={{
                      flexGrow: 1,
                      '& .MuiInputLabel-root': { color: '#ccc' },
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#555' },
                        '&.Mui-focused fieldset': { borderColor: '#e50914' },
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: '#ccc' }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b20710' } }}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;