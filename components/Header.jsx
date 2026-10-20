"use client";

import Link from "next/link";
import { toko } from "@/lib/toko";
import { useKeranjang } from "@/components/KeranjangContext";

export default function Header() {
  const { totalItem, isLoaded } = useKeranjang();

  return (
    <header className="sticky top-0 z-20 border-b border-garis bg-latar/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <Link
          href="/keranjang"
          className="flex items-center gap-2 rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-semibold transition-colors hover:border-utama hover:text-utama"
        >
          <span>Keranjang</span>
          {isLoaded && totalItem > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-utama px-1.5 text-xs font-bold text-white">
              {totalItem}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
