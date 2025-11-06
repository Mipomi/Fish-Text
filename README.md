# 🎣 Text-Based Fishing RPG (Client-Side HTML/JS)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/yourreponame?style=social)](https://github.com/yourusername/yourreponame/stargazers)

> **Sebuah permainan simulasi memancing berbasis teks sederhana yang berjalan sepenuhnya di sisi klien (browser). Lemparkan pancing, tunggu gigitan, tingkatkan joran, dan jual tangkapanmu untuk menjadi pemancing legendaris!**

---

## ✨ Fitur Utama

* **Sistem Login Akun Unik:** Pemain dapat membuat akun hanya dengan *username*. Data disimpan secara terpisah di **Local Storage** browser per akun, mencegah bentrokan data.
* **Penyimpanan Persisten:** Data pemain (uang, inventori, joran) otomatis tersimpan dan bertahan selama 7 hari tanpa *login* ulang.
* **Probabilitas Joran:** Status joran (`Rod Stats`) sangat memengaruhi peluang penangkapan. Joran dengan *bonus* tinggi lebih mungkin menarik ikan langka (Rare/Legendary).
* **Mekanisme Pancing Dinamis:** Hanya menggunakan satu tombol yang berfungsi ganda sebagai "Pancing" dan "Angkat Pancing" saat ikan menggigit.
* **Manajemen Inventori:** Fitur jual per tangkapan dan "Jual Semua" (dengan perlindungan *favorit*).
* **Toko Joran:** Beli joran yang lebih baik untuk meningkatkan peluang sukses dan menangkap ikan langka.

---

## ⚙️ Cara Bermain

1.  **Akses:** Klik <a href="https://mipomi.github.io/Fish-Text/">di sini</a> untuk memulai permainan.
2.  **Login:** Masukkan *username* unik Anda untuk masuk atau membuat akun baru.
3.  **Memancing:** Klik tombol **"Pancing 🎣"** dan tunggu hingga status berubah menjadi "Ada gigitan!".
4.  **Menangkap:** Ketika ada gigitan, klik tombol (yang sekarang berbunyi **"Angkat Pancing ⬆️"**) secepat mungkin! Keberhasilan bergantung pada peluang dasar joran Anda.
5.  **Ekonomi:** Kumpulkan ikan di **Inventori**, tandai ikan favorit, dan jual ikan yang tidak diinginkan untuk mendapatkan uang.
6.  **Upgrade:** Gunakan uang untuk membeli Joran yang lebih kuat di **Toko** untuk mendapatkan bonus peluang menangkap ikan langga.

---

## 🛠️ Teknologi yang Digunakan

* **HTML5:** Struktur dasar antarmuka.
* **CSS3:** Styling sederhana.
* **Vanilla JavaScript:** Seluruh logika game, RNG berbasis probabilitas, dan manajemen data Local Storage.

---

## 🔑 Hak Cipta (Copyright)

© 2025 12s. Semua hak dilindungi.

---

## 🚀 Kontribusi

Merasa tertantang? Jika Anda tertarik untuk meningkatkan proyek ini, Anda dapat:

1.  *Fork* repositori ini.
2.  Buat *branch* baru (`git checkout -b fitur/nama-fitur`).
3.  *Commit* perubahan Anda (`git commit -m 'Tambahkan: fitur keren'`).
4.  *Push* ke *branch* (`git push origin fitur/nama-fitur`).
5.  Buat **Pull Request** baru!

