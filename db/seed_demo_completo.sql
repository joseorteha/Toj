-- ════════════════════════════════════════════════════════════════════════════
-- TOJ — SEED DEMO COMPLETO PARA HACKATHON
-- ════════════════════════════════════════════════════════════════════════════
-- Ejecuta en: Supabase → SQL Editor
-- 
-- Este script AGREGA datos demo adicionales para:
-- 1. Ciudadano: Obligaciones para pagar, historial de pagos, expedientes
-- 2. Admin: Pagos para conciliar, solicitudes KYC para revisar, eventos
--
-- ⚠️ EJECUTA PRIMERO seed_completo.sql antes de este archivo
-- ════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 0: AGREGAR 'Observado' AL ENUM estado_conciliacion_type SI NO EXISTE
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'Observado' 
    AND enumtypid = 'estado_conciliacion_type'::regtype
  ) THEN
    ALTER TYPE estado_conciliacion_type ADD VALUE 'Observado';
  END IF;
END
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 1: ACTUALIZAR CIUDADANOS CON MÁS DATOS
-- ═══════════════════════════════════════════════════════════════════════════

-- Agregar saldo wallet y datos adicionales a José (TÚ)
UPDATE public.ciudadanos SET
  saldo_wallet = 1250.00,
  chat_id_telegram = '123456789',
  url_selfie_liveness = 'https://ui-avatars.com/api/?name=Jose+Ortega&background=009B8D&color=fff&size=256',
  url_ine_frente = 'https://placehold.co/600x400/1F5A5E/fff?text=INE+FRENTE',
  timestamp_kyc_verificado = NOW() - INTERVAL '3 days'
WHERE id = 'd597863e-3ba2-4c07-932c-76bffe535b93';

-- Agregar datos a Iván (ciudadano demo 2)
UPDATE public.ciudadanos SET
  saldo_wallet = 500.00,
  chat_id_telegram = '987654321',
  url_selfie_liveness = 'https://ui-avatars.com/api/?name=Ivan+Ramirez&background=E26D4A&color=fff&size=256',
  url_ine_frente = 'https://placehold.co/600x400/E26D4A/fff?text=INE+FRENTE',
  timestamp_kyc_verificado = NOW() - INTERVAL '10 days'
WHERE id = '56fd9a8d-18e4-4865-a239-8850505948ed';

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 2: MÁS OBLIGACIONES VARIADAS PARA JOSÉ (ciudadano principal)
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM public.obligaciones WHERE ciudadano_id = 'd597863e-3ba2-4c07-932c-76bffe535b93';

INSERT INTO public.obligaciones (
  ciudadano_id, institucion_id, tipo_tramite, identificador_externo,
  monto_original, monto_recargos, monto_total, monto_pendiente,
  fecha_vencimiento, estado_cumplimiento, ejercicio, periodo_referencia
) VALUES
  -- Predial 2026 - PENDIENTE (principal para demo de pago)
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial 2026', 'PRED-30207-JOSE-2026', 3200.00, 0.00, 3200.00, 3200.00,
   '2026-09-30', 'Al corriente', 2026, 'Anual 2026'),
   
  -- Agua Potable Q1 2026 - PENDIENTE
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Agua Potable', 'AGUA-30207-JOSE-Q1-2026', 420.00, 0.00, 420.00, 420.00,
   '2026-06-30', 'Al corriente', 2026, 'Ene-Mar 2026'),
   
  -- Agua Potable Q2 2026 - POR VENCER
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Agua Potable', 'AGUA-30207-JOSE-Q2-2026', 380.00, 0.00, 380.00, 380.00,
   '2026-05-15', 'Por vencer', 2026, 'Abr-Jun 2026'),
   
  -- Licencia de funcionamiento - VENCIDO
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Licencia Comercial', 'LIC-30207-JOSE-2025', 1500.00, 300.00, 1800.00, 1800.00,
   '2025-12-31', 'Vencido', 2025, 'Anual 2025'),

  -- Predial 2025 - YA PAGADO
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial 2025', 'PRED-30207-JOSE-2025', 2800.00, 0.00, 2800.00, 0.00,
   '2025-03-31', 'Pagado', 2025, 'Anual 2025'),
   
  -- Agua 2025 - YA PAGADO
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Agua Potable', 'AGUA-30207-JOSE-2025', 1200.00, 0.00, 1200.00, 0.00,
   '2025-12-31', 'Pagado', 2025, 'Anual 2025');

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 3: HISTORIAL DE PAGOS PARA JOSÉ
-- ═══════════════════════════════════════════════════════════════════════════

-- Pago del Predial 2025 (conciliado hace 2 meses)
INSERT INTO public.pagos (
  obligacion_id, ciudadano_id, monto_transferido,
  estado_conciliacion, clave_rastreo_stp, fecha_confirmacion, created_at
)
SELECT
  o.id, o.ciudadano_id, 2800.00, 'Conciliado',
  'TOJ2025030115234500001', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'
FROM public.obligaciones o
WHERE o.identificador_externo = 'PRED-30207-JOSE-2025'
ON CONFLICT DO NOTHING;

-- Pago del Agua 2025 (conciliado hace 1 mes)
INSERT INTO public.pagos (
  obligacion_id, ciudadano_id, monto_transferido,
  estado_conciliacion, clave_rastreo_stp, fecha_confirmacion, created_at
)
SELECT
  o.id, o.ciudadano_id, 1200.00, 'Conciliado',
  'TOJ2025041210432100002', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM public.obligaciones o
WHERE o.identificador_externo = 'AGUA-30207-JOSE-2025'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 4: EXPEDIENTES/DOCUMENTOS PARA JOSÉ
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM public.expedientes WHERE ciudadano_id = 'd597863e-3ba2-4c07-932c-76bffe535b93';

INSERT INTO public.expedientes (ciudadano_id, tipo_documento, estado_ocr, url_archivo_s3, created_at) VALUES
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'INE', 'Validado', 
   'https://placehold.co/600x400/009B8D/fff?text=INE+Jose', NOW() - INTERVAL '3 days'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'Selfie', 'Validado',
   'https://ui-avatars.com/api/?name=Jose+Ortega&background=009B8D&color=fff&size=256', NOW() - INTERVAL '3 days'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'Comprobante Domicilio', 'Validado',
   'https://placehold.co/600x400/1F5A5E/fff?text=Comprobante', NOW() - INTERVAL '3 days'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'Recibo Predial 2025', 'Validado',
   'https://placehold.co/600x400/E26D4A/fff?text=Recibo+Predial', NOW() - INTERVAL '60 days');

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 5: MÁS OBLIGACIONES PARA OTROS CIUDADANOS (para admin ver variedad)
-- ═══════════════════════════════════════════════════════════════════════════

-- Más obligaciones para Iván
INSERT INTO public.obligaciones (
  ciudadano_id, institucion_id, tipo_tramite, identificador_externo,
  monto_original, monto_recargos, monto_total, monto_pendiente,
  fecha_vencimiento, estado_cumplimiento, ejercicio, periodo_referencia
) VALUES
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Licencia Comercial', 'LIC-30207-IVAN-2026', 2500.00, 0.00, 2500.00, 2500.00,
   '2026-06-30', 'Por vencer', 2026, 'Anual 2026')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 6: PAGOS PENDIENTES DE CONCILIACIÓN (para admin)
-- ═══════════════════════════════════════════════════════════════════════════

-- Pago de Iván pendiente
INSERT INTO public.pagos (
  obligacion_id, ciudadano_id, monto_transferido,
  estado_conciliacion, clave_rastreo_stp, created_at
)
SELECT
  o.id, o.ciudadano_id, 2880.00, 'Pendiente',
  'TOJ2026050809154300003', NOW() - INTERVAL '2 hours'
FROM public.obligaciones o
WHERE o.identificador_externo = 'PRED-IVAN-2024'
ON CONFLICT DO NOTHING;

-- Pago de Juan pendiente
INSERT INTO public.pagos (
  obligacion_id, ciudadano_id, monto_transferido,
  estado_conciliacion, clave_rastreo_stp, created_at
)
SELECT
  o.id, o.ciudadano_id, 5400.00, 'Pendiente',
  'TOJ2026050811223400004', NOW() - INTERVAL '1 hour'
FROM public.obligaciones o
WHERE o.identificador_externo = 'PRED-JUAN-2024'
ON CONFLICT DO NOTHING;

-- Pago observado (requiere revisión manual)
INSERT INTO public.pagos (
  obligacion_id, ciudadano_id, monto_transferido,
  estado_conciliacion, clave_rastreo_stp, created_at
)
SELECT
  o.id, o.ciudadano_id, 480.00, 'Observado',
  'TOJ2026050712345600005', NOW() - INTERVAL '1 day'
FROM public.obligaciones o
WHERE o.identificador_externo = 'AGUA-JUAN-Q1-26'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 7: CARGAS MASIVAS DE EJEMPLO (para historial ETL)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.cargas_masivas (
  institucion_id, nombre_archivo, tipo_datos,
  registros_total, registros_exitosos, registros_error,
  estado
) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Padron_Predial_2026.csv', 'Predial',
   1247, 1242, 5, 'Completada'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Padron_Agua_Q1_2026.csv', 'Agua Potable',
   892, 890, 2, 'Completada'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Licencias_Comerciales_2026.csv', 'Licencias',
   156, 156, 0, 'Completada'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Actualizacion_Mayo_2026.csv', 'Predial',
   324, 318, 6, 'Completada')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 8: EVENTOS DEL DOMINIO (para mostrar actividad del sistema)
-- ═══════════════════════════════════════════════════════════════════════════

-- Eventos con estructura correcta según bd.sql (aggregate_id debe ser UUID)
INSERT INTO public.eventos_dominio (
  aggregate_type, aggregate_id, tipo_evento, payload, origen
) VALUES
  ('pago', gen_random_uuid(), 'PAGO_CONFIRMADO',
   '{"monto": 2800, "concepto": "Predial 2025", "ciudadano": "José Ortega"}'::jsonb,
   'stp_webhook'),
   
  ('pago', gen_random_uuid(), 'PAGO_CONFIRMADO',
   '{"monto": 1200, "concepto": "Agua 2025", "ciudadano": "José Ortega"}'::jsonb,
   'stp_webhook'),
   
  ('ciudadano', 'd597863e-3ba2-4c07-932c-76bffe535b93'::uuid, 'KYC_COMPLETADO',
   '{"score": 95, "proveedor": "demo", "resultado": "APROBADO"}'::jsonb,
   'admin_kyc'),
   
  ('carga', gen_random_uuid(), 'CARGA_MASIVA_TERMINADA',
   '{"archivo": "Padron_Predial_2026.csv", "exitosos": 1242, "errores": 5}'::jsonb,
   'etl_api'),
   
  ('pago', gen_random_uuid(), 'PAGO_CONFIRMADO',
   '{"monto": 2880, "concepto": "Predial 2024", "ciudadano": "Iván Ramírez"}'::jsonb,
   'stp_webhook'),
   
  ('pago', gen_random_uuid(), 'PAGO_CONFIRMADO',
   '{"monto": 5400, "concepto": "Predial 2024", "ciudadano": "Juan Rodríguez"}'::jsonb,
   'stp_webhook'),
   
  ('ciudadano', 'f96b057f-e600-4dcd-8cde-aa45f311303d'::uuid, 'KYC_COMPLETADO',
   '{"score": 72, "proveedor": "demo", "resultado": "EN_REVISION"}'::jsonb,
   'ciudadano_app'),
   
  ('ciudadano', '8b74085f-f0b3-4d60-a665-904d8a6c5bf9'::uuid, 'KYC_COMPLETADO',
   '{"score": 68.5, "proveedor": "demo", "resultado": "EN_REVISION"}'::jsonb,
   'ciudadano_app')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 9: VALIDACIONES RENAPO (historial de verificación)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.renapo_validaciones (ciudadano_id, resultado, score_confianza, created_at) VALUES
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'VALIDO', '95', NOW() - INTERVAL '3 days'),
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'VALIDO', '97', NOW() - INTERVAL '10 days'),
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d', 'VALIDO', '99', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 10: BITÁCORA DE AUDITORÍA (actividad reciente)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.bitacora_auditoria (ciudadano_id, accion, detalles, entity_type, created_at) VALUES
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'KYC Aprobado', 
   '{"score": 95, "aprobado_por": "admin@toj.gob.mx"}'::jsonb, 'kyc_solicitudes', NOW() - INTERVAL '3 days'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'Pago realizado',
   '{"monto": 2800, "obligacion": "Predial 2025"}'::jsonb, 'pagos', NOW() - INTERVAL '60 days'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'Telegram vinculado',
   '{"chat_id": "123456789"}'::jsonb, 'ciudadanos', NOW() - INTERVAL '2 days'),
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'KYC Aprobado',
   '{"score": 97, "aprobado_por": "admin@toj.gob.mx"}'::jsonb, 'kyc_solicitudes', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN FINAL
-- ═══════════════════════════════════════════════════════════════════════════
SELECT '✅ SEED DEMO COMPLETO EJECUTADO' AS status;

SELECT 
  'Resumen de datos cargados:' AS info,
  (SELECT COUNT(*) FROM public.obligaciones) AS obligaciones,
  (SELECT COUNT(*) FROM public.pagos) AS pagos,
  (SELECT COUNT(*) FROM public.expedientes) AS expedientes,
  (SELECT COUNT(*) FROM public.eventos_dominio) AS eventos,
  (SELECT COUNT(*) FROM public.cargas_masivas) AS cargas_etl;

-- ═══════════════════════════════════════════════════════════════════════════
-- DATOS DE DEMO PARA PRUEBAS
-- ═══════════════════════════════════════════════════════════════════════════
/*
PARA PROBAR COMO CIUDADANO (José Ortega):
- Email: joseortegahac@gmail.com
- Tiene 4 obligaciones pendientes (total ~$5,800)
- Tiene 2 pagos históricos ya conciliados ($4,000)
- Tiene 4 documentos en su carpeta digital
- Telegram vinculado

PARA PROBAR COMO ADMIN:
- Email: admin@toj.gob.mx
- Verá 3 pagos pendientes de conciliación
- Verá 2 solicitudes KYC en revisión (Janie y Pedro)
- Verá historial de 4 cargas masivas
- Verá 8 eventos del sistema

FLUJO DE PAGO DEMO:
1. Ciudadano selecciona obligación "Predial 2026" ($3,200)
2. Hace clic en "Pagar"
3. Ve CLABE y QR
4. Hace clic en "Simular Pago"
5. Se genera el pago y aparece en admin para conciliar
*/
