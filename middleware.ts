import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Usuarios demo que no requieren validación de BD
const DEMO_CIUDADANO_EMAILS = ['joseortegahac@gmail.com', 'jose@demo.com'];
const DEMO_ADMIN_EMAILS = ['admin@toj.gob.mx', 'contacto@toj.gob.mx', '226w0702@zongolica.tecnm.mx'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No usar getSession() — usar getUser() para validar contra el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Rutas protegidas ciudadano
  const isProtectedCiudadano =
    path.startsWith('/dashboard') ||
    path.startsWith('/pagos') ||
    path.startsWith('/perfil') ||
    path.startsWith('/ia') ||
    path.startsWith('/kyc') ||
    path.startsWith('/pagar');

  // Rutas protegidas gobierno
  const isProtectedAdmin = path.startsWith('/admin');

  // Rutas de autenticación
  const isAuthRoute =
    path.startsWith('/login') || path.startsWith('/registro');

  const isKycRoute = path.startsWith('/kyc');

  // ── Detección de Usuarios Demo ─────────────────────────────
  const userEmail = user?.email?.toLowerCase() || '';
  const isDemoCiudadano = DEMO_CIUDADANO_EMAILS.includes(userEmail);
  const isDemoAdmin = DEMO_ADMIN_EMAILS.includes(userEmail);

  // ── Lógica de Redirección y Roles ───────────────────────────
  let tipoUsuario: string | null = null;
  let ciudadanoId: string | null = user?.id ?? null;

  // Para usuarios demo, asignar rol directamente sin consultar BD
  if (isDemoAdmin) {
    tipoUsuario = 'ADMIN_GOBIERNO';
  } else if (isDemoCiudadano) {
    tipoUsuario = 'CIUDADANO';
  } else if (user) {
    // Usuario real: consultar BD
    const { data: profile } = await supabase
      .from('usuarios_plataforma')
      .select('tipo_usuario, ciudadano_id')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    
    tipoUsuario = profile?.tipo_usuario ?? null;
    ciudadanoId = profile?.ciudadano_id ?? user.id;
  }
  
  // Determinar si es gobierno o ciudadano
  const isGobierno = tipoUsuario === 'ADMIN_GOBIERNO' || tipoUsuario === 'OPERADOR_GOBIERNO';
  const isCiudadano = !isGobierno;

  // 1. Protección de rutas de ADMINISTRACIÓN
  if (isProtectedAdmin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    // Solo gobierno puede acceder a /admin
    if (!isGobierno) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // 2. Protección de rutas de CIUDADANO
  if (isProtectedCiudadano) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    
    // Evitar que admins entren al dashboard de ciudadano
    if (isGobierno) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // 3. Validación de KYC (Solo para ciudadanos reales, NO en ruta /kyc)
    // Los usuarios demo siempre pasan (su KYC está "verificado" en mock)
    if (isCiudadano && !isKycRoute && !isDemoCiudadano) {
      const { data: ciudadano } = await supabase
        .from('ciudadanos')
        .select('estado_kyc')
        .eq('id', ciudadanoId)
        .maybeSingle();

      if (ciudadano) {
        const estadoKyc = ciudadano.estado_kyc;
        
        if (estadoKyc === 'Pendiente' || estadoKyc === 'Rechazado') {
          const url = request.nextUrl.clone();
          url.pathname = '/kyc';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // 4. Redirección si ya está autenticado (Login/Registro)
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = (tipoUsuario === 'ADMIN_GOBIERNO' || tipoUsuario === 'OPERADOR_GOBIERNO') ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
