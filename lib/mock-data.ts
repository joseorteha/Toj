/**
 * Datos Mock para Demo del Hackathon
 * Se usan cuando la BD no tiene datos o como fallback
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE USUARIOS DEMO
// ═══════════════════════════════════════════════════════════════════════════

export const DEMO_USERS = {
  CIUDADANO: {
    emails: ['joseortegahac@gmail.com', 'jose@demo.com'],
    id: 'd597863e-3ba2-4c07-932c-76bffe535b93',
  },
  ADMIN: {
    emails: ['admin@toj.gob.mx', 'contacto@toj.gob.mx', '226w0702@zongolica.tecnm.mx'],
  },
};

export function isDemoCiudadano(email: string | undefined): boolean {
  if (!email) return false;
  return DEMO_USERS.CIUDADANO.emails.includes(email.toLowerCase());
}

export function isDemoAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return DEMO_USERS.ADMIN.emails.includes(email.toLowerCase());
}

// ═══════════════════════════════════════════════════════════════════════════
// DATOS MOCK PARA CIUDADANO
// ═══════════════════════════════════════════════════════════════════════════

export const MOCK_CIUDADANO = {
  id: 'd597863e-3ba2-4c07-932c-76bffe535b93',
  nombre_completo: 'José Ortega Hernández',
  email: 'joseortegahac@gmail.com',
  curp: 'ORHJ001003HVZRXS03',
  telefono: '+52 272 100 1003',
  estado_kyc: 'Verificado',
  saldo_wallet: 1250.00,
  cuenta_stp_clabe: '646180500001110003',
  chat_id_telegram: '123456789',
};

export const MOCK_OBLIGACIONES = [
  {
    id: 'obl-demo-001',
    tipo_tramite: 'Predial 2026',
    monto_total: 3200.00,
    monto_pendiente: 3200.00,
    fecha_vencimiento: '2026-09-30',
    estado_cumplimiento: 'Al corriente',
  },
  {
    id: 'obl-demo-002',
    tipo_tramite: 'Agua Potable Q1',
    monto_total: 420.00,
    monto_pendiente: 420.00,
    fecha_vencimiento: '2026-06-30',
    estado_cumplimiento: 'Al corriente',
  },
  {
    id: 'obl-demo-003',
    tipo_tramite: 'Agua Potable Q2',
    monto_total: 380.00,
    monto_pendiente: 380.00,
    fecha_vencimiento: '2026-05-15',
    estado_cumplimiento: 'Por vencer',
  },
  {
    id: 'obl-demo-004',
    tipo_tramite: 'Licencia Comercial 2025',
    monto_total: 1800.00,
    monto_pendiente: 1800.00,
    fecha_vencimiento: '2025-12-31',
    estado_cumplimiento: 'Vencido',
  },
  {
    id: 'obl-demo-005',
    tipo_tramite: 'Predial 2025',
    monto_total: 2800.00,
    monto_pendiente: 0,
    fecha_vencimiento: '2025-03-31',
    estado_cumplimiento: 'Pagado',
  },
];

export const MOCK_PAGOS_CIUDADANO = [
  {
    id: 'pago-demo-001',
    concepto: 'Predial 2025',
    monto: 2800.00,
    fecha: '01 Mar 2026',
    estado: 'Conciliado' as const,
    clave_rastreo: 'TOJ2026030115234500001',
  },
  {
    id: 'pago-demo-002',
    concepto: 'Agua Potable 2025',
    monto: 1200.00,
    fecha: '08 Abr 2026',
    estado: 'Conciliado' as const,
    clave_rastreo: 'TOJ2026040810432100002',
  },
];

export const MOCK_EXPEDIENTES = [
  {
    id: 'exp-demo-001',
    tipo_documento: 'INE',
    estado_ocr: 'Validado',
    url_archivo_s3: 'https://placehold.co/600x400/009B8D/fff?text=INE',
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-demo-002',
    tipo_documento: 'Selfie',
    estado_ocr: 'Validado',
    url_archivo_s3: 'https://ui-avatars.com/api/?name=Jose+Ortega&background=009B8D&color=fff&size=256',
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-demo-003',
    tipo_documento: 'Comprobante Domicilio',
    estado_ocr: 'Validado',
    url_archivo_s3: 'https://placehold.co/600x400/1F5A5E/fff?text=Comprobante',
    created_at: new Date().toISOString(),
  },
  {
    id: 'exp-demo-004',
    tipo_documento: 'Recibo Predial',
    estado_ocr: 'Validado',
    url_archivo_s3: 'https://placehold.co/600x400/E26D4A/fff?text=Recibo',
    created_at: new Date().toISOString(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATOS MOCK PARA ADMIN
// ═══════════════════════════════════════════════════════════════════════════

export const MOCK_ADMIN_KPIS = {
  recaudacionTotal: 156780.00,
  montoPorCobrar: 234500.00,
  pagosPendientes: 12,
  pagosObservados: 3,
  totalCiudadanos: 1247,
  kycVerificados: 1089,
  kycPendientes: 158,
  totalCargas: 8,
};

export const MOCK_PAGOS_ADMIN = [
  {
    id: 'pago-admin-001',
    ciudadano_nombre: 'María García López',
    ciudadano_email: 'maria.garcia@email.com',
    concepto: 'Predial 2026',
    monto: 4500.00,
    estado_conciliacion: 'Pendiente',
    clave_rastreo: 'TOJ2026050809154300003',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pago-admin-002',
    ciudadano_nombre: 'Carlos Hernández Ruiz',
    ciudadano_email: 'carlos.hr@email.com',
    concepto: 'Licencia Comercial',
    monto: 2800.00,
    estado_conciliacion: 'Pendiente',
    clave_rastreo: 'TOJ2026050811223400004',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pago-admin-003',
    ciudadano_nombre: 'Ana Martínez Soto',
    ciudadano_email: 'ana.ms@email.com',
    concepto: 'Agua Potable Q1',
    monto: 680.00,
    estado_conciliacion: 'Observado',
    clave_rastreo: 'TOJ2026050712345600005',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pago-admin-004',
    ciudadano_nombre: 'Roberto Sánchez',
    ciudadano_email: 'roberto.s@email.com',
    concepto: 'Predial 2025',
    monto: 3200.00,
    estado_conciliacion: 'Conciliado',
    clave_rastreo: 'TOJ2026050612345600006',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_KYC_SOLICITUDES = [
  {
    id: 'kyc-001',
    ciudadano_id: 'cid-001',
    estado: 'EnProceso',
    score_confianza: 72,
    proveedor: 'demo',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    ciudadanos: {
      nombre_completo: 'Janie Bauch Castellanos',
      email: 'janie.bauch@email.com',
      curp: 'BACJ020202MVZNXN02',
      url_selfie_liveness: 'https://ui-avatars.com/api/?name=Janie+Bauch&background=E26D4A&color=fff',
      url_ine_frente: 'https://placehold.co/600x400/E26D4A/fff?text=INE',
      estado_kyc: 'EnProceso',
      chat_id_telegram: null,
    },
  },
  {
    id: 'kyc-002',
    ciudadano_id: 'cid-002',
    estado: 'EnProceso',
    score_confianza: 68.5,
    proveedor: 'demo',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    ciudadanos: {
      nombre_completo: 'Pedro Gil Morales',
      email: 'pedro.gil@email.com',
      curp: 'GIMP001223HVZLXD05',
      url_selfie_liveness: 'https://ui-avatars.com/api/?name=Pedro+Gil&background=1F5A5E&color=fff',
      url_ine_frente: 'https://placehold.co/600x400/1F5A5E/fff?text=INE',
      estado_kyc: 'EnProceso',
      chat_id_telegram: null,
    },
  },
  {
    id: 'kyc-003',
    ciudadano_id: 'cid-003',
    estado: 'Verificado',
    score_confianza: 95,
    proveedor: 'demo',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ciudadanos: {
      nombre_completo: 'José Ortega Hernández',
      email: 'joseortegahac@gmail.com',
      curp: 'ORHJ001003HVZRXS03',
      url_selfie_liveness: 'https://ui-avatars.com/api/?name=Jose+Ortega&background=009B8D&color=fff',
      url_ine_frente: 'https://placehold.co/600x400/009B8D/fff?text=INE',
      estado_kyc: 'Verificado',
      chat_id_telegram: '123456789',
    },
  },
];

export const MOCK_CARGAS_MASIVAS = [
  {
    id: 'carga-001',
    nombre_archivo: 'Padron_Predial_2026.csv',
    registros_total: 1247,
    registros_exitosos: 1242,
    registros_error: 5,
    estado: 'Completada',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'carga-002',
    nombre_archivo: 'Padron_Agua_Q1_2026.csv',
    registros_total: 892,
    registros_exitosos: 890,
    registros_error: 2,
    estado: 'Completada',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'carga-003',
    nombre_archivo: 'Licencias_Comerciales_2026.csv',
    registros_total: 156,
    registros_exitosos: 156,
    registros_error: 0,
    estado: 'Completada',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_EVENTOS = [
  {
    id: 'evt-001',
    tipo_evento: 'PAGO_CONFIRMADO',
    aggregate_type: 'pago',
    payload: { monto: 4500, concepto: 'Predial 2026' },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estado_proceso: 'PENDIENTE',
  },
  {
    id: 'evt-002',
    tipo_evento: 'KYC_COMPLETADO',
    aggregate_type: 'ciudadano',
    payload: { score: 72, resultado: 'EN_REVISION' },
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    estado_proceso: 'PENDIENTE',
  },
  {
    id: 'evt-003',
    tipo_evento: 'CARGA_MASIVA_TERMINADA',
    aggregate_type: 'carga',
    payload: { archivo: 'Padron_Predial_2026.csv', exitosos: 1242 },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    estado_proceso: 'PROCESADO',
  },
  {
    id: 'evt-004',
    tipo_evento: 'PAGO_CONFIRMADO',
    aggregate_type: 'pago',
    payload: { monto: 2800, concepto: 'Predial 2025' },
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    estado_proceso: 'PROCESADO',
  },
];
