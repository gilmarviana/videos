-- Script para adicionar o campo is_trial à tabela subscriptions
-- Execute este script no SQL Editor do Supabase se a tabela já existir

-- Adicionar coluna is_trial
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;

-- Atualizar registros existentes para marcar como não-trial
UPDATE public.subscriptions 
SET is_trial = false 
WHERE is_trial IS NULL;

-- Comentário sobre a coluna
COMMENT ON COLUMN public.subscriptions.is_trial IS 'Indica se a assinatura é um período de teste gratuito'; 