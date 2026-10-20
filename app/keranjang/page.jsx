"use client";

import Link from "next/link";
import { useKeranjang } from "@/components/KeranjangContext";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import Tombol from "@/components/Tombol";

export default function HalamanKeranjang() {
  const { items, isLoaded, ubahJumlah, hapusItem, kosongkanKeranjang, totalItem, totalHarga } =
    useKeranjang();

  if (!isLoaded) {
    return (
      <div className="py-16 text-center text-teks-lembut">
        <p>Memuat keranjang...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-permukaan text-2xl text-teks-lembut">
          🛒
        </div>
        <h1 className="text-2xl font-extrabold">Keranjang belanja masih kosong</h1>
        <p className="max-w-sm text-sm text-teks-lembut">
          Kamu belum menambahkan produk apa pun ke keranjang. Silakan pilih produk dari katalog kami.
        </p>
        <Tombol href="/">Mulai belanja</Tombol>
      </div>
    );
  }

  // Format pesan WhatsApp untuk semua item dalam keranjang
  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const daftarTeks = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.nama} (${item.jumlah}x) - ${formatRupiah(item.harga * item.jumlah)}`
    )
    .join("\n");
  const pesan = `Halo ${toko.nama}, saya ingin memesan:\n\n${daftarTeks}\n\nTotal: ${formatRupiah(totalHarga)}`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="py-8 md:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Keranjang Belanja</h1>
          <p className="mt-1 text-sm text-teks-lembut">
            {totalItem} produk di keranjang
          </p>
        </div>
        <button
          type="button"
          onClick={kosongkanKeranjang}
          className="text-sm font-semibold text-teks-lembut hover:text-bahaya"
        >
          Kosongkan keranjang
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Daftar Item */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-garis bg-latar p-4 sm:flex-row sm:items-center"
            >
              <img
                src={item.foto_url}
                alt={item.nama}
                className="aspect-square w-20 rounded-xl border border-garis bg-permukaan object-cover"
              />
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-xs text-teks-lembut">{item.kategori}</p>
                <Link
                  href={`/produk/${item.id}`}
                  className="font-semibold leading-snug hover:text-utama"
                >
                  {item.nama}
                </Link>
                <p className="text-sm text-teks-lembut">
                  {formatRupiah(item.harga)}
                </p>
              </div>

              {/* Kontrol Jumlah */}
              <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                <div className="flex items-center rounded-lg border border-garis bg-permukaan">
                  <button
                    type="button"
                    onClick={() => ubahJumlah(item.id, -1)}
                    className="flex h-8 w-8 items-center justify-center font-bold text-teks hover:bg-latar"
                    aria-label={`Kurangi ${item.nama}`}
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold">
                    {item.jumlah}
                  </span>
                  <button
                    type="button"
                    onClick={() => ubahJumlah(item.id, 1)}
                    className="flex h-8 w-8 items-center justify-center font-bold text-teks hover:bg-latar"
                    aria-label={`Tambah ${item.nama}`}
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-harga">
                    {formatRupiah(item.harga * item.jumlah)}
                  </p>
                  <button
                    type="button"
                    onClick={() => hapusItem(item.id)}
                    className="mt-1 text-xs text-teks-lembut hover:text-bahaya"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan Belanja */}
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-5 rounded-2xl border border-garis bg-permukaan p-6">
            <h2 className="text-lg font-bold">Ringkasan Pesanan</h2>

            <div className="flex flex-col gap-2 border-b border-garis pb-4 text-sm text-teks-lembut">
              <div className="flex justify-between">
                <span>Total barang</span>
                <span className="font-semibold text-teks">{totalItem} item</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-teks">
                  {formatRupiah(totalHarga)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-base">
              <span className="font-bold">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-harga">
                {formatRupiah(totalHarga)}
              </span>
            </div>

            {/* Tombol Pesan Semua via WhatsApp */}
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap"
            >
              Pesan semua via WhatsApp
            </a>

            <Link
              href="/"
              className="text-center text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
            >
              Lanjut belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

