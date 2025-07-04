import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import { Check, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionPlan } from '../types';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user, customUser, hasFreeTrial } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;

      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);

      await supabase
        .from('users')
        .update({
          subscription_plan: planId,
          subscription_expires_at: expirationDate.toISOString(),
        })
        .eq('id', user.id);

      alert('Assinatura realizada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Erro ao processar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff', py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            Escolha seu plano
          </Typography>
          <Typography variant="h6" sx={{ color: '#ccc', mb: 4 }}>
            Acesse milhares de filmes e séries, onde e quando quiser
          </Typography>

          {hasFreeTrial && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 4, 
                bgcolor: '#1976d2', 
                color: '#fff',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Você ainda tem acesso ao teste gratuito de 3 dias!
            </Alert>
          )}
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Default plans if no plans loaded */}
          {plans.length === 0 && [
            {
              id: 'basic',
              name: 'Básico',
              price: 19.90,
              features: ['HD disponível', '1 tela simultânea', 'Smartphones e tablets'],
              max_screens: 1,
              video_quality: 'HD',
            },
            {
              id: 'standard',
              name: 'Padrão',
              price: 27.90,
              features: ['Full HD disponível', '2 telas simultâneas', 'Smartphones, tablets e computadores'],
              max_screens: 2,
              video_quality: 'Full HD',
            },
            {
              id: 'premium',
              name: 'Premium',
              price: 37.90,
              features: ['4K + HDR disponível', '4 telas simultâneas', 'Todos os dispositivos', 'Conteúdo exclusivo'],
              max_screens: 4,
              video_quality: '4K',
            },
          ].map((plan, index) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  bgcolor: index === 1 ? '#e50914' : '#111',
                  color: '#fff',
                  height: '100%',
                  position: 'relative',
                  border: index === 1 ? '2px solid #ffd700' : '1px solid #333',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.3s',
                  }
                }}
              >
                {index === 1 && (
                  <Chip
                    label="MAIS POPULAR"
                    icon={<Star />}
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: '#ffd700',
                      color: '#000',
                      fontWeight: 'bold',
                    }}
                  />
                )}

                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {plan.name}
                  </Typography>

                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    R$ {plan.price.toFixed(2)}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#ccc', mb: 3 }}>
                    por mês
                  </Typography>

                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Check sx={{ color: '#4caf50', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      bgcolor: index === 1 ? '#ffd700' : '#e50914',
                      color: index === 1 ? '#000' : '#fff',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: index === 1 ? '#ffed4e' : '#b20710',
                      }
                    }}
                  >
                    {loading ? 'Processando...' : 'Assinar Agora'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Loaded plans from database */}
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  bgcolor: index === 1 ? '#e50914' : '#111',
                  color: '#fff',
                  height: '100%',
                  position: 'relative',
                  border: index === 1 ? '2px solid #ffd700' : '1px solid #333',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.3s',
                  }
                }}
              >
                {index === 1 && (
                  <Chip
                    label="MAIS POPULAR"
                    icon={<Star />}
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: '#ffd700',
                      color: '#000',
                      fontWeight: 'bold',
                    }}
                  />
                )}

                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {plan.name}
                  </Typography>

                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    R$ {plan.price.toFixed(2)}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#ccc', mb: 3 }}>
                    por mês
                  </Typography>

                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Check sx={{ color: '#4caf50', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      bgcolor: index === 1 ? '#ffd700' : '#e50914',
                      color: index === 1 ? '#000' : '#fff',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: index === 1 ? '#ffed4e' : '#b20710',
                      }
                    }}
                  >
                    {loading ? 'Processando...' : 'Assinar Agora'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Por que escolher o StreamFlix?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Sem compromisso
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Cancele quando quiser
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Assista onde quiser
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Em qualquer dispositivo
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Conteúdo original
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Produções exclusivas
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Teste gratuito
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  3 dias sem custos
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Subscription;