-- ════════════════════════════════════════════════════════════
-- TOJ — PLANTILLA PARA CREAR UN ADMIN/OPERADOR GOBIERNO
-- ════════════════════════════════════════════════════════════
--
-- ⚠️  PARA DATOS DE DEMO, USA: db/seed_completo.sql
--     Ya incluye admin@toj.gob.mx y 226w0702@zongolica.tecnm.mx
--
-- Esta plantilla es útil si necesitas agregar otro usuario
-- de gobierno que no está en el seed.
-- ════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_auth_uid   UUID := 'PEGA-AQUI-EL-UUID-DEL-AUTH-USER'; -- ← CAMBIAR
  v_inst_id    UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_usuario_id UUID;
BEGIN

  -- Asegurar que la institución existe
  INSERT INTO public.instituciones (id, nombre_municipio, clave_municipal, contacto_email)
  VALUES (v_inst_id, 'Municipio de Zongolica', '30207', 'contacto@toj.gob.mx')
  ON CONFLICT (id) DO NOTHING;

  -- Registrar en usuarios_plataforma
  INSERT INTO public.usuarios_plataforma (
    auth_user_id, email, nombre_mostrar, tipo_usuario, estado
  ) VALUES (
    v_auth_uid,
    'nuevo_admin@toj.gob.mx',    -- ← CAMBIAR (debe coincidir con Auth)
    'Nuevo Administrador',       -- ← CAMBIAR
    'ADMIN_GOBIERNO',            -- o 'OPERADOR_GOBIERNO'
    'Activo'
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    tipo_usuario   = EXCLUDED.tipo_usuario,
    nombre_mostrar = EXCLUDED.nombre_mostrar,
    estado         = 'Activo'
  RETURNING id INTO v_usuario_id;

  -- Asignar a la institución
  INSERT INTO public.usuarios_instituciones (
    usuario_id, institucion_id, rol_institucion, activo
  ) VALUES (
    v_usuario_id,
    v_inst_id,
    'ADMIN',  -- o 'OPERADOR'
    true
  )
  ON CONFLICT (usuario_id, institucion_id) DO UPDATE SET
    rol_institucion = EXCLUDED.rol_institucion,
    activo = true;

  RAISE NOTICE '✅ Usuario gobierno creado: %', v_usuario_id;
END;
$$;
