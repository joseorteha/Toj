// CarpetaDigital — grid de documentos digitales del ciudadano

export type Expediente = {
  id: string;
  tipo_documento: string;
  estado_ocr: string;
  url_archivo_s3: string | null;
  created_at: string;
};

type Props = {
  expedientes?: Expediente[];
};

const ICON_MAP: Record<string, string> = {
  INE: 'badge',
  Selfie: 'face',
  Comprobante: 'home',
  Licencia: 'directions_car',
  CURP: 'description',
  Predial: 'receipt_long',
  Agua: 'water_drop',
};

const getIcon = (tipo: string): string => {
  const key = Object.keys(ICON_MAP).find((k) => tipo.toLowerCase().includes(k.toLowerCase()));
  return key ? ICON_MAP[key] : 'description';
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Validado: { label: 'Validado', color: 'text-primary' },
  Pendiente: { label: 'Pendiente', color: 'text-amber-500' },
  Rechazado: { label: 'Rechazado', color: 'text-red-500' },
};

export function CarpetaDigital({ expedientes = [] }: Props) {
  if (expedientes.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center">
        <span
          className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          folder_open
        </span>
        <p className="text-on-surface-variant font-medium">Sin documentos</p>
        <p className="text-on-surface-variant/60 text-sm mt-1">
          Tus documentos aparecerán aquí después de verificar tu identidad
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {expedientes.map((doc) => {
          const status = STATUS_MAP[doc.estado_ocr] || STATUS_MAP.Pendiente;
          return (
            <a
              key={doc.id}
              href={doc.url_archivo_s3 || '#'}
              target={doc.url_archivo_s3 ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center gap-2 text-center active:scale-95 transition-transform duration-100 hover:border-primary/40 hover:bg-primary/5"
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: '32px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                {getIcon(doc.tipo_documento)}
              </span>
              <span className="text-body-sm font-semibold text-on-surface leading-tight">
                {doc.tipo_documento}
              </span>
              <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${status.color}`}>
                {doc.estado_ocr === 'Validado' && (
                  <span
                    className="material-symbols-outlined text-[12px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
                {status.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
