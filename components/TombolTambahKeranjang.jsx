"use client";

import { useState } from "react";
import { useKeranjang } from "@/components/KeranjangContext";

export default function TombolTambahKeranjang({ produk }) {
  const { tambahItem } = useKeranjang();
  const [sukses, setSukses] = useState(false);

  const handleTambah = () => {
    tambahItem(produk, 1);
    setSukses(true);
    setTimeout(() => {
      setSukses(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleTambah}
      className="inline-flex w-full items-center justify-center rounded-lg border border-garis bg-latar px-5 py-3 font-semibold text-teks transition-colors hover:border-utama hover:text-utama sm:w-auto"
    >
      {sukses ? "✓ Berhasil ditambahkan" : "Tambah ke keranjang"}
    </button>
  );
}

