'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useDashboard }    from '@/hooks/useDashboard';
import DashboardHeader     from '@/components/dashboard/layout/DashboardHeader';
import Sidebar, { type ViewId } from '@/components/dashboard/layout/Sidebar';
import DashboardFooter     from '@/components/dashboard/layout/DashboardFooter';
import ViewInicio          from '@/components/dashboard/views/ViewInicio';
import ViewCatalogo        from '@/components/dashboard/views/ViewCatalogo';
import ViewPrestamos       from '@/components/dashboard/views/ViewPrestamos';
import ViewSocios          from '@/components/dashboard/views/ViewSocios';
import ViewDanos           from '@/components/dashboard/views/ViewDanos';
import ViewAuditoria       from '@/components/dashboard/views/ViewAuditoria';
import ModalSocio          from '@/components/dashboard/modals/ModalSocio';
import ModalLibro          from '@/components/dashboard/modals/ModalLibro';
import ModalFichaLibro     from '@/components/dashboard/modals/ModalFichaLibro';
import ModalBusquedaAsistida from '@/components/dashboard/modals/ModalBusquedaAsistida';
import ModalPrestamo       from '@/components/dashboard/modals/ModalPrestamo';
import ModalDevolucion     from '@/components/dashboard/modals/ModalDevolucion';
import ModalDano           from '@/components/dashboard/modals/ModalDano';
import ModalExpedienteSocio from '@/components/dashboard/modals/ModalExpedienteSocio';
import type { Socio, Libro } from '@/types';
import { loadSeedData } from '@/lib/seedData';
import styles from './page.module.css';

/* Precargar datos de ejemplo si localStorage está vacío */
if (typeof window !== 'undefined') loadSeedData();


/* ── Estado de modales ── */
type ModalState =
  | { type: 'none' }
  | { type: 'nuevaSocio' }
  | { type: 'editarSocio'; socio: Socio }
  | { type: 'nuevoLibro' }
  | { type: 'editarLibro'; libro: Libro }
  | { type: 'fichaLibro'; libro: Libro }
  | { type: 'busquedaAsistida' }
  | { type: 'nuevoPrestamo' }
  | { type: 'devolucion' }
  | { type: 'nuevoDano' }
  | { type: 'expedienteSocio'; socioId: string };

export default function DashboardPage() {
  const sesion        = useRequireAuth();
  const [activeView, setActiveView] = useState<ViewId>('viewInicio');
  const [modal, setModal]           = useState<ModalState>({ type: 'none' });
  /* Para búsqueda asistida: libros filtrados que se pasan a ViewCatalogo */
  const [catalogFilter, setCatalogFilter] = useState<Libro[] | null>(null);
  const dash          = useDashboard();

  const closeModal = () => setModal({ type: 'none' });

  if (!sesion) {
    return (
      <div className={styles.loadingScreen}>
        <span className={styles.loadingSpinner} aria-hidden="true" />
        <p>Verificando sesión...</p>
      </div>
    );
  }

  /* ── Render de la vista activa ── */
  function renderView() {
    switch (activeView) {
      case 'viewInicio':
        return (
          <ViewInicio
            libros={dash.libros}
            prestamos={dash.prestamos}
            danos={dash.danos}
            auditLogs={dash.auditLogs}
          />
        );
      case 'viewCatalogo':
        return (
          <ViewCatalogo
            libros={catalogFilter ?? dash.libros}
            onNuevoLibro={() => setModal({ type: 'nuevoLibro' })}
            onEditar={(l) => setModal({ type: 'editarLibro', libro: l })}
            onVerDetalle={(l) => setModal({ type: 'fichaLibro', libro: l })}
            onEliminar={(ids) => { dash.eliminarLibros(ids); setCatalogFilter(null); }}
            onBusquedaAsistida={() => setModal({ type: 'busquedaAsistida' })}
            filtroActivo={catalogFilter !== null}
            onLimpiarFiltro={() => setCatalogFilter(null)}
          />
        );
      case 'viewPrestamos':
        return (
          <ViewPrestamos
            prestamos={dash.prestamos}
            onNuevoPrestamo={() => setModal({ type: 'nuevoPrestamo' })}
            onDevolucion={() => setModal({ type: 'devolucion' })}
          />
        );
      case 'viewSocios':
        return (
          <ViewSocios
            socios={dash.socios}
            onNuevo={() => setModal({ type: 'nuevaSocio' })}
            onEditar={(s) => setModal({ type: 'editarSocio', socio: s })}
            onEliminar={(id) => dash.eliminarSocio(id)}
          />
        );
      case 'viewDanos':
        return (
          <ViewDanos
            danos={dash.danos}
            socios={dash.socios}
            onRegistrarDano={() => setModal({ type: 'nuevoDano' })}
            onVerDetalle={(socioId) => setModal({ type: 'expedienteSocio', socioId })}
          />
        );
      case 'viewAuditoria':
        return <ViewAuditoria logs={dash.auditLogs} />;
      default:
        return null;
    }
  }

  /* ── Prestamos activos para la devolución ── */
  const prestamosActivos = dash.prestamos.filter(
    (p) => p.estado === 'prestado' || p.estado === 'moroso'
  );

  return (
    <div className={styles.dashboardWrapper}>
      <DashboardHeader sesion={sesion} />

      <div className={styles.dashboardContainer}>
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <main className={styles.mainContent}>{renderView()}</main>
      </div>

      <DashboardFooter />

      {/* ── Modales ── */}

      <ModalSocio
        open={modal.type === 'nuevaSocio' || modal.type === 'editarSocio'}
        onClose={closeModal}
        socioEditar={modal.type === 'editarSocio' ? modal.socio : null}
        onGuardar={(data) => {
          if (modal.type === 'editarSocio') {
            dash.editarSocio(modal.socio.id, data);
          } else {
            dash.crearSocio(data);
          }
        }}
      />

      {/* Modal básico de creación/edición rápida */}
      <ModalLibro
        open={modal.type === 'nuevoLibro' || modal.type === 'editarLibro'}
        onClose={closeModal}
        libroEditar={modal.type === 'editarLibro' ? modal.libro : null}
        onGuardar={(data) => {
          if (modal.type === 'editarLibro') {
            dash.editarLibro(modal.libro.id, data);
          } else {
            dash.crearLibro(data);
          }
        }}
      />

      {/* Modal de ficha completa con control de copias e historial */}
      <ModalFichaLibro
        open={modal.type === 'fichaLibro'}
        onClose={closeModal}
        libro={modal.type === 'fichaLibro' ? modal.libro : null}
        prestamos={dash.prestamos}
        onGuardar={(libroId, data) => dash.editarLibro(libroId, data)}
        onIncrementarCopia={(libroId) => dash.incrementarCopia(libroId)}
        onDisminuirCopia={(libroId) => dash.disminuirCopia(libroId)}
        onDuplicar={(libro) => { closeModal(); setModal({ type: 'nuevoLibro' }); void libro; }}
      />

      {/* Modal de búsqueda asistida Aguapey */}
      <ModalBusquedaAsistida
        open={modal.type === 'busquedaAsistida'}
        onClose={closeModal}
        libros={dash.libros}
        onResultados={(resultados) => {
          setCatalogFilter(resultados);
          setActiveView('viewCatalogo');
        }}
      />

      <ModalPrestamo
        open={modal.type === 'nuevoPrestamo'}
        onClose={closeModal}
        libros={dash.libros}
        socios={dash.socios}
        onRegistrar={(libroId, copiaId, socioId) => {
          const libro = dash.libros.find((l) => l.id === libroId);
          const socio = dash.socios.find((s) => s.id === socioId);
          if (libro && socio) dash.crearPrestamo({ libro, copiaId, socio });
        }}
      />

      <ModalDevolucion
        open={modal.type === 'devolucion'}
        onClose={closeModal}
        prestamosActivos={prestamosActivos}
        onConfirmar={(prestamoId, dano) =>
          dash.registrarDevolucion({ prestamoId, dano })
        }
      />

      <ModalDano
        open={modal.type === 'nuevoDano'}
        onClose={closeModal}
        libros={dash.libros}
        socios={dash.socios}
        onRegistrar={(data) => dash.registrarDano(data)}
      />

      {/* Modal Expediente de Socio */}
      <ModalExpedienteSocio
        open={modal.type === 'expedienteSocio'}
        onClose={closeModal}
        socioId={modal.type === 'expedienteSocio' ? modal.socioId : null}
        socios={dash.socios}
        danos={dash.danos}
      />
    </div>
  );
}
