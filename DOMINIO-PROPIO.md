# Dominio propio para STESIN

La web ya está lista para usar un dominio institucional. Esta configuración no se puede hacer solo con código: requiere que compres o controles un dominio, por ejemplo `stesin.edu.pe`.

1. En Netlify abre **Domain management** y selecciona **Add a domain**.
2. Escribe el dominio que hayas comprado y sigue las instrucciones de Netlify.
3. En la empresa donde compraste el dominio, crea los registros DNS que Netlify te mostrará.
4. Espera la validación del certificado HTTPS (puede tardar desde minutos hasta 24 horas).
5. En Supabase, agrega el nuevo dominio en **Authentication > URL Configuration > Site URL** y en las redirecciones permitidas.

No cambies el enlace actual de Netlify hasta que el nuevo dominio funcione. El sitio seguirá disponible mientras se valida.
