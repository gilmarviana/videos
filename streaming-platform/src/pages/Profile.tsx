import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import { Person, Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Profile: React.FC = () => {
  const { user, customUser, isSubscribed, hasFreeTrial } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(customUser?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      setMessage('Perfil atualizado com sucesso!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(customUser?.name || '');
    setEditing(false);
  };

  const getSubscriptionStatus = () => {
    if (isSubscribed) return 'Ativo';
    if (hasFreeTrial) return 'Teste Gratuito';
    return 'Inativo';
  };

  const getSubscriptionColor = () => {
    if (isSubscribed) return '#4caf50';
    if (hasFreeTrial) return '#ffd700';
    return '#f44336';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff', py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          Meu Perfil
        </Typography>

        {message && (
          <Alert 
            severity={message.includes('sucesso') ? 'success' : 'error'} 
            sx={{ mb: 3, bgcolor: message.includes('sucesso') ? '#4caf50' : '#f44336', color: '#fff' }}
          >
            {message}
          </Alert>
        )}

        <Card sx={{ bgcolor: '#111', color: '#fff', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#e50914', 
                  mr: 3,
                  fontSize: '2rem'
                }}
              >
                {customUser?.name?.charAt(0) || <Person />}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {customUser?.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#ccc' }}>
                  {customUser?.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getSubscriptionColor(),
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: getSubscriptionColor() }}>
                    Assinatura: {getSubscriptionStatus()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ bgcolor: '#333', mb: 4 }} />

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Informações Pessoais
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                Nome
              </Typography>
              {editing ? (
                <TextField
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: '#fff',
                      bgcolor: '#222',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#444',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#666',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e50914',
                    },
                  }}
                />
              ) : (
                <Typography variant="body1">{customUser?.name}</Typography>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                Email
              </Typography>
              <Typography variant="body1">{customUser?.email}</Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                Membro desde
              </Typography>
              <Typography variant="body1">
                {customUser?.created_at 
                  ? new Date(customUser.created_at).toLocaleDateString('pt-BR')
                  : 'N/A'
                }
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {editing ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<Cancel />}
                    sx={{
                      borderColor: '#666',
                      color: '#fff',
                      '&:hover': {
                        borderColor: '#888',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={<Save />}
                    sx={{
                      bgcolor: '#e50914',
                      '&:hover': { bgcolor: '#b20710' }
                    }}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setEditing(true)}
                  startIcon={<Edit />}
                  sx={{
                    bgcolor: '#e50914',
                    '&:hover': { bgcolor: '#b20710' }
                  }}
                >
                  Editar Perfil
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Subscription info */}
        <Card sx={{ bgcolor: '#111', color: '#fff' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Assinatura
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                Status
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ color: getSubscriptionColor(), fontWeight: 'bold' }}
              >
                {getSubscriptionStatus()}
              </Typography>
            </Box>

            {customUser?.subscription_expires_at && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                  Válida até
                </Typography>
                <Typography variant="body1">
                  {new Date(customUser.subscription_expires_at).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            )}

            {customUser?.free_trial_expires_at && hasFreeTrial && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#ccc' }}>
                  Teste gratuito até
                </Typography>
                <Typography variant="body1" sx={{ color: '#ffd700' }}>
                  {new Date(customUser.free_trial_expires_at).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            )}

            {!isSubscribed && (
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.href = '/subscription'}
                sx={{
                  mt: 2,
                  bgcolor: '#e50914',
                  '&:hover': { bgcolor: '#b20710' }
                }}
              >
                Assinar Agora
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Profile;