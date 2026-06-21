import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidSupabaseUrl = (value) => {
  if (!value) return false

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}

const missingFields = []

if (!supabaseUrl) missingFields.push('VITE_SUPABASE_URL')
if (!supabaseAnonKey) missingFields.push('VITE_SUPABASE_ANON_KEY')

const supabaseUrlIsValid = isValidSupabaseUrl(supabaseUrl)
const supabaseConfigured = missingFields.length === 0 && supabaseUrlIsValid

export const supabaseConfigStatus = {
  configured: supabaseConfigured,
  missingFields,
  invalidUrl: Boolean(supabaseUrl) && !supabaseUrlIsValid,
  url: supabaseUrl,
}

export const supabaseConfigMessage = (() => {
  if (supabaseConfigured) return ''

  if (missingFields.length > 0) {
    return `Supabase não está configurado. Defina no ambiente do Vercel ou no arquivo .env local: ${missingFields.join(', ')}`
  }

  if (!supabaseUrlIsValid) {
    return 'Supabase não está configurado corretamente. Verifique se VITE_SUPABASE_URL aponta para uma URL válida do Supabase e redeploy no Vercel.'
  }

  return 'Supabase não está configurado. Verifique as variáveis do ambiente no Vercel ou o arquivo .env local.'
})()

if (!supabaseConfigured) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Configurada' : '✗ Faltando')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Configurada' : '✗ Faltando')
  if (supabaseUrl && !supabaseUrlIsValid) {
    console.error('VITE_SUPABASE_URL: ✗ Formato inválido')
  }
} else {
  console.log('✓ Supabase configurado corretamente')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
