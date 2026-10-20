"use client";

import { useActionState, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FormProduk({ produk = {}, action, labelTombol }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [preview, setPreview] = useState(produk.foto_url || "");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <form action={formAction} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {state.error}
        </div>
      )}

      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />

      {/* Input File Foto untuk Supabase Storage */}
      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        <label htmlFor="input-foto">Upload foto produk</label>
        <input
          id="input-foto"
          type="file"
          name="foto"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1 file:text-sm file:font-semibold file:text-teks hover:file:bg-garis focus:border-utama focus:outline-none"
        />
        <span className="text-xs font-normal text-teks-lembut">
          Format: JPG, PNG, WEBP, atau SVG. Maksimal 2 MB.
        </span>
      </div>

      {preview && (
        <div className="flex items-center gap-3 rounded-lg border border-garis bg-permukaan p-2">
          <img
            src={preview}
            alt="Pratinjau foto produk"
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div className="text-xs text-teks-lembut">
            <p className="font-semibold text-teks">Pratinjau foto</p>
            <p>Foto akan diunggah ke storage dan ditampilkan di katalog.</p>
          </div>
        </div>
      )}

      <Input
        label="Link foto (opsional, jika tidak upload file)"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      <Input label="Deskripsi" name="deskripsi" textarea defaultValue={produk.deskripsi} />

      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
