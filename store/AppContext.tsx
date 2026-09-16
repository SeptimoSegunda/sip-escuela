"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Book, Socio, Loan, ActiveView, ActiveModal } from "@/lib/types";
import { initialBooks, initialSocios, initialLoans } from "@/lib/data";
import { formatDate } from "@/lib/utils";

interface AppContextType {
  books: Book[];
  socios: Socio[];
  loans: Loan[];
  activeView: ActiveView;
  activeModal: ActiveModal;
  selectedBook: Book | null;
  catalogSearch: string;
  loansFilter: string;
  reportMonth: string;

  setActiveView: (view: ActiveView) => void;
  openModal: (modal: ActiveModal, book?: Book) => void;
  closeModal: () => void;
  addLoan: (book: Book, socio: Socio) => void;
  returnLoan: (loanId: string) => void;
  addSocio: (socio: Omit<Socio, "id" | "estado">) => void;
  deleteSocio: (id: string) => void;
  addBook: (book: Book) => void;
  updateBookCopies: (isbn: string, delta: number) => void;
  setCatalogSearch: (term: string) => void;
  setLoansFilter: (filter: string) => void;
  setReportMonth: (month: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [socios, setSocios] = useState<Socio[]>(initialSocios);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [activeView, setActiveView] = useState<ActiveView>("inicio");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [loansFilter, setLoansFilter] = useState<string>("all");
  const [reportMonth, setReportMonth] = useState<string>("08-2026");

  const openModal = (modal: ActiveModal, book?: Book) => {
    if (book) setSelectedBook(book);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const addLoan = (book: Book, socio: Socio) => {
    const nextNum = loans.length > 0
      ? Math.max(...loans.map(l => parseInt(l.id.replace(/\D/g, "") || "1000", 10))) + 1
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
      estado: "prestado"
    };

    setLoans(prev => [newLoan, ...prev]);
    setBooks(prev =>
      prev.map(b => (b.isbn === book.isbn ? { ...b, copias: Math.max(0, b.copias - 1) } : b))
    );
    closeModal();
  };

  const returnLoan = (loanId: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    setLoans(prev =>
      prev.map(l => (l.id === loanId ? { ...l, estado: "devuelto" as const } : l))
    );

    setBooks(prev =>
      prev.map(b =>
        b.titulo.toLowerCase() === targetLoan.libro.toLowerCase()
          ? { ...b, copias: b.copias + 1 }
          : b
      )
    );
    closeModal();
  };

  const addSocio = (newSocioData: Omit<Socio, "id" | "estado">) => {
    const nextNum = socios.length > 0
      ? Math.max(...socios.map(s => parseInt(s.id.split("-")[1] || "1000", 10))) + 1
      : 1004;

    const newSocio: Socio = {
      ...newSocioData,
      id: `SOC-${nextNum}`,
      estado: "activo"
    };

    setSocios(prev => [...prev, newSocio]);
    closeModal();
  };

  const deleteSocio = (id: string) => {
    setSocios(prev => prev.filter(s => s.id !== id));
  };

  const addBook = (book: Book) => {
    setBooks(prev => [book, ...prev]);
    closeModal();
  };

  const updateBookCopies = (isbn: string, delta: number) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.isbn === isbn) {
          const newQty = Math.max(0, b.copias + delta);
          return { ...b, copias: newQty };
        }
        return b;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        books,
        socios,
        loans,
        activeView,
        activeModal,
        selectedBook,
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
        setReportMonth
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
