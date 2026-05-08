-- ════════════════════════════════════════════════════════════════════════════
-- TOJ — SEED COMPLETO Y ÚNICO
-- ════════════════════════════════════════════════════════════════════════════
-- Ejecuta en: Supabase → SQL Editor
--
-- Este script consolida TODOS los datos de prueba en un solo archivo.
-- Usa los UUID reales de Supabase Auth (captura del 8 mayo 2026).
--
-- USUARIOS AUTH (8 total):
-- ┌────────────────────────────────────────┬─────────────────────────────────┬──────────────────┐
-- │ UID                                    │ Email                           │ Rol              │
-- ├────────────────────────────────────────┼─────────────────────────────────┼──────────────────┤
-- │ c91c7e1c-5989-4151-befe-bd3263f28869   │ 226w0702@zongolica.tecnm.mx     │ OPERADOR_GOBIERNO│
-- │ 2749ea87-8c64-4cae-b144-1403ebfb0a65   │ admin@toj.gob.mx                │ ADMIN_GOBIERNO   │
-- │ 56fd9a8d-18e4-4865-a239-8850505948ed   │ ivanry@gmail.com                │ CIUDADANO        │
-- │ f96b057f-e600-4dcd-8cde-aa45f311303d   │ janiebauch02@gmail.com          │ CIUDADANO        │
-- │ d597863e-3ba2-4c07-932c-76bffe535b93   │ joseortegahac@gmail.com         │ CIUDADANO (José) │
-- │ a3b0ef9c-645e-400a-8246-45c1cb1caa6d   │ juanrt@gmail.com                │ CIUDADANO        │
-- │ 8b74085f-f0b3-4d60-a665-904d8a6c5bf9   │ pedrogil23@gmail.com            │ CIUDADANO        │
-- │ 7f9969cd-84da-4b1b-969d-0869ba2c641a   │ ramirezrj345@gmail.com          │ CIUDADANO        │
-- └────────────────────────────────────────┴─────────────────────────────────┴──────────────────┘
-- ════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 0: AGREGAR 'EnProceso' AL ENUM SI NO EXISTE
-- ═══════════════════════════════════════════════════════════════════════════
-- NOTA: Si falla con "EnProceso does not exist", ejecuta esto PRIMERO por separado:
--   ALTER TYPE public.estado_kyc_type ADD VALUE IF NOT EXISTS 'EnProceso';
-- Luego vuelve a ejecutar el seed completo.
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TYPE public.estado_kyc_type ADD VALUE IF NOT EXISTS 'EnProceso';

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 1: INSTITUCIÓN (base de todo el sistema multi-tenant)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.instituciones (id, nombre_municipio, clave_municipal, contacto_email)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Municipio de Zongolica',
  '30207',
  'contacto@toj.gob.mx'
)
ON CONFLICT (id) DO UPDATE SET
  nombre_municipio = EXCLUDED.nombre_municipio,
  clave_municipal  = EXCLUDED.clave_municipal,
  contacto_email   = EXCLUDED.contacto_email;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 2: CIUDADANOS (registros del padrón municipal)
-- IMPORTANTE: El id del ciudadano = auth_user_id para simplificar el mapeo
-- ═══════════════════════════════════════════════════════════════════════════
-- NOTA: Si estado_kyc es un ENUM, los valores válidos son:
--   'Pendiente', 'EnProceso', 'Verificado', 'Rechazado', 'Bloqueado'
-- Si tu BD usa otros valores, ejecuta primero:
--   SELECT enumlabel FROM pg_enum WHERE enumtypid = 'estado_kyc_type'::regtype;
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.ciudadanos (id, nombre_completo, email, curp, telefono, cuenta_stp_clabe, estado_kyc)
VALUES
  -- 56fd9a8d → ivanry@gmail.com
  (
    '56fd9a8d-18e4-4865-a239-8850505948ed',
    'Iván Ramírez Yáñez',
    'ivanry@gmail.com',
    'RAYI001010HVZMXV01',
    '+52 272 100 1001',
    '646180500001110001',
    'Verificado'::estado_kyc_type
  ),
  -- f96b057f → janiebauch02@gmail.com
  (
    'f96b057f-e600-4dcd-8cde-aa45f311303d',
    'Janie Bauch Castellanos',
    'janiebauch02@gmail.com',
    'BACJ020202MVZNXN02',
    '+52 272 100 1002',
    '646180500001110002',
    'EnProceso'::estado_kyc_type
  ),
  -- d597863e → joseortegahac@gmail.com (TÚ)
  (
    'd597863e-3ba2-4c07-932c-76bffe535b93',
    'José Ortega Hernández',
    'joseortegahac@gmail.com',
    'ORHJ001003HVZRXS03',
    '+52 272 100 1003',
    '646180500001110003',
    'Verificado'::estado_kyc_type
  ),
  -- a3b0ef9c → juanrt@gmail.com
  (
    'a3b0ef9c-645e-400a-8246-45c1cb1caa6d',
    'Juan Rodríguez Torres',
    'juanrt@gmail.com',
    'ROTJ990104HVZMXN04',
    '+52 272 100 1004',
    '646180500001110004',
    'Verificado'::estado_kyc_type
  ),
  -- 8b74085f → pedrogil23@gmail.com
  (
    '8b74085f-f0b3-4d60-a665-904d8a6c5bf9',
    'Pedro Gil Morales',
    'pedrogil23@gmail.com',
    'GIMP001223HVZLXD05',
    '+52 272 100 1005',
    '646180500001110005',
    'EnProceso'::estado_kyc_type
  ),
  -- 7f9969cd → ramirezrj345@gmail.com
  (
    '7f9969cd-84da-4b1b-969d-0869ba2c641a',
    'Roberto Ramírez Juárez',
    'ramirezrj345@gmail.com',
    'RAJR030506HVZMXB06',
    '+52 272 100 1006',
    '646180500001110006',
    'Pendiente'::estado_kyc_type
  )
ON CONFLICT (id) DO UPDATE SET
  nombre_completo  = EXCLUDED.nombre_completo,
  email            = EXCLUDED.email,
  curp             = EXCLUDED.curp,
  telefono         = EXCLUDED.telefono,
  cuenta_stp_clabe = EXCLUDED.cuenta_stp_clabe,
  estado_kyc       = EXCLUDED.estado_kyc;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 3: USUARIOS PLATAFORMA (vincula Auth → Ciudadano o Gobierno)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.usuarios_plataforma (auth_user_id, email, nombre_mostrar, tipo_usuario, estado, ciudadano_id)
VALUES
  -- ─── GOBIERNO ───────────────────────────────────────────────────────────
  -- c91c7e1c → 226w0702@zongolica.tecnm.mx (Operador)
  (
    'c91c7e1c-5989-4151-befe-bd3263f28869',
    '226w0702@zongolica.tecnm.mx',
    'Operador Gobierno',
    'OPERADOR_GOBIERNO',
    'Activo',
    NULL
  ),
  -- 2749ea87 → admin@toj.gob.mx (Admin)
  (
    '2749ea87-8c64-4cae-b144-1403ebfb0a65',
    'admin@toj.gob.mx',
    'Administrador TOJ',
    'ADMIN_GOBIERNO',
    'Activo',
    NULL
  ),
  -- ─── CIUDADANOS ─────────────────────────────────────────────────────────
  -- 56fd9a8d → ivanry@gmail.com
  (
    '56fd9a8d-18e4-4865-a239-8850505948ed',
    'ivanry@gmail.com',
    'Iván Ramírez',
    'CIUDADANO',
    'Activo',
    '56fd9a8d-18e4-4865-a239-8850505948ed'
  ),
  -- f96b057f → janiebauch02@gmail.com
  (
    'f96b057f-e600-4dcd-8cde-aa45f311303d',
    'janiebauch02@gmail.com',
    'Janie Bauch',
    'CIUDADANO',
    'Activo',
    'f96b057f-e600-4dcd-8cde-aa45f311303d'
  ),
  -- d597863e → joseortegahac@gmail.com (TÚ)
  (
    'd597863e-3ba2-4c07-932c-76bffe535b93',
    'joseortegahac@gmail.com',
    'José Ortega',
    'CIUDADANO',
    'Activo',
    'd597863e-3ba2-4c07-932c-76bffe535b93'
  ),
  -- a3b0ef9c → juanrt@gmail.com
  (
    'a3b0ef9c-645e-400a-8246-45c1cb1caa6d',
    'juanrt@gmail.com',
    'Juan Rodríguez',
    'CIUDADANO',
    'Activo',
    'a3b0ef9c-645e-400a-8246-45c1cb1caa6d'
  ),
  -- 8b74085f → pedrogil23@gmail.com
  (
    '8b74085f-f0b3-4d60-a665-904d8a6c5bf9',
    'pedrogil23@gmail.com',
    'Pedro Gil',
    'CIUDADANO',
    'Activo',
    '8b74085f-f0b3-4d60-a665-904d8a6c5bf9'
  ),
  -- 7f9969cd → ramirezrj345@gmail.com
  (
    '7f9969cd-84da-4b1b-969d-0869ba2c641a',
    'ramirezrj345@gmail.com',
    'Roberto Ramírez',
    'CIUDADANO',
    'Activo',
    '7f9969cd-84da-4b1b-969d-0869ba2c641a'
  )
ON CONFLICT (auth_user_id) DO UPDATE SET
  tipo_usuario   = EXCLUDED.tipo_usuario,
  nombre_mostrar = EXCLUDED.nombre_mostrar,
  ciudadano_id   = EXCLUDED.ciudadano_id,
  estado         = 'Activo';

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 4: ASIGNAR ROLES DE INSTITUCIÓN (Admin y Operador → Zongolica)
-- ═══════════════════════════════════════════════════════════════════════════

-- Admin → ADMIN en Zongolica
INSERT INTO public.usuarios_instituciones (usuario_id, institucion_id, rol_institucion, activo)
SELECT up.id, 'aaaaaaaa-0000-0000-0000-000000000001', 'ADMIN', true
FROM public.usuarios_plataforma up
WHERE up.auth_user_id = '2749ea87-8c64-4cae-b144-1403ebfb0a65'
ON CONFLICT (usuario_id, institucion_id) DO UPDATE SET
  rol_institucion = 'ADMIN',
  activo = true;

-- Operador → OPERADOR en Zongolica
INSERT INTO public.usuarios_instituciones (usuario_id, institucion_id, rol_institucion, activo)
SELECT up.id, 'aaaaaaaa-0000-0000-0000-000000000001', 'OPERADOR', true
FROM public.usuarios_plataforma up
WHERE up.auth_user_id = 'c91c7e1c-5989-4151-befe-bd3263f28869'
ON CONFLICT (usuario_id, institucion_id) DO UPDATE SET
  rol_institucion = 'OPERADOR',
  activo = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 5: OBLIGACIONES FISCALES (deudas variadas para cada ciudadano)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.obligaciones (
  ciudadano_id, institucion_id, tipo_tramite, identificador_externo,
  monto_original, monto_recargos, monto_total, monto_pendiente,
  fecha_vencimiento, estado_cumplimiento, ejercicio, periodo_referencia
) VALUES
  -- ─── IVÁN (56fd9a8d) — KYC Verificado ────────────────────────────────────
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial', 'PRED-IVAN-2024', 2400.00, 480.00, 2880.00, 2880.00,
   '2024-12-31', 'Vencido', 2024, 'Anual 2024'),
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Agua Potable', 'AGUA-IVAN-Q1-26', 360.00, 0.00, 360.00, 360.00,
   '2026-06-30', 'Al corriente', 2026, 'Q1 2026'),

  -- ─── JANIE (f96b057f) — KYC En Proceso ───────────────────────────────────
  ('f96b057f-e600-4dcd-8cde-aa45f311303d', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial', 'PRED-JANIE-2026', 1800.00, 0.00, 1800.00, 1800.00,
   '2026-05-30', 'Por vencer', 2026, 'Anual 2026'),
  ('f96b057f-e600-4dcd-8cde-aa45f311303d', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Licencia Comercial', 'LIC-JANIE-2025', 950.00, 0.00, 950.00, 0.00,
   '2025-12-31', 'Pagado', 2025, 'Anual 2025'),

  -- ─── JOSÉ (d597863e) — TÚ, KYC Verificado ────────────────────────────────
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial', 'PRED-JOSE-2026', 3200.00, 0.00, 3200.00, 3200.00,
   '2026-09-30', 'Al corriente', 2026, 'Anual 2026'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Agua Potable', 'AGUA-JOSE-Q1-26', 420.00, 0.00, 420.00, 420.00,
   '2026-06-30', 'Al corriente', 2026, 'Q1 2026'),

  -- ─── JUAN (a3b0ef9c) — KYC Verificado ────────────────────────────────────
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial', 'PRED-JUAN-2024', 4500.00, 900.00, 5400.00, 5400.00,
   '2024-12-31', 'Vencido', 2024, 'Anual 2024'),
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Agua Potable', 'AGUA-JUAN-Q1-26', 480.00, 0.00, 480.00, 480.00,
   '2026-06-30', 'Al corriente', 2026, 'Q1 2026'),

  -- ─── PEDRO (8b74085f) — KYC En Proceso ───────────────────────────────────
  ('8b74085f-f0b3-4d60-a665-904d8a6c5bf9', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial', 'PRED-PEDRO-2026', 2100.00, 0.00, 2100.00, 2100.00,
   '2026-09-30', 'Al corriente', 2026, 'Anual 2026'),

  -- ─── ROBERTO RAMÍREZ (7f9969cd) — KYC Pendiente ──────────────────────────
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Predial', 'PRED-RAMIREZ-2025', 1600.00, 320.00, 1920.00, 1920.00,
   '2025-12-31', 'Vencido', 2025, 'Anual 2025'),
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Licencia Comercial', 'LIC-RAMIREZ-2025', 700.00, 140.00, 840.00, 840.00,
   '2025-06-30', 'Vencido', 2025, 'Anual 2025')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 6: SOLICITUDES KYC (historial de verificación biométrica)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.kyc_solicitudes (
  ciudadano_id, proveedor, tipo_validacion,
  estado, score_confianza, request_payload, response_payload, completed_at
) VALUES
  -- Iván: Verificado con score alto
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'demo', 'selfie_ine',
   'Verificado'::estado_kyc_type, 97.5, '{}', '{"aprobado":true}', NOW() - INTERVAL '10 days'),
  -- Janie: En proceso
  ('f96b057f-e600-4dcd-8cde-aa45f311303d', 'demo', 'selfie_ine',
   'EnProceso'::estado_kyc_type, 72.0, '{}', '{"aprobado":null}', NULL),
  -- José (tú): Verificado
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'demo', 'selfie_ine',
   'Verificado'::estado_kyc_type, 95.0, '{}', '{"aprobado":true}', NOW() - INTERVAL '3 days'),
  -- Juan: Verificado con score muy alto
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d', 'demo', 'selfie_ine',
   'Verificado'::estado_kyc_type, 99.1, '{}', '{"aprobado":true}', NOW() - INTERVAL '5 days'),
  -- Pedro: En proceso con score bajo
  ('8b74085f-f0b3-4d60-a665-904d8a6c5bf9', 'demo', 'selfie_ine',
   'EnProceso'::estado_kyc_type, 68.5, '{}', '{"aprobado":null}', NULL),
  -- Ramírez: Pendiente (aún no inicia)
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a', 'demo', 'selfie_ine',
   'Pendiente'::estado_kyc_type, 0.0, '{}', '{}', NULL)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 7: PAGOS DE EJEMPLO (para demo de conciliación)
-- ═══════════════════════════════════════════════════════════════════════════

-- Pago de la licencia de Janie (ya conciliado)
INSERT INTO public.pagos (
  obligacion_id, ciudadano_id, monto_transferido,
  estado_conciliacion, clave_rastreo_stp, fecha_confirmacion
)
SELECT
  o.id,
  o.ciudadano_id,
  950.00,
  'Conciliado',
  'TOJ-DEMO-LIC-JANIE-001',
  NOW() - INTERVAL '30 days'
FROM public.obligaciones o
WHERE o.identificador_externo = 'LIC-JANIE-2025'
ON CONFLICT DO NOTHING;

-- Pago pendiente de conciliación (para probar el panel admin)
INSERT INTO public.pagos (
  obligacion_id, ciudadano_id, monto_transferido,
  estado_conciliacion, clave_rastreo_stp, fecha_confirmacion
)
SELECT
  o.id,
  o.ciudadano_id,
  360.00,
  'Pendiente',
  'TOJ-DEMO-AGUA-IVAN-001',
  NULL
FROM public.obligaciones o
WHERE o.identificador_externo = 'AGUA-IVAN-Q1-26'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 8: VERIFICACIÓN FINAL
-- ═══════════════════════════════════════════════════════════════════════════
SELECT '✅ SEED COMPLETADO' AS status;

SELECT tabla, cantidad FROM (
  SELECT 'instituciones' AS tabla, COUNT(*)::text AS cantidad FROM public.instituciones
  UNION ALL SELECT 'ciudadanos', COUNT(*)::text FROM public.ciudadanos
  UNION ALL SELECT 'usuarios_plataforma', COUNT(*)::text FROM public.usuarios_plataforma
  UNION ALL SELECT 'usuarios_instituciones', COUNT(*)::text FROM public.usuarios_instituciones
  UNION ALL SELECT 'obligaciones', COUNT(*)::text FROM public.obligaciones
  UNION ALL SELECT 'kyc_solicitudes', COUNT(*)::text FROM public.kyc_solicitudes
  UNION ALL SELECT 'pagos', COUNT(*)::text FROM public.pagos
) AS resumen
ORDER BY tabla;

-- ═══════════════════════════════════════════════════════════════════════════
-- ÍNDICE RÁPIDO DE UUIDS PARA REFERENCIA
-- ═══════════════════════════════════════════════════════════════════════════
/*
GOBIERNO:
  c91c7e1c-5989-4151-befe-bd3263f28869  →  226w0702@zongolica.tecnm.mx  (OPERADOR)
  2749ea87-8c64-4cae-b144-1403ebfb0a65  →  admin@toj.gob.mx             (ADMIN)

CIUDADANOS:
  56fd9a8d-18e4-4865-a239-8850505948ed  →  ivanry@gmail.com            (Verificado)
  f96b057f-e600-4dcd-8cde-aa45f311303d  →  janiebauch02@gmail.com      (EnProceso)
  d597863e-3ba2-4c07-932c-76bffe535b93  →  joseortegahac@gmail.com     (Verificado) ← TÚ
  a3b0ef9c-645e-400a-8246-45c1cb1caa6d  →  juanrt@gmail.com            (Verificado)
  8b74085f-f0b3-4d60-a665-904d8a6c5bf9  →  pedrogil23@gmail.com        (EnProceso)
  7f9969cd-84da-4b1b-969d-0869ba2c641a  →  ramirezrj345@gmail.com      (Pendiente)

INSTITUCIÓN:
  aaaaaaaa-0000-0000-0000-000000000001  →  Municipio de Zongolica
*/
