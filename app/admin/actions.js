"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const form = formData instanceof FormData ? formData : prevState;
  const email = form?.get("email")?.toString().trim();
  const password = form?.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let pesan = error.message;
    if (pesan === "Invalid login credentials") {
      pesan = "Email atau password salah.";
    }
    return { error: pesan };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const form = formData instanceof FormData ? formData : prevState;
  const passwordBaru = form?.get("password_baru")?.toString() || "";
  const konfirmasiPassword = form?.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus masuk terlebih dahulu." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password berhasil diganti." };
}

// Helper untuk validasi dan upload file foto ke Supabase Storage di sisi server
async function prosesFoto(file, fotoUrlLama) {
  if (!file || !(file instanceof File) || file.size === 0 || file.name === "undefined") {
    return { url: fotoUrlLama || null };
  }

  // Validasi tipe file (harus gambar)
  if (!file.type || !file.type.startsWith("image/")) {
    return { error: "File harus berupa gambar (JPG, PNG, WEBP, GIF, atau SVG)." };
  }

  // Validasi ukuran maksimal (2 MB)
  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: "Ukuran foto melebihi batas maksimal 2 MB." };
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const namaFileUnik = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseServer = createServerClient();
    const { error: uploadError } = await supabaseServer.storage
      .from("produk")
      .upload(namaFileUnik, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Gagal mengunggah foto ke storage: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabaseServer.storage.from("produk").getPublicUrl(namaFileUnik);

    return { url: publicUrl };
  } catch (err) {
    return { error: `Terjadi kesalahan saat upload foto: ${err.message}` };
  }
}

export async function tambahProduk(prevState, formData) {
  const form = formData instanceof FormData ? formData : prevState;

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const nama = form?.get("nama")?.toString().trim();
  const harga = parseInt(form?.get("harga")?.toString() || "0", 10);
  const kategori = form?.get("kategori")?.toString().trim() || null;
  const deskripsi = form?.get("deskripsi")?.toString().trim() || null;
  const fotoInputUrl = form?.get("foto_url")?.toString().trim() || null;
  const fileFoto = form?.get("foto");

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga tidak boleh kosong atau bernilai negatif." };
  }

  let foto_url = fotoInputUrl;
  if (fileFoto && fileFoto instanceof File && fileFoto.size > 0) {
    const hasilFoto = await prosesFoto(fileFoto, fotoInputUrl);
    if (hasilFoto.error) {
      return { error: hasilFoto.error };
    }
    foto_url = hasilFoto.url;
  }

  const { error: insertError } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    deskripsi,
    foto_url,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function ubahProduk(prevState, formData) {
  const form = formData instanceof FormData ? formData : prevState;

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const id = form?.get("id")?.toString();
  const nama = form?.get("nama")?.toString().trim();
  const harga = parseInt(form?.get("harga")?.toString() || "0", 10);
  const kategori = form?.get("kategori")?.toString().trim() || null;
  const deskripsi = form?.get("deskripsi")?.toString().trim() || null;
  const fotoInputUrl = form?.get("foto_url")?.toString().trim() || null;
  const fileFoto = form?.get("foto");

  if (!id) {
    return { error: "ID produk tidak ditemukan." };
  }
  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga tidak boleh kosong atau bernilai negatif." };
  }

  let foto_url = fotoInputUrl;
  if (fileFoto && fileFoto instanceof File && fileFoto.size > 0) {
    const hasilFoto = await prosesFoto(fileFoto, fotoInputUrl);
    if (hasilFoto.error) {
      return { error: hasilFoto.error };
    }
    foto_url = hasilFoto.url;
  }

  const { error: updateError } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      deskripsi,
      foto_url,
    })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
