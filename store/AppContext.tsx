"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Book, Socio, Loan, Dano, AuditLog, NivelDano, ActiveView, ActiveModal } from "@/lib/types";
import { initialBooks, initialSocios, initialLoans } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const ADMIN_TURNO = "Turno Mañana";

interface AppContextType {
  books: Book[];
  socios: Socio[];
  loans: Loan[];
  danos: Dano[];
  auditLogs: AuditLog[];
  activeView: ActiveView;
  activeModal: ActiveModal;
  selectedBook: Book | null;
  selectedSocioId: string | null;
  catalogSearch: string;
  loansFilter: string;
  reportMonth: string;

  setActiveView: (view: ActiveView) => void;
  openModal: (modal: ActiveModal, book?: Book, socioId?: string) => void;
  closeModal: () => void;
  addLoan: (book: Book, socio: Socio) => void;
  returnLoan: (
    loanId: string,
    danoData?: {
      nivelDano: NivelDano;
      descripcion: string;
      estadoPosterior: "disponible" | "mantenimiento";
    }
  ) => void;
  addSocio: (socio: Omit<Socio, "id" | "estado">) => void;
  deleteSocio: (id: string) => void;
  addBook: (book: Book) => void;
  updateBookCopies: (isbn: string, delta: number) => void;
  setCatalogSearch: (term: string) => void;
  setLoansFilter: (filter: string) => void;
  setReportMonth: (month: string) => void;
  addDano: (data: Omit<Dano, "id" | "fechaHora" | "registradoPor">) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const addLog = (
  logs: AuditLog[],
  categoria: AuditLog["categoria"],
  accion: string,
  descripcion: string
): AuditLog[] => {
  const newLog: AuditLog = {
    id: `AUD-${Date.now()}`,
    fechaHora: new Date().toLocaleString("es-AR"),
    administrador: ADMIN_TURNO,
    categoria,
    accion,
    descripcion,
  };
  return [newLog, ...logs];
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [socios, setSocios] = useState<Socio[]>(initialSocios);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [danos, setDanos] = useState<Dano[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("inicio");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedSocioId, setSelectedSocioId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [loansFilter, setLoansFilter] = useState<string>("all");
  const [reportMonth, setReportMonth] = useState<string>("08-2026");

  const openModal = (modal: ActiveModal, book?: Book, socioId?: string) => {
    if (book) setSelectedBook(book);
    if (socioId) setSelectedSocioId(socioId);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedSocioId(null);
  };

  const addLoan = (book: Book, socio: Socio) => {
    const nextNum =
      loans.length > 0
        ? Math.max(...loans.map((l) => parseInt(l.id.replace(/\D/g, "") || "1000", 10))) + 1
        : 1096;

    const now = new Date();
    const limitDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const newLoan: Loan = {
      id: `#P-${nextNum}`,
      libro: book.titulo,
      socioId: socio.id,
      socioNombre: `${socio.apellido}, ${socio.nombre}`,
      fechaPrestamo: formatDate(now),
      fechaLimite: formatDate(limitDate),
      estado: "prestado",
    };

    setLoans((prev) => [newLoan, ...prev]);
    setBooks((prev) =>
      prev.map((b) => (b.isbn === book.isbn ? { ...b, copias: Math.max(0, b.copias - 1) } : b))
    );
    setAuditLogs((prev) =>
      addLog(prev, "Préstamos", "Nuevo préstamo", `"${book.titulo}" prestado a ${socio.apellido}, ${socio.nombre}`)
    );
    closeModal();
  };

  const returnLoan = (
    loanId: string,
    danoData?: {
      nivelDano: NivelDano;
      descripcion: string;
      estadoPosterior: "disponible" | "mantenimiento";
    }
  ) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, estado: "devuelto" as const } : l))
    );

    setBooks((prev) =>
      prev.map((b) =>
        b.titulo.toLowerCase() === targetLoan.libro.toLowerCase()
          ? { ...b, copias: danoData?.estadoPosterior === "mantenimiento" ? b.copias : b.copias + 1 }
          : b
      )
    );

    if (danoData) {
      const socio = socios.find((s) => s.id === targetLoan.socioId);
      const newDano: Dano = {
        id: `DAN-${Date.now()}`,
        libroTitulo: targetLoan.libro,
        socioId: targetLoan.socioId,
        socioNombre: targetLoan.socioNombre,
        nivelDano: danoData.nivelDano,
        descripcion: danoData.descripcion,
        estadoPosterior: danoData.estadoPosterior,
        fechaHora: new Date().toLocaleString("es-AR"),
        registradoPor: ADMIN_TURNO,
      };
      setDanos((prev) => [newDano, ...prev]);
      setAuditLogs((prev) =>
        addLog(
          prev,
          "Daños",
          "Daño registrado en devolución",
          `${danoData.nivelDano} en "${targetLoan.libro}" por ${socio ? `${socio.apellido}, ${socio.nombre}` : targetLoan.socioNombre}`
        )
      );
    }

    setAuditLogs((prev) =>
      addLog(prev, "Préstamos", "Devolución registrada", `"${targetLoan.libro}" devuelto por ${targetLoan.socioNombre}`)
    );
    closeModal();
  };

  const addSocio = (newSocioData: Omit<Socio, "id" | "estado">) => {
    const nextNum =
      socios.length > 0
        ? Math.max(...socios.map((s) => parseInt(s.id.split("-")[1] || "1000", 10))) + 1
        : 1004;

    const newSocio: Socio = {
      ...newSocioData,
      id: `SOC-${nextNum}`,
      estado: "activo",
    };

    setSocios((prev) => [...prev, newSocio]);
    setAuditLogs((prev) =>
      addLog(prev, "Socios", "Socio registrado", `${newSocio.apellido}, ${newSocio.nombre} (${newSocio.tipo})`)
    );
    closeModal();
  };

  const deleteSocio = (id: string) => {
    const s = socios.find((s) => s.id === id);
    setSocios((prev) => prev.filter((s) => s.id !== id));
    if (s)
      setAuditLogs((prev) =>
        addLog(prev, "Socios", "Socio eliminado", `${s.apellido}, ${s.nombre} (${s.id})`)
      );
  };

  const addBook = (book: Book) => {
    setBooks((prev) => [book, ...prev]);
    setAuditLogs((prev) =>
      addLog(prev, "Libros", "Libro agregado al catálogo", `"${book.titulo}" — ISBN: ${book.isbn}`)
    );
    closeModal();
  };

  const updateBookCopies = (isbn: string, delta: number) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.isbn === isbn) {
          const newQty = Math.max(0, b.copias + delta);
          return { ...b, copias: newQty };
        }
        return b;
      })
    );
  };

  const addDano = (data: Omit<Dano, "id" | "fechaHora" | "registradoPor">) => {
    const newDano: Dano = {
      ...data,
      id: `DAN-${Date.now()}`,
      fechaHora: new Date().toLocaleString("es-AR"),
      registradoPor: ADMIN_TURNO,
    };
    setDanos((prev) => [newDano, ...prev]);

    if (data.estadoPosterior === "mantenimiento") {
      setBooks((prev) =>
        prev.map((b) =>
          b.titulo.toLowerCase() === data.libroTitulo.toLowerCase()
            ? { ...b, copias: Math.max(0, b.copias - 1) }
            : b
        )
      );
    }

    setAuditLogs((prev) =>
      addLog(
        prev,
        "Daños",
        "Daño registrado manualmente",
        `${data.nivelDano} en "${data.libroTitulo}" atribuido a ${data.socioNombre}`
      )
    );
    closeModal();
  };

  return (
    <AppContext.Provider
      value={{
        books,
        socios,
        loans,
        danos,
        auditLogs,
        activeView,
        activeModal,
        selectedBook,
        selectedSocioId,
        catalogSearch,
        loansFilter,
        reportMonth,
        setActiveView,
        openModal,
        closeModal,
        addLoan,
        returnLoan,
        addSocio,
        deleteSocio,
        addBook,
        updateBookCopies,
        setCatalogSearch,
        setLoansFilter,
        setReportMonth,
        addDano,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp debe utilizarse dentro de un AppProvider");
  return context;
};
