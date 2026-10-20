"use client";

import { createContext, useContext, useState, useEffect } from "react";

const KeranjangContext = createContext(null);

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ambil data keranjang dari localStorage saat pertama kali dimuat
  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem("katalog_keranjang");
      if (tersimpan) {
        setItems(JSON.parse(tersimpan));
      }
    } catch {
      // Abaikan jika ada error parsing
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Simpan perubahan keranjang ke localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("katalog_keranjang", JSON.stringify(items));
      } catch {
        // Abaikan jika localStorage penuh atau tidak tersedia
      }
    }
  }, [items, isLoaded]);

  const tambahItem = (produk, jumlah = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === produk.id);
      if (index !== -1) {
        const baru = [...prev];
        baru[index] = {
          ...baru[index],
          jumlah: baru[index].jumlah + jumlah,
        };
        return baru;
      }
      return [
        ...prev,
        {
          id: produk.id,
          nama: produk.nama,
          harga: produk.harga,
          foto_url: produk.foto_url,
          kategori: produk.kategori,
          jumlah,
        },
      ];
    });
  };

  const ubahJumlah = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const hasil = item.jumlah + delta;
            return hasil > 0 ? { ...item, jumlah: hasil } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const hapusItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const kosongkanKeranjang = () => {
    setItems([]);
  };

  const totalItem = items.reduce((acc, item) => acc + item.jumlah, 0);
  const totalHarga = items.reduce((acc, item) => acc + item.harga * item.jumlah, 0);

  return (
    <KeranjangContext.Provider
      value={{
        items,
        isLoaded,
        tambahItem,
        ubahJumlah,
        hapusItem,
        kosongkanKeranjang,
        totalItem,
        totalHarga,
      }}
    >
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  const context = useContext(KeranjangContext);
  if (!context) {
    throw new Error("useKeranjang harus digunakan di dalam KeranjangProvider");
  }
  return context;
}

