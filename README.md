# NovaCore Credit · Sitio web

Sitio de NovaCore Credit (reparación de crédito para la comunidad hispana en EE. UU.), en español e inglés.

## Páginas

| Ruta | Qué es |
|---|---|
| `/` y `/en` | Landing page |
| `/inscripcion` y `/en/enroll` | Formulario de inscripción en 3 pasos (datos, documentos, acuerdo y pago) |
| `/privacidad` y `/en/privacy` | Política de privacidad |
| `/agendar` | Calendario para agendar la consulta gratis (GoHighLevel) |

## Cómo funciona por dentro

- **Sitio:** TanStack Start + React + Tailwind CSS v4.
- **Inscripciones:** se guardan en Supabase.
  - El número de Seguro Social va cifrado.
  - Los documentos se guardan en un almacenamiento privado.
- **Copia en PDF:** al terminar, el cliente descarga su copia (con el SSN oculto).
- **Avisos a NovaCore:** la función de Supabase `inscripciones` (`supabase/functions/inscripciones`) hace cuatro cosas:
  - arma el PDF completo de cada inscripción;
  - avisa al workflow de GoHighLevel;
  - deja una nota con el enlace al PDF en el contacto;
  - reenvía los prospectos que llenan solo el primer paso.
- **Base de datos:** las migraciones están en `supabase/migrations`.

## Desarrollo local

```sh
bun install
bun run dev
```

El sitio queda en http://localhost:8080.
