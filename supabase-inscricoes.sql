-- Script para criar a tabela de inscrições no Supabase
-- Execute no editor SQL do Supabase ou via psql conectado ao seu projeto.

create table if not exists public.inscricoes (
  id bigserial primary key,
  nome text not null,
  data_nascimento date not null,
  idade integer not null,
  telefone text not null,
  participacao_confirmada boolean not null default false,
  payment_method text not null,
  termos_aceitos boolean not null default false,
  submitted_at timestamptz not null default now()
);

-- Habilita Row Level Security (RLS) para proteger a tabela.
-- DESABILITAR RLS: se houver problemas com políticas, desabilite com:
alter table public.inscricoes disable row level security;

-- Abaixo estão as políticas (mantidas como referência, mas não serão usadas)
-- Se precisar reabilitar RLS no futuro, descomente a linha abaixo e comente a linha "disable"
-- alter table public.inscricoes enable row level security;

-- Remove todas as políticas antigas
drop policy if exists "Allow anonymous inserts" on public.inscricoes;
drop policy if exists "Allow authenticated selects" on public.inscricoes;
drop policy if exists "Allow authenticated inserts" on public.inscricoes;
drop policy if exists "Allow inserts from form" on public.inscricoes;
drop policy if exists "Enable insert for all" on public.inscricoes;
drop policy if exists "Enable read for authenticated users" on public.inscricoes;

-- Caso você queira reabilitar RLS no futuro, descomente as políticas abaixo
-- create policy "Enable insert for all" on public.inscricoes
--   for insert
--   with check (true);
--
-- create policy "Enable read for authenticated users" on public.inscricoes
--   for select
--   using (auth.role() = 'authenticated');
