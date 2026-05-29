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
alter table public.inscricoes enable row level security;

-- Permite inserção anônima do formulário da página.
create policy "Allow anonymous inserts" on public.inscricoes
  for insert
  with check (auth.role() = 'anon');

-- Permite seleção apenas para usuários autenticados no Admin.
create policy "Allow authenticated selects" on public.inscricoes
  for select
  using (auth.role() = 'authenticated');

-- Permite inserção também para usuários autenticados, caso haja necessidade.
create policy "Allow authenticated inserts" on public.inscricoes
  for insert
  with check (auth.role() = 'authenticated');

-- Opcional: se quiser que admins vejam as inscrições no painel sem restrição,
-- mantenha as políticas acima e configure os usuários corretamente.
