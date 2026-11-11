# Esquema Relacional — SIPnr

> Entidades principales: **Libro**, **Préstamo** y **Daño**.  
> Entidades de soporte: **Copia**, **Socio** y **AuditLog**.

---

## Diagrama ER

```mermaid
erDiagram

  LIBRO {
    string id PK
    string isbn
    string titulo
    string autor
    string categoria
    string ubicacion
    string fechaAgregado
    string edicion
    string editorial
    string clasificacion
    string fechaPublicacion
  }

  COPIA {
    string id PK
    string inventarioNum
    string estado
    string libroId FK
  }

  SOCIO {
    string id PK
    string apellido
    string nombre
    string dni
    string tipo
    string anio
    string email
    string estado
    int    prestamosActivos
    string fechaRegistro
  }

  PRESTAMO {
    string id PK
    string libroId     FK
    string libroTitulo
    string copiaId     FK
    string prestatario
    string socioId     FK
    string fechaPrestamo
    string fechaLimite
    string fechaDevolucion
    string estado
    string turnoAdmin
  }

  DANO {
    string id PK
    string libroId     FK
    string libroTitulo
    string copiaId     FK
    string responsable
    string socioId     FK
    string severidad
    string descripcion
    string fecha
    string turnoAdmin
  }

  AUDITLOG {
    string id PK
    string fecha
    string admin
    string categoria
    string accion
    string descripcion
  }

  LIBRO       ||--o{ COPIA      : "tiene"
  COPIA       ||--o{ PRESTAMO   : "es prestada en"
  COPIA       ||--o{ DANO       : "registra"
  LIBRO       ||--o{ PRESTAMO   : "referenciado en"
  LIBRO       ||--o{ DANO       : "referenciado en"
  SOCIO       ||--o{ PRESTAMO   : "toma (opcional)"
  SOCIO       ||--o{ DANO       : "responde (opcional)"
```

---

## Relaciones en detalle

### `LIBRO` → `COPIA` *(1 a N)*
Un libro puede tener **múltiples copias físicas** (cada una con su número de inventario y estado independiente).  
Las copias se almacenan embebidas en el objeto `Libro` como array `copias[]`.

---

### `COPIA` → `PRÉSTAMO` *(1 a N)*
Una copia puede haber sido prestada **varias veces** a lo largo del tiempo.  
`Prestamo.copiaId` y `Prestamo.libroId` identifican exactamente qué ejemplar físico salió.

| Campo en Préstamo | Referencia |
|---|---|
| `libroId` | `Libro.id` |
| `copiaId` | `Copia.id` (dentro de `Libro.copias`) |
| `libroTitulo` | Desnormalizado (snapshot al momento del préstamo) |

---

### `COPIA` → `DAÑO` *(1 a N)*
Una copia puede acumular **múltiples registros de daño** en el tiempo.  
`Dano.copiaId` y `Dano.libroId` identifican el ejemplar afectado.

| Campo en Daño | Referencia |
|---|---|
| `libroId` | `Libro.id` |
| `copiaId` | `Copia.id` |
| `libroTitulo` | Desnormalizado (snapshot) |

---

### `SOCIO` → `PRÉSTAMO` *(1 a N, opcional)*
Un préstamo puede estar vinculado a un socio registrado **o no**.  
`Prestamo.socioId` es opcional — permite préstamos a nombre libre (`prestatario`).

| Campo | Descripción |
|---|---|
| `socioId?` | Referencia a `Socio.id` (nullable) |
| `prestatario` | Nombre textual del receptor (siempre presente) |

---

### `SOCIO` → `DAÑO` *(1 a N, opcional)*
Un daño puede imputarse a un socio registrado **o no**.  
`Dano.socioId` es opcional — permite registrar responsables sin cuenta.

| Campo | Descripción |
|---|---|
| `socioId?` | Referencia a `Socio.id` (nullable) |
| `responsable` | Nombre textual del responsable (siempre presente) |

---

### `PRÉSTAMO` → `DAÑO` *(relación implícita)*
No existe una FK directa entre `Prestamo` y `Dano`, pero un daño se puede originar en la **devolución de un préstamo**.  
En ese caso, `useDashboard.registrarDevolucion()` llama internamente a `registrarDano()` propagando `socioId`, `libroId` y `copiaId` del préstamo.

```
Prestamo ──(devolución con daño)──► Dano
           [socioId, libroId, copiaId se copian]
```

---

### `AUDITLOG` *(entidad transversal)*
No tiene FK explícitas. Registra eventos de todas las demás entidades mediante la categoría:

| Categoría | Originado por |
|---|---|
| `Libros` | Alta / edición / eliminación de libros |
| `Préstamos` | Creación / devolución / eliminación |
| `Daños` | Registro de nuevo daño |
| `Socios` | Alta / edición / cambio de estado |
| `Sistema` | Login / logout |

---

## Estados y ciclo de vida

### Copia
```
disponible ──(préstamo)──► prestado ──(devolución)──► disponible
           └──(daño)──────► dañado
           └──(pérdida)───► perdido
```

### Préstamo
```
prestado ──(sin devolver en fecha)──► moroso
         └──(devolución)───────────► devuelto
```

### Socio
```
activo ──► suspendido ──► activo
       └──► inactivo
```

---

## Almacenamiento actual

Todos los datos persisten en **`localStorage`** mediante `storage.ts`. Las colecciones son arrays planos separados por clave:

| Clave localStorage | Entidad |
|---|---|
| `sipnr_libros` | `Libro[]` (incluye `copias[]` embebidas) |
| `sipnr_socios` | `Socio[]` |
| `sipnr_prestamos` | `Prestamo[]` |
| `sipnr_danos` | `Dano[]` |
| `sipnr_audit` | `AuditLog[]` |

> Para migrar a una base de datos externa, cada clave corresponde a una tabla.  
> Ver `db-migration-analysis.md` para el plan completo de migración.

