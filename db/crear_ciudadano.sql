-- ════════════════════════════════════════════════════════════
-- TOJ — PLANTILLA PARA CREAR UN CIUDADANO NUEVO
-- ════════════════════════════════════════════════════════════
-- 
-- ⚠️  PARA DATOS DE DEMO, USA: db/seed_completo.sql
--
-- Esta plantilla es útil si necesitas agregar UN ciudadano
-- nuevo que no está en el seed. Sigue estos pasos:
--
-- 1. Crea el usuario en Supabase Auth
-- 2. Copia el UUID generado
-- 3. Reemplaza los valores marcados con ← CAMBIAR
-- 4. Ejecuta en SQL Editor
-- ════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_auth_uid UUID := 'PEGA-AQUI-EL-UUID-DEL-AUTH-USER'; -- ← CAMBIAR
BEGIN

  -- Crear ciudadano (id = auth_user_id para simplificar)
  INSERT INTO public.ciudadanos (
    id, nombre_completo, email, curp, estado_kyc, cuenta_stp_clabe
  ) VALUES (
    v_auth_uid,
    'Nombre Completo',           -- ← CAMBIAR
    'email@ejemplo.com',         -- ← CAMBIAR (debe coincidir con Auth)
    'XXXX000000HVZXXX00',        -- ← CAMBIAR (CURP real o ficticio)
    'Pendiente',
    '646180500001' || LPAD(FLOOR(RANDOM()*999999)::text, 6, '0')
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre_completo  = EXCLUDED.nombre_completo,
    email            = EXCLUDED.email,
    curp             = EXCLUDED.curp,
    estado_kyc       = EXCLUDED.estado_kyc,
    cuenta_stp_clabe = EXCLUDED.cuenta_stp_clabe;

  -- Vincular en usuarios_plataforma
  INSERT INTO public.usuarios_plataforma (
    auth_user_id, email, nombre_mostrar, tipo_usuario, estado, ciudadano_id
  ) VALUES (
    v_auth_uid,
    'email@ejemplo.com',         -- ← CAMBIAR (mismo email)
    'Nombre Corto',              -- ← CAMBIAR
    'CIUDADANO',
    'Activo',
    v_auth_uid
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    ciudadano_id   = v_auth_uid,
    tipo_usuario   = 'CIUDADANO',
    nombre_mostrar = EXCLUDED.nombre_mostrar,
    estado         = 'Activo';

  -- Opcional: Crear una obligación de ejemplo
  INSERT INTO public.obligaciones (
    ciudadano_id, institucion_id, tipo_tramite, identificador_externo,
    monto_original, monto_recargos, monto_total, monto_pendiente,
    fecha_vencimiento, estado_cumplimiento
  ) VALUES (
    v_auth_uid,
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Predial',
    'PRED-' || UPPER(LEFT(v_auth_uid::text, 8)),
    1500.00, 0.00, 1500.00, 1500.00,
    '2026-06-30', 'Al corriente'
  );

  RAISE NOTICE '✅ Ciudadano creado: %', v_auth_uid;
END;
$$;
