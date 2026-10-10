# Changelog — Migración dashUpdate → SIPnr

## [0.2.0] — 2026-10-10 · Paridad funcional con dashUpdate

### Resumen
Implementación de todas las funcionalidades y esquemas del `dashUpdate` (HTML/JS vanilla) que faltaban en el proyecto `SIPnr` (Next.js/React/TypeScript).

---

## Nuevos Archivos Creados

### Modales

#### `ModalFichaLibro.tsx` + `ModalFichaLibro.module.css`
- **Ficha completa del libro** con 5 secciones de metadatos:
  - 🗂 Identificación e Inventario (ISBN, Ubicación, CDU, Librística)
  - 🖨 Publicación y Autor (Editorial, Año, Lugar, Edición)
  - 🏷 Clasificación y Extensión (Categoría, Páginas, Temas, Término Materia)
  - 🏛 Colecciones (Personal, Institucional, Tomo)
  - 📄 Notas (Nota General, Estado Físico)
- **Control de copias** — botones Aumentar / Disminuir con lógica de selección
- **Duplicar libro** — abre `ModalLibro` pre-cargado
- **Historial de préstamos del libro** — tabla reactiva con todos los movimientos
- Portada preview si `portadaUrl` está definida

#### `ModalBusquedaAsistida.tsx` + `ModalBusquedaAsistida.module.css`
- Modal estilo **Aguapey** con 4 filas de criterios de búsqueda
- Operadores booleanos por fila: **OR / AND / NOT** (selección visual)
- Campos: Nombre/autor, Título, Tema, Inventario, ISBN, Categoría, Cualquier campo
- Opción **"Truncar términos"** y botón **Limpiar**
- Filtra sobre `dash.libros` y pasa resultados a `ViewCatalogo`

#### `ModalExpedienteSocio.tsx` + `ModalExpedienteSocio.module.css`
- **Expediente disciplinario completo** del alumno/docente
- Banner del socio con nombre, tipo, año/turno y badge crítico
- **Grid de 4 estadísticas**: Total, Leves, Moderados, Catastróficos
- Indicador de **severidad máxima** registrada
- **Tabla cronológica** de todos los daños atribuidos al socio
- Botón **Imprimir Expediente** (`window.print()`)
- Estado vacío con mensaje si el socio no tiene antecedentes

---

## Archivos Modificados

### `src/hooks/useLibros.ts`
- ➕ Nueva función `disminuirCopia(libroId)` — elimina la última copia disponible

### `src/hooks/useDashboard.ts`
- ➕ Expone `incrementarCopia` y `disminuirCopia` en el retorno del hook

### `src/app/dashboard/DashboardClient.tsx`
- ➕ Importa y monta: `ModalFichaLibro`, `ModalBusquedaAsistida`, `ModalExpedienteSocio`
- ➕ Nuevos estados en `ModalState`: `fichaLibro`, `busquedaAsistida`, `expedienteSocio`
- ➕ Estado `catalogFilter: Libro[] | null` para resultados de búsqueda asistida
- ➕ `onVerDetalle` en ViewCatalogo abre `ModalFichaLibro`
- ➕ `onVerDetalle` en ViewDanos abre `ModalExpedienteSocio`

### `src/components/dashboard/views/ViewCatalogo.tsx`
- ➕ Nuevas props: `filtroActivo?`, `onLimpiarFiltro?`
- ➕ **Columna "Portada"** — miniatura 36×48px o placeholder 📚
- ➕ **Banner "Filtro activo"** con botón "Limpiar filtro"

### `src/components/dashboard/views/ViewCatalogo.module.css`
- ➕ Estilos para portada en tabla: `.tituloConPortada`, `.portadaThumb`, `.portadaPlaceholder`
- ➕ Estilos para filtro asistido: `.filtroActivoBanner`, `.btnLimpiarFiltro`

---

## Estado de Paridad con dashUpdate

| Funcionalidad | dashUpdate | SIPnr v0.1 | SIPnr v0.2 |
|---|---|---|---|
| Ficha completa del libro (5 secciones) | ✅ | ❌ | ✅ |
| Control de copias (+/-) | ✅ | ❌ | ✅ |
| Historial de préstamos por libro | ✅ | ❌ | ✅ |
| Duplicar libro | ✅ | ❌ | ✅ |
| Búsqueda Asistida Aguapey (OR/AND/NOT) | ✅ | ❌ | ✅ |
| Portada en tabla del catálogo | ✅ | ❌ | ✅ |
| Expediente de Socio con estadísticas | ✅ | ❌ | ✅ |
| Imprimir Expediente | ✅ | ❌ | ✅ |
| Buscador en Préstamos | ❌ | ✅ | ✅ |
| Buscador en Socios | ❌ | ✅ | ✅ |
| Fecha vencida resaltada | ❌ | ✅ | ✅ |
| Icono de turno dinámico (sol/luna) | ❌ | ✅ | ✅ |

> **✅ Paridad total alcanzada** con `dashUpdate`.
