-- ════════════════════════════════════════════════════════════
-- ⚠️  ARCHIVO CONSOLIDADO EN: db/seed_completo.sql
-- ════════════════════════════════════════════════════════════
-- Este archivo ha sido fusionado con seed_completo.sql que
-- incluye TODO: institución, ciudadanos, usuarios, roles,
-- obligaciones, KYC y pagos de ejemplo.
--
-- USA: db/seed_completo.sql
-- ════════════════════════════════════════════════════════════
-- (Contenido original conservado abajo por referencia)
-- ════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- ORDEN 1: INSTITUCIÓN (base de todo)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.instituciones (id, nombre_municipio, clave_municipal, contacto_email)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'Municipio de Zongolica', '30207', 'contacto@toj.gob.mx')
ON CONFLICT (id) DO UPDATE
  SET nombre_municipio = EXCLUDED.nombre_municipio,
      clave_municipal  = EXCLUDED.clave_municipal,
      contacto_email   = EXCLUDED.contacto_email;

-- ─────────────────────────────────────────────────────────────
-- ORDEN 2: CIUDADANOS (id = auth_user_id)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.ciudadanos (id, nombre_completo, email, curp, telefono, cuenta_stp_clabe, estado_kyc)
VALUES
  -- Ivan
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'Iván Ramírez Yáñez',    'ivanry@gmail.com',           'RAYI001010HVZMXV01', '+52 272 100 1001', '646180500001110001', 'Verificado'),
  -- Janie
  ('f96b057f-e600-4dcd-8cde-aa45f311303d', 'Janie Bauch Castellanos','janiebauch02@gmail.com',    'BACJ020202MVZNXN02', '+52 272 100 1002', '646180500001110002', 'EnProceso'),
  -- José Ortega
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'José Ortega Hernández',  'joseortegahac@gmail.com',   'ORHJ001003HVZRXS03', '+52 272 100 1003', '646180500001110003', 'Pendiente'),
  -- Juan
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d', 'Juan Rodríguez Torres',  'juanrt@gmail.com',          'ROTJ990104HVZMXN04', '+52 272 100 1004', '646180500001110004', 'Verificado'),
  -- Pedro
  ('8b74085f-f0b3-4d60-a665-904d8a6c5bf9', 'Pedro Gil Morales',      'pedrogil23@gmail.com',      'GIMP001223HVZLXD05', '+52 272 100 1005', '646180500001110005', 'EnProceso'),
  -- Ramírez
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a', 'Roberto Ramírez Juárez', 'ramirezrj345@gmail.com',    'RAJR030506HVZMXB06', '+52 272 100 1006', '646180500001110006', 'Pendiente')
ON CONFLICT (id) DO UPDATE
  SET nombre_completo = EXCLUDED.nombre_completo,
      email = EXCLUDED.email,
      curp = EXCLUDED.curp,
      telefono = EXCLUDED.telefono,
      cuenta_stp_clabe = EXCLUDED.cuenta_stp_clabe,
      estado_kyc = EXCLUDED.estado_kyc;

-- ─────────────────────────────────────────────────────────────
-- ORDEN 3: USUARIOS PLATAFORMA (vincular Auth UUID → ciudadano)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.usuarios_plataforma (auth_user_id, email, nombre_mostrar, tipo_usuario, estado, ciudadano_id)
VALUES
  -- Operador gobierno
  ('c91c7e1c-5989-4151-befe-bd3263f28869', '226w0702@zongolica.tecnm.mx', 'Operador Gobierno', 'OPERADOR_GOBIERNO', 'Activo', NULL),
  -- Admin gobierno
  ('2749ea87-8c64-4cae-b144-1403ebfb0a65', 'admin@toj.gob.mx', 'Administrador TOJ', 'ADMIN_GOBIERNO', 'Activo', NULL),
  -- Ciudadanos
  ('56fd9a8d-18e4-4865-a239-8850505948ed', 'ivanry@gmail.com',        'Iván Ramírez',   'CIUDADANO', 'Activo', '56fd9a8d-18e4-4865-a239-8850505948ed'),
  ('f96b057f-e600-4dcd-8cde-aa45f311303d', 'janiebauch02@gmail.com',  'Janie Bauch',   'CIUDADANO', 'Activo', 'f96b057f-e600-4dcd-8cde-aa45f311303d'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93', 'joseortegahac@gmail.com', 'José Ortega',   'CIUDADANO', 'Activo', 'd597863e-3ba2-4c07-932c-76bffe535b93'),
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d', 'juanrt@gmail.com',        'Juan Rodríguez','CIUDADANO', 'Activo', 'a3b0ef9c-645e-400a-8246-45c1cb1caa6d'),
  ('8b74085f-f0b3-4d60-a665-904d8a6c5bf9', 'pedrogil23@gmail.com',    'Pedro Gil',     'CIUDADANO', 'Activo', '8b74085f-f0b3-4d60-a665-904d8a6c5bf9'),
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a', 'ramirezrj345@gmail.com',  'Roberto Ramírez','CIUDADANO', 'Activo', '7f9969cd-84da-4b1b-969d-0869ba2c641a')
ON CONFLICT (auth_user_id) DO UPDATE
  SET tipo_usuario   = EXCLUDED.tipo_usuario,
      nombre_mostrar = EXCLUDED.nombre_mostrar,
      ciudadano_id   = EXCLUDED.ciudadano_id,
      estado         = 'Activo';

-- ─────────────────────────────────────────────────────────────
-- ORDEN 4: ROL INSTITUCIÓN para admin y operador
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.usuarios_instituciones (usuario_id, institucion_id, rol_institucion, activo)
SELECT up.id, 'aaaaaaaa-0000-0000-0000-000000000001', 'ADMIN', true
FROM public.usuarios_plataforma up
WHERE up.auth_user_id = '2749ea87-8c64-4cae-b144-1403ebfb0a65'
ON CONFLICT (usuario_id, institucion_id) DO UPDATE SET rol_institucion = 'ADMIN', activo = true;

INSERT INTO public.usuarios_instituciones (usuario_id, institucion_id, rol_institucion, activo)
SELECT up.id, 'aaaaaaaa-0000-0000-0000-000000000001', 'OPERADOR', true
FROM public.usuarios_plataforma up
WHERE up.auth_user_id = 'c91c7e1c-5989-4151-befe-bd3263f28869'
ON CONFLICT (usuario_id, institucion_id) DO UPDATE SET rol_institucion = 'OPERADOR', activo = true;

-- ─────────────────────────────────────────────────────────────
-- ORDEN 5: OBLIGACIONES FISCALES
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.obligaciones (
  ciudadano_id, institucion_id, tipo_tramite, identificador_externo,
  monto_original, monto_recargos, monto_total, monto_pendiente,
  fecha_vencimiento, estado_cumplimiento, ejercicio, periodo_referencia
) VALUES
  -- Iván: Predial vencido + Agua corriente
  ('56fd9a8d-18e4-4865-a239-8850505948ed','aaaaaaaa-0000-0000-0000-000000000001','Predial',        'PRED-IVAN-2024',  2400.00,480.00,2880.00,2880.00,'2024-12-31','Vencido',      2024,'Anual 2024'),
  ('56fd9a8d-18e4-4865-a239-8850505948ed','aaaaaaaa-0000-0000-0000-000000000001','Agua Potable',   'AGUA-IVAN-Q1-26',  360.00,  0.00, 360.00, 360.00,'2026-06-30','Al corriente', 2026,'Q1 2026'),

  -- Janie: Predial por vencer + Licencia pagada
  ('f96b057f-e600-4dcd-8cde-aa45f311303d','aaaaaaaa-0000-0000-0000-000000000001','Predial',        'PRED-JANIE-2026', 1800.00,  0.00,1800.00,1800.00,'2026-05-30','Por vencer',   2026,'Anual 2026'),
  ('f96b057f-e600-4dcd-8cde-aa45f311303d','aaaaaaaa-0000-0000-0000-000000000001','Licencia Comercial','LIC-JANIE-2025', 950.00,  0.00, 950.00,   0.00,'2025-12-31','Pagado',       2025,'Anual 2025'),

  -- José Ortega: Predial al corriente + Agua
  ('d597863e-3ba2-4c07-932c-76bffe535b93','aaaaaaaa-0000-0000-0000-000000000001','Predial',        'PRED-JOSE-2026',  3200.00,  0.00,3200.00,3200.00,'2026-09-30','Al corriente', 2026,'Anual 2026'),
  ('d597863e-3ba2-4c07-932c-76bffe535b93','aaaaaaaa-0000-0000-0000-000000000001','Agua Potable',   'AGUA-JOSE-Q1-26',  420.00,  0.00, 420.00, 420.00,'2026-06-30','Al corriente', 2026,'Q1 2026'),

  -- Juan: Predial vencido alto + Agua
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d','aaaaaaaa-0000-0000-0000-000000000001','Predial',        'PRED-JUAN-2024',  4500.00,900.00,5400.00,5400.00,'2024-12-31','Vencido',      2024,'Anual 2024'),
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d','aaaaaaaa-0000-0000-0000-000000000001','Agua Potable',   'AGUA-JUAN-Q1-26',  480.00,  0.00, 480.00, 480.00,'2026-06-30','Al corriente', 2026,'Q1 2026'),

  -- Pedro: Solo predial al corriente
  ('8b74085f-f0b3-4d60-a665-904d8a6c5bf9','aaaaaaaa-0000-0000-0000-000000000001','Predial',        'PRED-PEDRO-2026', 2100.00,  0.00,2100.00,2100.00,'2026-09-30','Al corriente', 2026,'Anual 2026'),

  -- Ramírez: Predial + Licencia vencida
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a','aaaaaaaa-0000-0000-0000-000000000001','Predial',        'PRED-RAMIREZ-2025',1600.00,320.00,1920.00,1920.00,'2025-12-31','Vencido',      2025,'Anual 2025'),
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a','aaaaaaaa-0000-0000-0000-000000000001','Licencia Comercial','LIC-RAMIREZ-2025',700.00,140.00, 840.00, 840.00,'2025-06-30','Vencido',      2025,'Anual 2025')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ORDEN 6: SOLICITUDES KYC
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.kyc_solicitudes (
  ciudadano_id, proveedor, tipo_validacion,
  estado, score_confianza, request_payload, response_payload, completed_at
) VALUES
  ('56fd9a8d-18e4-4865-a239-8850505948ed','demo','selfie_ine','Verificado', 97.5,'{}','{"aprobado":true}', NOW() - INTERVAL '10 days'),
  ('f96b057f-e600-4dcd-8cde-aa45f311303d','demo','selfie_ine','EnProceso',  72.0,'{}','{"aprobado":null}', NULL),
  ('d597863e-3ba2-4c07-932c-76bffe535b93','demo','selfie_ine','Pendiente',   0.0,'{}','{}',                NULL),
  ('a3b0ef9c-645e-400a-8246-45c1cb1caa6d','demo','selfie_ine','Verificado', 99.1,'{}','{"aprobado":true}', NOW() - INTERVAL '5 days'),
  ('8b74085f-f0b3-4d60-a665-904d8a6c5bf9','demo','selfie_ine','EnProceso',  68.5,'{}','{"aprobado":null}', NULL),
  ('7f9969cd-84da-4b1b-969d-0869ba2c641a','demo','selfie_ine','Pendiente',   0.0,'{}','{}',                NULL)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ORDEN 7: PAGO CONCILIADO (licencia de Janie pagada)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.pagos (obligacion_id, ciudadano_id, monto_transferido, estado_conciliacion, clave_rastreo_stp, fecha_confirmacion)
SELECT o.id, o.ciudadano_id, 950.00, 'Conciliado', 'TOJ-DEMO-LIC-JANIE-001', NOW() - INTERVAL '30 days'
FROM public.obligaciones o
WHERE o.identificador_externo = 'LIC-JANIE-2025'
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ✅ VERIFICAR resultados
-- ─────────────────────────────────────────────────────────────
SELECT 'ciudadanos' AS tabla, COUNT(*) FROM public.ciudadanos
UNION ALL
SELECT 'usuarios_plataforma', COUNT(*) FROM public.usuarios_plataforma
UNION ALL
SELECT 'obligaciones', COUNT(*) FROM public.obligaciones
UNION ALL
SELECT 'kyc_solicitudes', COUNT(*) FROM public.kyc_solicitudes
UNION ALL
SELECT 'pagos', COUNT(*) FROM public.pagos;