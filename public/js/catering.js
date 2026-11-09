(() => {
    "use strict";
    const $ = (s, root = document) => root.querySelector(s);
    const page = document.body.dataset.page;
    const admin = [
        "dashboard",
        "admin-menu",
        "admin-orders",
        "customers",
        "reports",
    ].includes(page);
    const money = (n) =>
        "Rp" + (Math.round(Number(n)) || 0).toLocaleString("id-ID");
    const esc = (s) =>
        String(s ?? "").replace(
            /[&<>"']/g,
            (c) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[c],
        );
    const read = (k, fallback) => {
        try {
            return JSON.parse(localStorage.getItem("menteng-" + k)) ?? fallback;
        } catch {
            return fallback;
        }
    };
    const save = (k, v) =>
        localStorage.setItem("menteng-" + k, JSON.stringify(v));
    const icons = {
        alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        bag: '<path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
        arrow: '<path d="m9 5 7 7-7 7"/>',
        pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        truck: '<path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
        check: '<path d="m5 12 4 4L19 6"/>',
        search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
        leaf: '<path d="M20 3C7 1 1 10 6 17s17 2 14-14ZM5 20 16 9"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3"/>',
        chart: '<path d="M4 3v18h18M8 16v-4m5 4V7m5 9V4"/>',
        maximize:
            '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
        minimize:
            '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>',
    };
    const icon = (name) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.leaf}</svg>`;
    const brand = `<a href="/" class="brand"><img src="/images/brand.svg" alt="" width="45" height="45"><span>Dapur Menteng<small>Nasi uduk & catering</small></span></a>`;
    const baseMenus = [
        {
            id: 1,
            name: "Nasi Uduk Ayam Goreng",
            category: "satuan",
            price: 25000,
            min: 1,
            image: "hero.jpg",
            desc: "Nasi uduk gurih, ayam goreng, bihun, tempe orek, sambal, dan kerupuk.",
        },
        {
            id: 2,
            name: "Nasi Uduk Telur Balado",
            category: "satuan",
            price: 18000,
            min: 1,
            image: "box.jpg",
            desc: "Nasi uduk, telur balado, bihun, tempe orek, dan kerupuk.",
        },
        {
            id: 3,
            name: "Nasi Uduk Ayam Bakar",
            category: "satuan",
            price: 28000,
            min: 1,
            image: "satuan.jpg",
            desc: "Nasi uduk, ayam bakar, tahu, lalapan segar, dan sambal.",
        },
        {
            id: 4,
            name: "Nasi Box Ayam Goreng",
            category: "box",
            price: 30000,
            min: 10,
            image: "satuan.jpg",
            desc: "Nasi uduk, ayam goreng, bihun, tempe orek, sambal, dan kerupuk dalam kemasan box.",
        },
        {
            id: 5,
            name: "Nasi Box Komplet",
            category: "box",
            price: 38000,
            min: 10,
            image: "hero.jpg",
            desc: "Nasi uduk, ayam, telur balado, bihun, tempe orek, sambal, dan kerupuk.",
        },
        {
            id: 6,
            name: "Nasi Box Telur Balado",
            category: "box",
            price: 23000,
            min: 10,
            image: "box.jpg",
            desc: "Nasi uduk dan telur balado dengan bihun, orek tempe, sambal, dan kerupuk.",
        },
        {
            id: 7,
            name: "Prasmanan Paket A",
            category: "prasmanan",
            price: 40000,
            min: 30,
            image: "prasmanan.jpg",
            desc: "Nasi uduk, ayam goreng, telur balado, tumis sayur, bihun, sambal, dan kerupuk.",
        },
        {
            id: 8,
            name: "Prasmanan Paket B",
            category: "prasmanan",
            price: 50000,
            min: 30,
            image: "hero.jpg",
            desc: "Nasi uduk, ayam bakar, rendang, sayur, bihun, sambal, dan kerupuk.",
        },
        {
            id: 9,
            name: "Prasmanan Paket Keluarga",
            category: "prasmanan",
            price: 35000,
            min: 30,
            image: "box.jpg",
            desc: "Nasi uduk dan lauk rumahan untuk acara keluarga.",
            available: false,
        },
    ].map((m) => ({ available: true, ...m }));
    const sData = window.__SERVER_DATA__ || {};
    const serverMenus =
        sData.menus && sData.menus.length
            ? sData.menus.map((m) => ({
                  id: m.id,
                  name: m.nama_menu || m.name,
                  category:
                      m.kategori?.slug ||
                      m.category?.slug ||
                      m.jenis_paket ||
                      m.package_type,
                  price: Number(m.harga || m.price),
                  min: m.minimal_pesanan || m.min_order,
                  image: m.foto_menu || m.image_path,
                  desc: m.deskripsi || m.description,
                  available: Boolean(
                      m.status_tersedia !== undefined
                          ? m.status_tersedia
                          : m.is_available,
                  ),
              }))
            : null;
    const serverCart =
        sData.items && sData.items.length
            ? sData.items.map((it) => ({
                  id: it.id_menu || it.menu_id || it.menu?.id,
                  cart_id: it.id,
                  name: it.menu?.nama_menu || it.menu?.name || it.nama_menu,
                  price: Number(it.menu?.harga || it.menu?.price || it.harga),
                  min: it.menu?.minimal_pesanan || it.menu?.min_order || 1,
                  image: it.menu?.foto_menu || it.menu?.image_path || "box.jpg",
                  qty: Number(it.kuantitas || it.quantity),
                  note: it.catatan || it.notes || "",
              }))
            : [];
    let menus = serverMenus || read("menus", baseMenus),
        cart = serverCart,
        user = sData.user
            ? {
                  id: sData.user.id,
                  name: sData.user.nama || sData.user.name || "",
                  nama: sData.user.nama || sData.user.name || "",
                  email: sData.user.email,
                  phone: sData.user.nomor_telepon || sData.user.phone || "",
                  nomor_telepon:
                      sData.user.nomor_telepon || sData.user.phone || "",
                  address: sData.user.alamat || sData.user.address || "",
                  alamat: sData.user.alamat || sData.user.address || "",
                  role: sData.user.peran || sData.user.role || "customer",
                  peran: sData.user.peran || sData.user.role || "customer",
              }
            : null;
    const menuImg = (s) =>
        !s
            ? "/images/hero.jpg"
            : s.startsWith("http") || s.startsWith("/") || s.startsWith("data:")
              ? s
              : s.startsWith("menus/") || s.includes("/")
                ? "/storage/" + s
                : "/images/" + s;
    const today = () => new Date().toLocaleDateString("en-CA");
    const tomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toLocaleDateString("en-CA");
    };
    const date = (s) =>
        new Date(s + "T12:00:00").toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    const cats = {
        satuan: "Porsi satuan",
        box: "Nasi box",
        prasmanan: "Prasmanan",
    };
    const states = [
        "Menunggu pembayaran",
        "Diproses dapur",
        "Dikirim / siap diambil",
        "Selesai",
        "Ditolak",
    ];
    const customers = [
        {
            name: "Siti Rahma",
            email: "siti@contoh.test",
            phone: "081234567890",
        },
        {
            name: "Budi Santoso",
            email: "budi@contoh.test",
            phone: "081298765432",
        },
        {
            name: "Dewi Lestari",
            email: "dewi@contoh.test",
            phone: "081355667788",
        },
        {
            name: "Andi Pratama",
            email: "andi@contoh.test",
            phone: "081388990011",
        },
    ];
    const seedOrders = [
        ["0001", 0, 4, 10, "Menunggu verifikasi", 0],
        ["0002", 1, 7, 30, "Lunas", 1],
        ["0003", 2, 8, 30, "Lunas", 2],
        ["0004", 0, 1, 4, "Ditolak", 4],
        ["0005", 0, 4, 20, "Lunas", 3],
        ["0006", 1, 8, 40, "Lunas", 3],
    ].map(([id, c, m, q, p, s], i) => {
        const menu = baseMenus.find((x) => x.id === m);
        return {
            id: "DM-261105-" + id,
            name: customers[c].name,
            email: customers[c].email,
            phone: customers[c].phone,
            date: "2026-11-" + String(5 - (i % 5)).padStart(2, "0"),
            deliveryDate: tomorrow(),
            time: "10:00",
            method: "delivery",
            address: "Jl. Cikini Raya No. 12, Menteng, Jakarta Pusat",
            items: [{ ...menu, qty: q, note: "Sambal dipisah" }],
            fee: 15000,
            payment: p,
            status: s,
            proof:
                p === "Menunggu verifikasi"
                    ? "bukti-transfer-contoh.png"
                    : null,
        };
    });
    const mapOrder = (o) =>
        !o
            ? null
            : {
                  id: o.nomor_pesanan || o.order_number || "DM-" + o.id,
                  rawId: o.id,
                  name: o.nama_penerima || o.recipient_name,
                  email:
                      o.email_penerima ||
                      o.recipient_email ||
                      o.user?.email ||
                      o.pengguna?.email ||
                      "",
                  phone: o.nomor_telepon_penerima || o.recipient_phone,
                  date: String(
                      o.tanggal_pesanan || o.order_date || o.created_at || "",
                  ).slice(0, 10),
                  deliveryDate: String(
                      o.tanggal_pengiriman || o.delivery_date || "",
                  ).slice(0, 10),
                  time: o.waktu_pengiriman || o.delivery_time || "10:00",
                  method: o.jenis_pengiriman || o.delivery_type || "delivery",
                  address:
                      o.alamat_pengiriman ||
                      o.delivery_address ||
                      "Ambil di dapur",
                  items: (o.items || []).map((it) => ({
                      id: it.id_menu || it.menu_id,
                      name: it.nama_menu || it.menu_name,
                      price: Number(it.harga || it.price),
                      qty: it.kuantitas || it.quantity,
                      note: it.catatan || it.notes || "",
                      image:
                          it.menu?.foto_menu ||
                          it.menu?.image_path ||
                          "hero.jpg",
                  })),
                  fee: Number(o.biaya_pengiriman ?? o.delivery_fee ?? 0),
                  total: Number(o.total_pembayaran ?? 0),
                  payment:
                      (o.status_pembayaran === "Menunggu Verifikasi"
                          ? "Menunggu verifikasi"
                          : o.status_pembayaran === "Menunggu Pembayaran"
                            ? "Menunggu pembayaran"
                            : o.status_pembayaran) ||
                      o.payment_status ||
                      "Menunggu pembayaran",
                  status: Number(o.status_pesanan ?? o.order_status ?? 0),
                  proof:
                      o.payment?.bukti_transfer ||
                      o.payment?.proof_image ||
                      null,
                  rejection:
                      o.payment?.catatan_penolakan ||
                      o.payment?.rejection_note ||
                      null,
                  proofData: o.proofData || null,
                  notes: o.catatan || o.notes || "",
                  bank: o.payment?.nama_bank || o.payment?.bank_name || "",
                  sender:
                      o.payment?.nama_pemilik_rekening ||
                      o.payment?.account_holder ||
                      "",
                  transferAmount: Number(
                      o.payment?.nominal_transfer ||
                          o.payment?.transfer_amount ||
                          0,
                  ),
              };
    const serverOrders = Array.isArray(sData.orders)
        ? sData.orders.map(mapOrder)
        : null;
    let orders =
        serverOrders !== null
            ? serverOrders
            : admin
              ? []
              : read("orders", seedOrders);
    if (sData.order) {
        const mo = mapOrder(sData.order);
        if (mo && !orders.some((x) => x.id === mo.id)) orders = [mo, ...orders];
    }
    let activeCategory =
        new URLSearchParams(location.search).get("kategori") || "satuan";
    if (!cats[activeCategory]) activeCategory = "satuan";
    const total = (items) => items.reduce((a, x) => a + x.price * x.qty, 0);
    const badge = (text) =>
        `<span data-status="${esc(text)}" class="badge ${text === "Lunas" || text === "Selesai" ? "success" : text === "Ditolak" ? "danger" : ""}">${esc(text)}</span>`;
    function toast(text) {
        $("#toast").textContent = text;
        $("#toast").classList.add("show");
        clearTimeout(toast.timer);
        toast.timer = setTimeout(
            () => $("#toast").classList.remove("show"),
            3500,
        );
    }
    function showModal(content) {
        $("#modal-content").innerHTML = content;
        $("#modal").showModal();
    }
    function openLightbox(src, title = "Pratinjau Foto") {
        let lb = $("#img-lightbox");
        if (!lb) {
            lb = document.createElement("div");
            lb.id = "img-lightbox";
            lb.className = "img-lightbox";
            lb.onclick = (e) => {
                if (e.target.tagName !== "IMG") lb.remove();
            };
            $("#modal").appendChild(lb);
        }
        lb.innerHTML = `<div class="lightbox-inner"><div class="lightbox-bar"><span>${esc(title)}</span><button type="button" class="icon-button" onclick="this.closest('#img-lightbox').remove()" aria-label="Tutup">✕</button></div><img src="${src}" alt="${esc(title)}"><small>Klik di luar gambar atau tombol ✕ untuk menutup</small></div>`;
    }
    function decorateAdminTables() {
        document.querySelectorAll(".admin .table-scroll").forEach((wrap) => {
            if (wrap.dataset.enhanced) return;
            wrap.dataset.enhanced = "true";
            wrap.tabIndex = 0;
            wrap.setAttribute("role", "region");
            wrap.setAttribute(
                "aria-label",
                wrap.closest("section")?.querySelector("h2")?.textContent ||
                    "Daftar data administrasi",
            );
            const hint = document.createElement("p");
            hint.className = "table-scroll-hint";
            hint.textContent =
                "Geser tabel ke samping untuk melihat semua kolom.";
            hint.hidden = true;
            wrap.before(hint);
            const observer = new ResizeObserver(() => {
                hint.hidden = wrap.scrollWidth <= wrap.clientWidth + 1;
            });
            observer.observe(wrap);
            const table = wrap.querySelector("table");
            if (table) {
                table.querySelectorAll("th").forEach((th) => {
                    if (
                        [
                            "Harga / porsi",
                            "Total tagihan",
                            "Total belanja",
                        ].includes(th.textContent)
                    )
                        th.classList.add("numeric");
                });
                observer.observe(table);
            }
        });
    }
    function header() {
        const isAdm = Boolean(
            user && (user.role === "admin" || user.peran === "admin"),
        );
        $("#site-header").innerHTML =
            `<div class="header-inner">${brand}<button class="icon-button mobile-toggle" data-action="nav" aria-label="Buka navigasi" aria-expanded="false">☰</button><nav id="navigation" aria-label="Navigasi utama">${admin ? '<span class="admin-label">Panel administrasi</span><a href="/">Lihat website</a>' : `${isAdm ? `<a href="/admin">Panel admin</a>` : ""}<a href="/" ${page === "home" ? 'aria-current="page"' : ""}>Beranda</a><a href="/menu" ${page === "catalog" ? 'aria-current="page"' : ""}>Pilihan menu</a><a href="/pesanan" ${page === "history" ? 'aria-current="page"' : ""}>Pesanan saya</a><a href="/lacak-pesanan" ${page === "tracking" ? 'aria-current="page"' : ""}>Lacak pesanan</a>`}</nav><div class="header-actions">${admin ? '<span class="avatar">A</span><span>Admin dapur</span><a class="logout-link" href="#" data-action="logout">Keluar</a>' : `<a class="cart-link" href="/keranjang" aria-label="Keranjang">${icon("bag")}<span class="cart-count">${cart.reduce((a, x) => a + x.qty, 0)}</span></a>${user ? `<span class="user-greeting">Halo, ${esc(user.name || user.nama)}</span><a class="logout-link" href="#" data-action="logout">Keluar</a>` : `<a class="login-link" href="/login">Masuk</a>`}`}</div></div>`;
        $("#site-footer").innerHTML = admin
            ? ""
            : `<div class="container footer-top"><div>${brand}<p>Masakan dari dapur kami,<br>untuk hangatnya kebersamaan Anda.</p></div><div><h3>Jelajahi & Layanan</h3><a href="/menu">Pilihan menu</a><a href="/pesanan">Pesanan saya</a><a href="/lacak-pesanan">Lacak pesanan</a><a href="/#cara-pesan">Cara pesan</a><a href="/#pengiriman">Area pengiriman</a></div><div><h3>Dapur kami</h3><p>Menteng, Jakarta Pusat<br>Delivery hingga radius 20 km<br>Pesan paling lambat H-1</p></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Dapur Menteng</span><span>Dimasak hari ini. Dinikmati bersama.</span><a href="/admin">Panel admin</a></div>`;
        if (admin) {
            document.body.classList.add("admin");
            const links = [
                ["dashboard", "/admin", "grid", "Ringkasan"],
                ["admin-menu", "/admin/menu", "leaf", "Menu & paket"],
                ["admin-orders", "/admin/pesanan", "bag", "Pesanan"],
                ["customers", "/admin/pelanggan", "users", "Pelanggan"],
                ["reports", "/admin/laporan", "chart", "Laporan penjualan"],
            ];
            $("#page-layout").insertAdjacentHTML(
                "afterbegin",
                `<aside class="sidebar"><p>Operasional dapur</p><nav aria-label="Navigasi admin">${links.map(([p, url, i, l]) => `<a href="${url}" ${page === p ? 'aria-current="page"' : ""}>${icon(i)}${l}</a>`).join("")}</nav><div class="sidebar-note">${icon("leaf")}<b>Dapur Menteng</b><span>Selamat memasak,<br>selamat melayani.</span></div></aside>`,
            );
        }
    }
    function heading(title, desc, action = "") {
        return `<div class="page-heading"><div><a class="breadcrumb" href="${admin ? "/admin" : "/"}">${admin ? "Dapur Menteng / Operasional" : "Beranda / Pemesanan"}</a><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
    }
    function steps(n) {
        return `<ol class="checkout-steps">${["Keranjang", "Checkout", "Pembayaran", "Lacak pesanan"].map((s, i) => `<li class="${i === n ? "current" : i < n ? "done" : ""}"><span>${i < n ? "✓" : i + 1}</span>${s}</li>`).join("")}</ol>`;
    }
    const button = (url, label, cls = "") =>
        `<a href="${url}" class="button ${cls}">${label}</a>`;
    function home() {
        return `<section class="hero container"><div class="hero-copy"><div class="origin">${icon("pin")} Dari dapur Menteng, Jakarta</div><h1>Ada nasi uduk.<br>Ada cerita<br>di meja makan.</h1><p>Gurih santannya, lengkap lauknya. Dari sarapan sendiri sampai hajatan keluarga, kami siapkan untuk momen Anda.</p><div class="hero-buttons">${button("/menu", "Pilih menu & pesan " + icon("arrow"))}<a class="plain-link" href="#cara-pesan">Lihat cara pesan</a></div><div class="hero-note">${icon("clock")} Dimasak di hari acara. Pesan minimal H-1.</div></div><figure class="hero-visual"><img src="/images/hero.jpg" alt="Sajian nasi uduk dengan ayam goreng, telur, sambal, dan lalapan di atas daun pisang" fetchpriority="high"><div class="food-tag">Resep rumahan.<br>Rasa yang dirindukan.<span>Sehangat makan di rumah</span></div><figcaption>${icon("leaf")} Nasi uduk & lauk pilihan</figcaption></figure></section><section class="service-strip container" aria-label="Informasi layanan"><div>${icon("leaf")}<span><b>Tiga cara menikmati</b><small>Porsi satuan, nasi box & prasmanan</small></span></div><div>${icon("truck")}<span><b>Kami antar ke tempat Anda</b><small>Hingga 20 km dari Menteng, Jakarta</small></span></div><div>${icon("bag")}<span><b>Mau ambil sendiri? Bisa.</b><small>Pick-up di dapur, tanpa ongkir</small></span></div></section><section class="section container" id="pilihan-menu"><div class="section-heading"><div><h2>Untuk setiap meja,<br>ada pilihan sajiannya.</h2><p>Makan sendiri, rapat kantor, atau kumpul satu keluarga.</p></div><a class="plain-link" href="/menu">Jelajahi semua menu ${icon("arrow")}</a></div><div class="category-grid">${[
            [
                "satuan",
                "satuan.jpg",
                "Porsi satuan",
                "Teman sarapan dan makan siang, dengan lauk yang Anda suka.",
                18000,
                1,
            ],
            [
                "box",
                "box.jpg",
                "Nasi box",
                "Rapi dalam kotak. Praktis untuk rapat, pengajian, dan berbagi.",
                23000,
                10,
            ],
            [
                "prasmanan",
                "prasmanan.jpg",
                "Prasmanan",
                "Hidangan lengkap untuk merayakan momen bersama.",
                40000,
                30,
            ],
        ]
            .map(
                ([c, img, t, d, p, m]) =>
                    `<a href="/menu?kategori=${c}" class="category-card" data-category="${c}"><div class="category-image"><img src="/images/${img}" alt="Ilustrasi sajian ${t.toLowerCase()}" loading="lazy"><span>Mulai ${m} porsi</span></div><div class="category-content"><h3>${t} ${icon("arrow")}</h3><p>${d}</p><div>Mulai <b>${money(p)}</b><small> / porsi</small></div></div></a>`,
            )
            .join(
                "",
            )}</div><p class="photo-note">Foto merupakan ilustrasi penyajian. Komposisi mengikuti menu pilihan.</p></section><section class="how-section" id="cara-pesan"><div class="container"><div class="section-heading"><h2>Anda rencanakan acaranya.<br>Kami siapkan hidangannya.</h2><p>Pesan dari rumah,<br>tenang sampai hari acara.</p></div><ol class="how-grid">${[
            [
                "Pilih menu & porsi",
                "Cari lauk favorit, tentukan porsi, lalu masukkan ke keranjang.",
            ],
            [
                "Tentukan jadwal",
                "Isi tanggal acara dan pilih diantar atau ambil di dapur.",
            ],
            [
                "Selesaikan pembayaran",
                "Transfer melalui BCA atau Mandiri, lalu unggah buktinya.",
            ],
            [
                "Tunggu hidangan Anda",
                "Pantau pesanan dari dapur hingga siap dinikmati.",
            ],
        ]
            .map(
                ([t, d], i) =>
                    `<li><span>${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`,
            )
            .join(
                "",
            )}</ol></div></section><section class="section container delivery-section" id="pengiriman"><div class="delivery-art"><div class="delivery-circle">${icon("pin")}<strong>Menteng</strong><span>Jakarta Pusat</span></div><span class="radius-label">Dari dapur, hingga 20 km</span><span class="map-place place-one">Gambir</span><span class="map-place place-two">Cikini</span><span class="map-place place-three">Tanah Abang</span></div><div><h2>Sampai di meja Anda,<br>sesuai waktunya.</h2><p>Pilih cara menerima hidangan yang paling nyaman. Semua disiapkan segar pada hari acara.</p><div class="delivery-option">${icon("truck")}<div><h3>Diantar ke lokasi</h3><p>Dalam radius 20 km dari Dapur Menteng. Ongkir dihitung saat checkout.</p></div></div><div class="delivery-option">${icon("bag")}<div><h3>Ambil langsung di dapur</h3><p>Datang sesuai tanggal dan jam pilihan Anda. Tanpa biaya pengiriman.</p></div></div></div></section><section class="container closing-cta"><div><h2>Meja sudah siap.<br>Tinggal pilih hidangannya.</h2><p>Mulai dari seporsi, sampai untuk satu acara.</p></div>${button("/menu", "Lihat pilihan menu " + icon("arrow"), "yellow")}</section>`;
    }
    function menuCard(m) {
        return `<article class="menu-card" data-category="${esc(m.category)}"><button class="menu-image" data-action="detail" data-id="${m.id}" aria-label="Lihat detail ${esc(m.name)}"><img src="${menuImg(m.image)}" alt="Ilustrasi ${esc(m.name)}" loading="lazy"><span>Min. ${m.min} porsi</span></button><div class="menu-content"><small>${cats[m.category]}</small><h2>${esc(m.name)}</h2><p>${esc(m.desc)}</p><div class="menu-price"><div><strong>${money(m.price)}</strong><small> / porsi</small></div><button class="add-button" data-action="detail" data-id="${m.id}" aria-label="Tambah ${esc(m.name)}">+</button></div></div></article>`;
    }
    function catalog() {
        const list = menus.filter(
            (m) => m.available && m.category === activeCategory,
        );
        return `<div class="container page-content">${heading("Mau makan apa hari ini?", "Pilih hidangan favorit. Kami siapkan dengan lauk yang lengkap.")}<div class="notice">${icon("clock")}<span>Pesan minimal H-1 <span class="notice-separator">|</span> Delivery hingga 20 km dari Menteng <span class="notice-separator">|</span> Tersedia pick-up</span></div><div class="catalog-toolbar"><div class="tabs" role="group" aria-label="Kategori menu">${Object.entries(
            cats,
        )
            .map(
                ([c, n]) =>
                    `<button data-action="category" data-category="${c}" aria-pressed="${activeCategory === c}">${n}</button>`,
            )
            .join(
                "",
            )}</div><label class="search-box">${icon("search")}<input id="menu-search" type="search" placeholder="Cari menu atau lauk…" aria-label="Cari menu atau lauk"></label></div><div class="menu-grid" id="menu-grid">${list.map(menuCard).join("")}</div><p class="photo-note">Foto merupakan ilustrasi penyajian. Harga per porsi; minimum pesanan berlaku untuk setiap menu.</p></div>`;
    }
    function detail(id) {
        const m = menus.find((x) => x.id === id);
        if (!m || !m.available) return;
        showModal(
            `<div class="detail-image"><img src="${menuImg(m.image)}" alt="Ilustrasi ${esc(m.name)}"></div><form id="add-form" data-id="${id}" class="detail-content"><small>${cats[m.category]}</small><h2 id="modal-title">${esc(m.name)}</h2><p>${esc(m.desc)}</p><strong class="detail-price">${money(m.price)} <small>/ porsi</small></strong><label>Jumlah porsi<input name="qty" type="number" min="${m.min}" value="${m.min}" step="1" required></label><small>Minimal pemesanan ${m.min} porsi.</small><label>Catatan untuk dapur <span>(opsional)</span><textarea name="note" placeholder="Misalnya, sambal dipisah" maxlength="500" rows="2"></textarea></label><button class="button full" type="submit">${icon("bag")} Tambah ke keranjang</button></form>`,
        );
    }
    function cartPage() {
        return `<div class="container page-content">${heading("Keranjang Anda", "Periksa porsi dan catatan sebelum kami siapkan hidangannya.")} ${steps(0)}${!cart.length ? empty("Keranjang masih kosong", "Pilih nasi uduk dan lauk favorit untuk memulai pesanan.", "/menu", "Pilih menu") : `<div class="two-column"><section class="panel cart-panel"><div class="panel-heading"><h2>Menu pilihan (${cart.length})</h2><a href="/menu" class="plain-link">Tambah menu</a></div>${cart.map((x, i) => `<article class="cart-item"><img src="${menuImg(x.image)}" alt="Ilustrasi ${esc(x.name)}"><div class="cart-item-body"><h3>${esc(x.name)}</h3><p>${money(x.price)} / porsi <span>· Min. ${x.min} porsi</span></p><div class="quantity"><button data-action="qty" data-index="${i}" data-delta="-1" aria-label="Kurangi porsi ${esc(x.name)}" ${x.qty <= x.min ? "disabled" : ""}>−</button><input type="number" value="${x.qty}" min="${x.min}" data-cart-qty="${i}" aria-label="Jumlah porsi ${esc(x.name)}"><button data-action="qty" data-index="${i}" data-delta="1" aria-label="Tambah porsi ${esc(x.name)}">+</button></div><label>Catatan dapur<textarea data-cart-note="${i}" rows="2" maxlength="500" placeholder="Sambal dipisah, misalnya">${esc(x.note)}</textarea></label><button class="text-button remove" data-action="remove" data-index="${i}">Hapus menu</button></div><b>${money(x.qty * x.price)}</b></article>`).join("")}</section>${summary(cart, 0, button("/checkout", "Lanjut ke checkout " + icon("arrow"), "full"), true)}</div>`}</div>`;
    }
    function empty(t, d, url, label) {
        return `<div class="empty-state">${icon("bag")}<h2>${t}</h2><p>${d}</p>${url ? button(url, label) : ""}</div>`;
    }
    function summary(items, fee, action, temporary = false) {
        return `<aside class="panel summary"><h2>Ringkasan pesanan</h2>${items.map((x) => `<div class="summary-row"><span>${esc(x.name)}<small>${x.qty} × ${money(x.price)}</small></span><b>${money(x.qty * x.price)}</b></div>`).join("")}<hr><div class="summary-row"><span>Subtotal menu</span><span>${money(total(items))}</span></div><div class="summary-row"><span>Ongkos kirim</span><span id="shipping-cost">${temporary ? "Saat checkout" : money(fee)}</span></div><div class="summary-total"><span>${temporary ? "Total sementara" : "Total tagihan"}</span><b id="grand-total">${money(total(items) + fee)}</b></div>${action}<p class="summary-note">${icon("clock")} Pesan minimal H-1 agar hidangan bisa kami siapkan segar.</p></aside>`;
    }
    function checkout() {
        if (!cart.length)
            return `<div class="container page-content">${heading("Checkout", "Lengkapi detail pesanan Anda.")}${empty("Belum ada menu dipilih", "Tambahkan menu ke keranjang sebelum checkout.", "/menu", "Pilih menu")}</div>`;
        const defLoc = sData.defaultLocation,
            initAddr = defLoc?.address || user?.alamat || user?.address || "",
            initLat = defLoc?.latitude ?? -6.21,
            initLon = defLoc?.longitude ?? 106.845,
            initDist = defLoc?.distance_km ?? 3.0;
        return `<div class="container page-content">${heading("Sedikit lagi, siap dipesan.", "Lengkapi penerima, jadwal, dan cara menerima hidangan.")} ${steps(1)}<form id="checkout-form" method="POST" action="/checkout" class="two-column"><input type="hidden" name="_token" value="${esc(sData.csrfToken || "")}"><div><section class="panel form-panel"><h2>Informasi penerima</h2>${user ? `<div class="user-autofill-banner">${icon("users")}<span>Masuk sebagai <b>${esc(user.nama)}</b> (${esc(user.email)}) — ${defLoc?.source === "latest_order" ? "Alamat & titik lokasi pesanan terakhir otomatis diterapkan." : "Data penerima dan alamat pengantaran terisi otomatis."}</span></div>` : '<p class="muted small-text">Sudah punya akun? <a href="/login" class="plain-link">Masuk ke akun Anda</a> agar data dan alamat otomatis terisi.</p>'}<div class="form-grid"><label>Nama penerima<input name="name" autocomplete="name" value="${esc(user?.nama || user?.name || "")}" required></label><label>Nomor WhatsApp<input name="phone" type="tel" autocomplete="tel" pattern="[0-9+ ()-]{9,18}" placeholder="08xxxxxxxxxx" value="${esc(user?.nomor_telepon || user?.phone || "")}" required></label></div></section><section class="panel form-panel"><h2>Kapan hidangan dibutuhkan?</h2><p class="muted">Pesan minimal sehari sebelum acara.</p><div class="form-grid"><label>Tanggal acara<input type="date" name="deliveryDate" min="${tomorrow()}" value="${tomorrow()}" required></label><label>Jam pengantaran / pengambilan<input type="time" name="time" value="10:00" min="06:00" max="20:00" required></label></div></section><section class="panel form-panel"><h2>Cara menerima pesanan</h2><div class="delivery-choices"><label><input type="radio" name="method" value="delivery" checked>${icon("truck")}<span>Diantar ke lokasi<small>Radius maksimal 20 km</small></span></label><label><input type="radio" name="method" value="pickup">${icon("bag")}<span>Ambil di dapur<small>Tanpa ongkos kirim</small></span></label></div><div id="delivery-fields"><label>Alamat lengkap & patokan<textarea id="checkout-address" name="address" rows="3" required placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, atau patokan lokasi">${esc(initAddr)}</textarea></label><div class="address-sync-bar"><button type="button" id="btn-sync-address" class="button outline small">${icon("search")} Cari Lokasi dari Alamat di Atas</button><small class="muted">Ketik/tempel alamat di atas lalu klik tombol ini untuk otomatis menandai titik pada peta.</small></div><div class="map-picker-section"><div class="map-header-row"><div><span class="field-title">${icon("pin")} Titik Pin Alamat Pengantaran</span><span class="field-desc">Jarak dan ongkos kirim dihitung otomatis dari koordinat pin peta</span></div><div class="map-header-actions"><button type="button" id="btn-my-location" class="button outline small btn-gps" title="Gunakan GPS Perangkat">${icon("pin")} Lokasi Saya</button><button type="button" id="btn-toggle-fullscreen" class="button outline small btn-fullscreen" title="Buka peta ke layar penuh">${icon("maximize")} <span id="fullscreen-label">Layar Penuh</span></button></div></div><div id="map-picker" class="map-container"></div><div class="map-guide-bar"><span><b>Petunjuk:</b> Geser pin merah, klik peta, atau gunakan tombol Layar Penuh untuk tampilan leluasa.</span></div><div id="distance-summary-card" class="distance-summary-card"><div class="distance-info-left"><div class="distance-badge-row"><span id="radius-badge" class="badge success">Dalam Jangkauan</span><strong id="distance-readout">${initDist.toFixed(1)} km</strong></div><p id="distance-status-desc" class="muted small-text">Titik Asal: Dapur Menteng (-6.1944, 106.8372)</p></div><div class="distance-fee-right"><span>Ongkos Kirim</span><b id="calculated-fee" class="fee-text">${money(initDist <= 1 ? 5000 : 5000 + Math.ceil(initDist - 1) * 2000)}</b></div><button type="button" id="btn-apply-fullscreen" class="button small btn-apply-fullscreen" style="display:none;">✓ Terapkan Titik Ini & Tutup</button></div><input type="hidden" name="delivery_latitude" id="input-delivery-lat" value="${initLat}"><input type="hidden" name="delivery_longitude" id="input-delivery-lon" value="${initLon}"><input type="hidden" name="distance" id="input-delivery-dist" value="${initDist}"></div></div><p id="pickup-message" class="notice" hidden>Pesanan akan disiapkan untuk diambil di Dapur Menteng (Jl. Menteng No. 10, Jakarta Pusat) sesuai jadwal yang Anda tentukan.</p></section><section class="panel form-panel"><h2>Catatan tambahan</h2><label>Informasi untuk dapur atau kurir (opsional)<textarea name="notes" rows="3" maxlength="500" placeholder="Patokan alamat atau kebutuhan acara"></textarea></label></section></div>${summary(cart, initDist <= 1 ? 5000 : 5000 + Math.ceil(initDist - 1) * 2000, '<button class="button full" type="submit">Buat pesanan ' + icon("arrow") + "</button>")}</form></div>`;
    }
    function selectedOrder() {
        const id = new URLSearchParams(location.search).get("id");
        if (page === "tracking" && !id) return null;
        const so = sData.order ? mapOrder(sData.order) : null;
        if (so && (!id || so.id === id)) return so;
        return (
            (id
                ? orders.find((o) => o.id === id)
                : user
                  ? orders.find((o) => o.email === user.email)
                  : null) || null
        );
    }
    function handleFilePreview(file, inputEl) {
        const preview = $("#proof-preview"),
            err = $("#payment-error");
        if (!preview) return;
        preview.innerHTML = "";
        if (err) err.textContent = "";
        if (!file) return;
        const valid = ["image/jpeg", "image/png", "application/pdf"],
            ext = (file.name.split(".").pop() || "").toLowerCase();
        if (
            (!valid.includes(file.type) &&
                !["jpg", "jpeg", "png", "pdf"].includes(ext)) ||
            file.size > 2 * 1024 * 1024
        ) {
            if (inputEl) inputEl.value = "";
            if (err)
                err.textContent =
                    "Pilih JPG, PNG, atau PDF dengan ukuran maksimal 2 MB.";
            return;
        }
        const sizeStr =
            file.size >= 1048576
                ? (file.size / 1048576).toFixed(1) + " MB"
                : Math.round(file.size / 1024) + " KB";
        const isPdf = file.type === "application/pdf" || ext === "pdf",
            badgeTxt = isPdf ? "PDF" : ext === "png" ? "PNG" : "JPG";
        const card = document.createElement("div");
        card.className = "proof-preview-card" + (isPdf ? " pdf" : "");
        card.innerHTML = `<div class="proof-preview-media">${isPdf ? `<div class="pdf-icon-box">${icon("bag")}<span>PDF</span></div>` : `<img class="proof-preview-thumb" alt="Pratinjau bukti transfer">`}</div><div class="proof-preview-details"><div class="proof-preview-meta"><span class="badge ${isPdf ? "" : "success"}">${badgeTxt}</span><strong class="proof-preview-name">${esc(file.name)}</strong><span class="proof-preview-size">${sizeStr}</span></div><button type="button" class="button outline small btn-clear-proof" data-action="clear-proof">✕ Hapus / Ganti</button></div>`;
        if (!isPdf) {
            const img = card.querySelector("img");
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
        }
        preview.appendChild(card);
    }
    function initUploadArea() {
        const area = $(".upload-area");
        if (!area || area._boundDrag) return;
        area._boundDrag = true;
        ["dragenter", "dragover"].forEach((n) =>
            area.addEventListener(n, (e) => {
                e.preventDefault();
                e.stopPropagation();
                area.classList.add("dragover");
            }),
        );
        ["dragleave", "drop"].forEach((n) =>
            area.addEventListener(n, (e) => {
                e.preventDefault();
                e.stopPropagation();
                area.classList.remove("dragover");
            }),
        );
        area.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
            area.classList.remove("dragover");
            const file = e.dataTransfer?.files?.[0];
            if (!file) return;
            const input = area.querySelector('input[type="file"]');
            if (input) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    input.files = dt.files;
                } catch (err) {
                    input.files = e.dataTransfer.files;
                }
                handleFilePreview(file, input);
            }
        });
    }
    function payment() {
        const o = selectedOrder();
        if (!o)
            return `<div class="container page-content">${empty("Belum ada pesanan", "Buat pesanan sebelum mengunggah bukti transfer.", "/menu", "Pilih menu")}</div>`;
        const orderTotal = o.total || total(o.items) + o.fee,
            proofUrl =
                o.proofData ||
                (o.proof
                    ? o.proof.startsWith("/") ||
                      o.proof.startsWith("http") ||
                      o.proof.startsWith("data:")
                        ? o.proof
                        : "/storage/" + o.proof
                    : null),
            isPaid = o.payment === "Lunas",
            isRejected = o.payment === "Ditolak";
        return `<div class="container page-content">${heading("Selesaikan pembayaran", "Transfer sesuai tagihan, lalu kirim bukti untuk diperiksa admin.")} ${steps(2)}<div class="notice">${badge(o.payment)} <span>Transfer tepat sebesar <strong>${money(orderTotal)}</strong> ke rekening Dapur Menteng di atas, lalu lampirkan bukti transfer di bawah ini.</span></div><div class="two-column"><div><section class="panel form-panel"><div class="panel-head-row"><h2>Transfer bank</h2><button type="button" class="button outline small copy-btn" data-copy="${orderTotal}">${icon("check")} Salin Nominal (${money(orderTotal)})</button></div><p class="muted small-text">Silakan transfer ke salah satu rekening resmi Catering Ibu Muliyah:</p><div class="bank-grid"><div class="bank"><div class="bank-head"><strong>BCA</strong><button type="button" class="button outline small copy-btn" data-copy="873-021-9988">Salin</button></div><b class="bank-acc">873-021-9988</b><span class="bank-holder">a.n. Catering Ibu Muliyah</span></div><div class="bank"><div class="bank-head"><strong>Mandiri</strong><button type="button" class="button outline small copy-btn" data-copy="122-00-9876543-1">Salin</button></div><b class="bank-acc">122-00-9876543-1</b><span class="bank-holder">a.n. Catering Ibu Muliyah</span></div></div></section>${o.proof ? `<section class="panel form-panel uploaded-proof-card"><div class="panel-head-row"><h2>Bukti Transfer Terunggah</h2>${badge(o.payment)}</div><div class="uploaded-proof-box">${proofUrl?.endsWith(".pdf") ? `<a href="${esc(proofUrl)}" download="bukti-${esc(o.id)}.pdf" class="button outline small">${icon("bag")} Unduh Dokumen PDF Bukti Transfer</a>` : `<div class="proof-display-card"><div class="proof-toolbar"><button type="button" class="button outline small" onclick="const img=this.parentElement.nextElementSibling;img.classList.toggle('zoomed');this.textContent=img.classList.contains('zoomed')?'Perkecil gambar':'Perbesar gambar'">${icon("search")} Perbesar gambar</button><small class="muted">Klik gambar atau tombol untuk perbesar</small></div><img src="${esc(proofUrl)}" alt="Bukti Transfer" class="uploaded-proof-img" onclick="this.classList.toggle('zoomed')" title="Klik untuk perbesar / perkecil"></div>`}</div>${isRejected ? `<div class="notice error"><strong>Bukti Ditolak:</strong> <span>${esc(o.rejection || "Bukti transfer tidak sesuai. Silakan kirimkan ulang bukti yang valid.")}</span></div>` : ""}</section>` : ""}${!isPaid ? `<form id="payment-form" method="POST" action="/pembayaran" enctype="multipart/form-data" class="panel form-panel"><input type="hidden" name="_token" value="${esc(sData.csrfToken || "")}"><input type="hidden" name="id_pesanan" value="${esc(o.id)}"><h2>${o.proof ? "Unggah Ulang Bukti Transfer" : "Konfirmasi transfer"}</h2><div class="form-grid"><label>Bank pengirim<input name="nama_bank" placeholder="Contoh: BCA" required></label><label>Nama pemilik rekening<input name="nama_pemilik_rekening" value="${esc(o.name)}" required></label><label>Nominal transfer<input type="number" name="nominal_transfer" min="${orderTotal}" value="${orderTotal}" required></label><label>Tanggal transfer<input type="date" name="tanggal_transfer" max="${today()}" value="${today()}" required></label></div><label class="upload-area">${icon("bag")}<b>Pilih bukti transfer atau tarik ke sini</b><span>JPG, PNG, atau PDF. Maksimal 2 MB.</span><input name="bukti_transfer" type="file" accept="image/jpeg,image/png,application/pdf" required></label><div id="proof-preview"></div><p id="payment-error" class="form-error" role="alert"></p><button class="button full" type="submit">Kirim bukti pembayaran</button></form>` : ""}</div>${summary(o.items, o.fee, button("/lacak-pesanan?id=" + o.id, "Lacak pesanan", "outline full"))}</div></div>`;
    }
    function customerOrders() {
        return user ? orders.filter((o) => o.email === user.email) : orders;
    }
    function history() {
        const list = customerOrders();
        return `<div class="container page-content">${heading("Pesanan Anda", "Dari dapur hingga meja makan, pantau semuanya di sini.", `<div style="display:flex;gap:8px;"><a href="/lacak-pesanan" class="button outline small">Lacak via nomor nota</a>${button("/menu", "Pesan lagi", "small")}</div>`)}<div class="tabs history-tabs"><button data-action="history-filter" data-filter="all" aria-pressed="true">Semua pesanan</button><button data-action="history-filter" data-filter="active" aria-pressed="false">Sedang berjalan</button><button data-action="history-filter" data-filter="done" aria-pressed="false">Selesai</button></div><div id="history-list">${historyCards(list)}</div></div>`;
    }
    function historyCards(list, isAdmin = false, custIdx = "") {
        return list.length
            ? list
                  .map(
                      (o) =>
                          `<article class="panel order-card"><div class="order-card-header"><span><b>${esc(o.id)}</b><small>${date(o.date)}</small></span>${badge(states[o.status])}</div><div class="order-card-body"><img src="${menuImg(o.items?.[0]?.image)}" alt="Ilustrasi menu"><div><h2>${esc(o.items?.[0]?.name || "Pesanan")}</h2><p>${(o.items || []).reduce((n, x) => n + x.qty, 0)} porsi${(o.items || []).length > 1 ? " · " + o.items.length + " menu" : ""}</p><small>${icon("clock")} ${date(o.deliveryDate)}, ${esc(o.time)}</small></div><strong>${money(total(o.items || []) + o.fee)}</strong></div><div class="order-card-footer">${badge(o.payment)}${isAdmin ? `<button type="button" class="button outline small" data-action="order-detail" data-id="${esc(o.id)}" data-from-customer="${custIdx}">Detail pesanan</button>` : button("/lacak-pesanan?id=" + o.id, "Detail & lacak", "outline small")}</div></article>`,
                  )
                  .join("")
            : empty(
                  "Belum ada riwayat pesanan",
                  user
                      ? "Anda belum memiliki pesanan aktif."
                      : "Masuk ke akun untuk melihat pesanan Anda atau gunakan pelacakan via nomor nota.",
                  user ? "/menu" : "/login",
                  user ? "Pilih menu" : "Masuk ke akun",
              );
    }
    function thermalReceipt(o) {
        return `<div class="thermal-receipt"><div class="receipt-header"><h3>DAPUR MENTENG</h3><p>Catering Nasi Uduk Ibu Muliyah<br>Jl. Menteng No. 10, Jakarta Pusat<br>Telp/WA: 0812-3456-7890</p></div><hr class="receipt-divider"><h4>NOTA / INVOICE PEMESANAN</h4><hr class="receipt-divider"><div class="receipt-rows"><div class="receipt-row"><span>No. Nota:</span><b>${esc(o.id)}</b></div><div class="receipt-row"><span>Tanggal:</span><span>${date(o.date)}</span></div><div class="receipt-row"><span>Pelanggan:</span><span>${esc(o.name)}</span></div><div class="receipt-row"><span>No. HP:</span><span>${esc(o.phone)}</span></div><div class="receipt-row"><span>Pengiriman:</span><span>${o.method === "pickup" ? "Ambil di Dapur" : "Diantar Kurir"}</span></div><div class="receipt-row"><span>Jadwal:</span><span>${date(o.deliveryDate)}, ${esc(o.time)} WIB</span></div>${o.method === "delivery" ? `<div class="receipt-addr"><span>Alamat:</span><small>${esc(o.address)}</small></div>` : ""}</div><hr class="receipt-divider"><div class="receipt-items">${o.items.map((it) => `<div class="receipt-item"><div class="receipt-item-title">${esc(it.name)}</div><div class="receipt-row"><span>${it.qty} × ${money(it.price)}</span><b>${money(it.qty * it.price)}</b></div>${it.note ? `<div class="receipt-item-note">* Catatan: ${esc(it.note)}</div>` : ""}</div>`).join("")}</div><hr class="receipt-divider"><div class="receipt-rows"><div class="receipt-row"><span>Subtotal:</span><span>${money(total(o.items))}</span></div><div class="receipt-row"><span>Ongkir (${o.method === "pickup" ? "Ambil" : "Kurir"}):</span><span>${money(o.fee || 0)}</span></div><hr class="receipt-divider"><div class="receipt-row receipt-total"><span>TOTAL:</span><b>${money(total(o.items) + o.fee)}</b></div><hr class="receipt-divider"><div class="receipt-row"><span>Status Bayar:</span><b>${esc(o.payment.toUpperCase())}</b></div>${o.bank ? `<div class="receipt-row"><span>Metode:</span><span>Transfer ${esc(o.bank)}</span></div>` : ""}</div>${o.notes ? `<hr class="receipt-divider"><div class="receipt-addr"><span>Catatan:</span><small>${esc(o.notes)}</small></div>` : ""}<hr class="receipt-divider"><div class="receipt-footer"><p>TERIMA KASIH ATAS PESANAN ANDA<br><small>Hidangan Higienis & Segar Dapur Menteng<br>Simpan struk ini sebagai bukti pembayaran sah.</small></p></div></div>`;
    }
    function showInvoice(id, autoPrint = false) {
        const o =
            (id
                ? orders.find(
                      (x) => x.id === id || String(x.rawId) === String(id),
                  )
                : null) || selectedOrder();
        if (!o) return;
        document.body.classList.add("print-receipt");
        showModal(
            `<div class="modal-form receipt-modal-wrap"><div class="receipt-modal-actions no-print"><button type="button" class="button" data-action="print-thermal">${icon("check")} Cetak ke Mesin Struk / Printer</button></div>${thermalReceipt(o)}</div>`,
        );
        if (autoPrint) setTimeout(() => window.print(), 200);
    }
    function tracking() {
        const o = selectedOrder(),
            myOrders = user
                ? orders.filter((x) => !x.email || x.email === user.email)
                : [];
        const searchId = new URLSearchParams(location.search).get("id");
        if (!o)
            return `<div class="container page-content">${heading("Lacak status pesanan", "Pantau perkembangan hidangan Anda langsung dari dapur.")}${searchId ? `<div class="notice error">${icon("alert")} <span>Pesanan <strong>${esc(searchId)}</strong> tidak ditemukan. Periksa kembali nomor nota Anda.</span></div>` : ""}<div class="panel form-panel tracking-search-box"><h2>Cari status pesanan katering</h2><p class="muted small-text">${user ? "Masukkan nomor nota pesanan Anda atau pilih langsung dari pesanan terakhir untuk memeriksa tahapan persiapan." : "Masukkan nomor nota pesanan Anda (contoh: DM-20261018-0001) untuk memeriksa tahapan persiapan dan pengantaran."}</p><form id="tracking-search-form" class="tracking-search-form" onsubmit="event.preventDefault();const id=this.elements.order_id.value.trim();const phone=this.elements.phone?this.elements.phone.value.trim():'';if(id)location.href='/lacak-pesanan?id='+encodeURIComponent(id)+(phone?'&phone='+encodeURIComponent(phone):'');"><div class="form-grid"><label>Nomor pesanan<input name="order_id" id="tracking-order-input" placeholder="DM-xxxxxxxx-xxxx" required></label>${
                user
                    ? myOrders.length
                        ? `<label>Pilih dari pesanan Anda<select id="quick-order-select" name="quick_order" onchange="const inp=this.form.elements.order_id;if(inp&&this.value){inp.value=this.value;location.href='/lacak-pesanan?id='+encodeURIComponent(this.value);}"><option value="">-- Pilih nomor pesanan --</option>${myOrders
                              .slice(0, 10)
                              .map(
                                  (x) =>
                                      `<option value="${esc(x.id)}">${esc(x.id)} — ${date(x.deliveryDate || x.date)} (${money(x.total || total(x.items) + x.fee)})</option>`,
                              )
                              .join("")}</select></label>`
                        : ""
                    : `<label>Nomor WhatsApp pemesan<input name="phone" placeholder="08xxxxxxxxxx" required></label>`
            }</div><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:16px;"><button class="button" type="submit">${icon("check")} Cek status pesanan</button>${user && myOrders.length ? `<a href="/pesanan" class="plain-link">Lihat semua pesanan saya →</a>` : ""}</div>${
                user && myOrders.length
                    ? `<div class="quick-orders-section"><span class="muted small-text">Pesanan terakhir:</span><div class="quick-order-chips">${myOrders
                          .slice(0, 5)
                          .map(
                              (x) =>
                                  `<a href="/lacak-pesanan?id=${encodeURIComponent(x.id)}" class="button outline small">${esc(x.id)} <small class="muted">(${date(x.date)})</small></a>`,
                          )
                          .join("")}</div></div>`
                    : ""
            }</form></div></div>`;
        const trackingSteps = [
            "Menunggu Pembayaran",
            "Menunggu Verifikasi",
            "Diproses & Dimasak",
            "Dikirim / Siap Diambil",
            "Selesai",
        ];
        let cur = 0;
        if (o.status === 3) cur = 4;
        else if (o.status === 2) cur = 3;
        else if (o.status === 1) cur = 2;
        else if (
            o.payment === "Menunggu verifikasi" ||
            o.payment === "Menunggu Verifikasi" ||
            o.payment === "Lunas"
        )
            cur = 1;
        const needPay =
            o.payment === "Menunggu pembayaran" ||
            o.payment === "Menunggu Pembayaran" ||
            o.payment === "Ditolak" ||
            o.status === 4 ||
            (o.status === 0 &&
                ![
                    "Menunggu verifikasi",
                    "Menunggu Verifikasi",
                    "Lunas",
                ].includes(o.payment));
        return `<div class="container page-content">${heading("Kabar dari dapur", "Informasi dan perkembangan pesanan Anda.", `<div class="tracking-top-actions"><a href="/lacak-pesanan" class="button outline small track-other-btn">Lacak pesanan lain</a><button class="button outline small" data-action="show-invoice" data-id="${esc(o.id)}">${icon("check")} Cetak invoice (Struk)</button></div>`)}<div class="panel tracking-panel"><div class="panel-heading"><div class="tracking-id-group"><div class="tracking-id-row"><h2>${esc(o.id)}</h2><button type="button" class="button outline small copy-btn" data-copy="${esc(o.id)}" aria-label="Salin Nomor Pesanan">${icon("check")} Salin Nomor Pesanan</button></div><p>Dipesan ${date(o.date)} · ${esc(o.name)}</p></div>${badge(states[o.status] || o.payment)}</div>${(o.status === 4 || o.payment === "Ditolak") ? `<div class="notice error"><div><strong>Bukti Pembayaran Ditolak:</strong> <span>${esc(o.rejection || "Bukti transfer tidak sesuai. Silakan kirimkan ulang bukti yang valid pada halaman pembayaran.")}</span></div></div>` : ""}<ol class="tracking-steps">${trackingSteps.map((s, i) => `<li class="${i <= cur ? "complete" : ""} ${i === cur ? "current" : ""}"><span>${i < cur ? "✓" : i + 1}</span><b>${s}</b><small>${i < cur ? "Sudah selesai" : i === cur ? "Tahap saat ini" : "Belum dimulai"}</small></li>`).join("")}</ol>${needPay ? `<div class="tracking-cta-box"><div><strong>Pembayaran Belum Selesai</strong><p class="muted small-text">Segera lakukan transfer dan lampirkan bukti pembayaran agar pesanan dapat disiapkan.</p></div><a href="/pembayaran?id=${esc(o.id)}" class="button yellow tracking-pay-btn">Selesaikan pembayaran</a></div>` : ""}<div class="tracking-wa-bar"><span class="muted small-text">Pertanyaan terkait pesanan? Tim dapur siap membantu.</span><a href="https://wa.me/6281234567890?text=${encodeURIComponent("Halo Dapur Menteng, saya ingin menanyakan pesanan nomor " + o.id)}" target="_blank" rel="noopener" class="button outline small wa-btn">Hubungi WhatsApp Dapur Menteng</a></div></div><div class="two-column"><section class="panel form-panel"><h2>Penerima & pengiriman</h2><dl class="details-list">${[
            ["Nama", o.name],
            ["WhatsApp", o.phone],
            ["Jadwal", date(o.deliveryDate) + ", " + o.time],
            [
                "Metode",
                o.method === "pickup" ? "Ambil di dapur" : "Diantar ke lokasi",
            ],
            [
                "Alamat",
                o.method === "pickup"
                    ? "Dapur Menteng, Jakarta Pusat"
                    : o.address,
            ],
            ["Catatan", o.notes || "Tidak ada catatan tambahan"],
        ]
            .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
            .join(
                "",
            )}</dl></section>${summary(o.items, o.fee, "")}</div><div class="tracking-bottom-actions"><a class="button outline small track-other-btn" href="/lacak-pesanan">Lacak pesanan lain</a><a class="plain-link" href="/pesanan">Kembali ke pesanan Anda</a></div><div class="print-only-receipt">${thermalReceipt(o)}</div></div>`;
    }
    function auth(register = false) {
        const retUrl = new URLSearchParams(location.search).get("return") || "";
        const hasErr = Boolean(sData.flash?.error),
            oldEmail = sData.old?.email || "";
        const errHtml = hasErr
            ? `<div class="notice error" role="alert" id="auth-error-banner">${icon("alert")}<div><span>${esc(sData.flash.error)}${!register ? ' Butuh bantuan? <a href="https://wa.me/6281234567890?text=Halo%20Dapur%20Menteng,%20saya%20butuh%20bantuan%20terkait%20akun%20saya" target="_blank" rel="noopener">Hubungi WhatsApp</a>' : ""}</span></div></div>`
            : "";
        const switchUrl = register
            ? "/login" + (retUrl ? "?return=" + encodeURIComponent(retUrl) : "")
            : "/register" +
              (retUrl ? "?return=" + encodeURIComponent(retUrl) : "");
        return `<div class="container auth-layout"><section class="auth-story"><img src="/images/hero.jpg" alt="Ilustrasi sepiring nasi uduk lengkap"><div><h1>${register ? "Satu akun.<br>Banyak momen<br>makan bersama." : "Senang bertemu<br>Anda lagi."}</h1><p>Pesan hidangan favorit dan pantau persiapannya, dari dapur sampai meja makan.</p></div></section><section class="auth-form"><a class="breadcrumb" href="/">Kembali ke beranda</a><h2>${register ? "Buat akun Anda" : "Masuk ke akun"}</h2><p>${register ? "Mulai rencanakan hidangan untuk momen Anda." : "Pesanan dan menu favorit Anda sudah menanti."}</p>${errHtml}<form id="auth-form" method="POST" action="${register ? "/register" : "/login"}" data-register="${register}"><input type="hidden" name="_token" value="${esc(sData.csrfToken || "")}">${retUrl ? `<input type="hidden" name="return" value="${esc(retUrl)}">` : ""}${register ? `<label>Nama lengkap<input name="name" autocomplete="name" value="${esc(sData.old?.name || "")}" required></label>` : ""}<label>Email<input name="email" type="email" autocomplete="email" value="${esc(oldEmail)}" required></label><label>Kata sandi<input name="password" type="password" ${hasErr ? 'aria-invalid="true"' : ""} required></label>${register ? `<label>Nomor WhatsApp<input name="phone" type="tel" value="${esc(sData.old?.phone || "")}" placeholder="08xxxxxxxxxx" required></label><label>Alamat lengkap<textarea name="address" rows="2" placeholder="Alamat pengantaran">${esc(sData.old?.address || "")}</textarea></label>` : ""}<button class="button full" type="submit">${register ? "Daftar sekarang" : "Masuk ke akun"}</button></form><p class="auth-switch">${register ? `Sudah punya akun? <a href="${switchUrl}">Masuk</a>` : `Belum punya akun? <a href="${switchUrl}">Daftar di sini</a>`}</p></section></div>`;
    }
    function orderTable(list, report = false) {
        return `<div class="table-scroll"><table><thead><tr>${["Pesanan", "Pelanggan", report ? "Porsi" : "Jadwal", "Total tagihan", "Pembayaran", "Status", ...(report ? [] : ["Aksi"])].map((s) => `<th scope="col">${s}</th>`).join("")}</tr></thead><tbody>${list.map((o) => `<tr><td><b>${esc(o.id)}</b><small>${date(o.date)}</small></td><td>${esc(o.name)}</td><td>${report ? o.items.reduce((a, x) => a + x.qty, 0) : date(o.deliveryDate)}</td><td class="numeric nowrap">${money(total(o.items) + o.fee)}</td><td>${badge(o.payment)}</td><td>${badge(states[o.status])}</td>${report ? "" : `<td><button class="text-button" data-action="order-detail" data-id="${o.id}">Detail</button></td>`}</tr>`).join("") || '<tr><td colspan="7" class="table-empty">Tidak ada pesanan yang sesuai filter.</td></tr>'}</tbody></table></div>`;
    }
    function metrics(list) {
        const paid = list.filter((o) => o.payment === "Lunas");
        const rev =
                (page === "reports"
                    ? paid.reduce((a, o) => a + total(o.items) + o.fee, 0)
                    : sData.totalRevenue) ||
                paid.reduce((a, o) => a + total(o.items) + o.fee, 0),
            ordCount =
                (page === "reports" ? list.length : sData.totalOrders) ||
                list.length,
            pCount =
                sData.pendingVerifications ??
                list.filter((o) => o.payment === "Menunggu verifikasi").length;
        return `<div class="metrics"><article><span>${icon("chart")}Omzet terverifikasi</span><strong>${money(rev)}</strong><small>Dari pembayaran yang telah diperiksa</small></article><article><span>${icon("bag")}Total pesanan</span><strong>${ordCount}</strong><small>Seluruh status pesanan</small></article><article><span>${icon(page === "reports" ? "users" : "clock")}${page === "reports" ? "Porsi terjual" : "Menunggu verifikasi"}</span><strong>${page === "reports" ? paid.reduce((a, o) => a + o.items.reduce((n, x) => n + x.qty, 0), 0) : pCount}</strong><small>${page === "reports" ? "Dari pembayaran terverifikasi" : "Bukti transfer perlu diperiksa"}</small></article></div>`;
    }
    function dashboard() {
        const pCount =
            sData.pendingVerifications ??
            orders.filter((o) => o.payment === "Menunggu verifikasi").length;
        return `<div class="admin-content">${heading("Selamat datang di dapur.", "Berikut ringkasan pesanan dan aktivitas usaha Anda.", `<span class="date-chip">${icon("clock")} ${date(today())}</span>`)}${metrics(orders)}${pCount > 0 ? `<div class="notice action-notice"><div>${icon("bag")}<span><b>${pCount} pembayaran menunggu pemeriksaan</b><small>Periksa bukti transfer sebelum pesanan disiapkan dapur.</small></span></div>${button("/admin/pesanan", "Periksa pembayaran", "small")}</div>` : ""}<section class="panel table-panel"><div class="panel-heading"><h2>Pesanan terbaru</h2><a href="/admin/pesanan" class="plain-link">Semua pesanan</a></div>${orderTable(orders.slice(0, 5))}</section><section class="panel chart-panel"><div class="panel-heading"><div><h2>Aktivitas dapur</h2><p>Pesanan yang perlu disiapkan dalam waktu dekat</p></div></div>${orderTable(orders.filter((o) => o.status === 1).slice(0, 4))}</section></div>`;
    }
    function adminMenus() {
        return `<div class="admin-content">${heading("Menu & paket", "Kelola hidangan, harga, dan ketersediaan untuk pelanggan.", '<button class="button" data-action="edit-menu">+ Tambah menu</button>')}<section class="panel table-panel"><div class="panel-heading"><h2>${menus.length} menu di dapur</h2><span class="muted">3 pilihan penyajian</span></div><div class="table-scroll"><table><thead><tr>${["Menu", "Kategori", "Harga / porsi", "Minimum", "Ketersediaan", "Aksi"].map((t) => `<th scope="col">${t}</th>`).join("")}</tr></thead><tbody>${menus.map((m) => `<tr><td><div class="table-menu"><img src="${menuImg(m.image)}" alt=""><b>${esc(m.name)}</b></div></td><td><span class="category-chip" data-category="${esc(m.category)}">${cats[m.category]}</span></td><td class="numeric">${money(m.price)}</td><td>${m.min} porsi</td><td><button class="availability-toggle ${m.available ? "available" : "hidden"}" data-action="availability" data-id="${m.id}" aria-pressed="${m.available}" aria-label="${esc(m.name)}: ${m.available ? "tersedia, tandai habis" : "habis, tandai tersedia"}">${m.available ? "Tersedia" : "Habis"}</button></td><td><div class="table-actions"><button class="text-button" data-action="edit-menu" data-id="${m.id}">Edit</button><button class="text-button danger" data-action="delete-menu" data-id="${m.id}">Hapus</button></div></td></tr>`).join("")}</tbody></table></div></section></div>`;
    }
    function editMenu(id) {
        const m = menus.find((x) => x.id === id) || {
            name: "",
            category: "satuan",
            price: 18000,
            min: 1,
            desc: "",
            image: "satuan.jpg",
            available: true,
        };
        showModal(
            `<form id="menu-form" data-id="${id || ""}" class="modal-form"><h2 id="modal-title">${id ? "Edit menu" : "Tambah menu"}</h2><label>Nama menu<input name="name" value="${esc(m.name)}" maxlength="100" required></label><div class="form-grid"><label>Kategori<select name="category">${Object.entries(
                cats,
            )
                .map(
                    ([k, n]) =>
                        `<option value="${k}" ${m.category === k ? "selected" : ""}>${n}</option>`,
                )
                .join(
                    "",
                )}</select></label><label>Minimum porsi<input name="min" type="number" min="1" step="1" value="${m.min}" required></label><label>Harga per porsi<input name="price" type="number" min="1000" step="500" value="${m.price}" required><small id="price-preview" class="price-preview-badge">${money(m.price)} / porsi</small></label><label>Unggah foto (JPG, PNG, WebP maks 2 MB)<input name="foto_menu" type="file" accept="image/jpeg,image/png,image/webp"></label></div><div id="menu-img-preview-wrap" class="menu-preview-box"><img id="menu-img-preview" src="${menuImg(m.image)}" alt="Pratinjau foto" data-action="zoom-menu-img" title="Klik untuk melihat foto lebih besar"><div><strong id="menu-img-preview-label">${m.name ? "Foto hidangan saat ini" : "Pratinjau foto hidangan"}</strong><small class="muted" id="menu-img-preview-hint">${m.name ? "Kosongkan berkas di atas jika tidak ingin mengubah foto" : "Ilustrasi bawaan " + cats[m.category] + " (pilih berkas untuk mengganti)"}</small><button type="button" class="text-button" data-action="zoom-menu-img">${icon("search")} Lihat foto lebih besar</button></div></div><label>Komposisi lauk<textarea name="desc" rows="3" maxlength="500" required>${esc(m.desc)}</textarea></label><label class="menu-check-label"><input name="status_tersedia" type="checkbox" value="1" ${m.available !== false ? "checked" : ""}><span>Tersedia & langsung tampil di katalog</span></label><button class="button full" type="submit">Simpan menu</button></form>`,
        );
    }
    function adminOrders() {
        return `<div class="admin-content">${heading("Pesanan masuk", "Periksa pembayaran dan kelola persiapan setiap pesanan.")}<form id="order-filter" class="panel filter-bar"><label>Cari pesanan<input name="search" type="search" placeholder="Nomor pesanan atau nama"></label><label>Status pesanan<select name="status"><option value="">Semua status</option>${states.map((s, i) => `<option value="${i}">${s}</option>`).join("")}</select></label><label>Pembayaran<select name="payment"><option value="">Semua pembayaran</option>${["Menunggu pembayaran", "Menunggu verifikasi", "Lunas", "Ditolak"].map((s) => `<option>${s}</option>`).join("")}</select></label><button class="button" type="submit">Terapkan</button><button type="reset" class="text-button">Reset</button></form><section class="panel table-panel" id="orders-table">${orderTable(orders)}</section></div>`;
    }
    function orderDetail(id, fromCust) {
        const o = orders.find((x) => x.id === id);
        if (!o) return;
        const pSrc =
                o.proofData ||
                (o.proof
                    ? o.proof.startsWith("http") || o.proof.startsWith("/")
                        ? o.proof
                        : "/storage/" + o.proof
                    : null),
            isPdf = Boolean(
                pSrc &&
                (pSrc.toLowerCase().endsWith(".pdf") ||
                    pSrc.startsWith("data:application/pdf")),
            ),
            isProc = Boolean(o.status >= 1 || o.payment === "Lunas");
        showModal(
            `<div class="modal-form">${fromCust !== undefined && fromCust !== "" ? `<button type="button" class="modal-back-btn" data-action="customer" data-index="${fromCust}">← Kembali ke riwayat pelanggan</button>` : ""}<h2 id="modal-title">${esc(o.id)}</h2><p>${esc(o.name)} · ${date(o.deliveryDate)}, ${esc(o.time)}</p>${summary(o.items, o.fee, "")}<p><b>Pengiriman:</b> ${esc(o.method === "pickup" ? "Ambil di dapur" : o.address)}</p><p><b>Pembayaran:</b> ${badge(o.payment)}</p><div style="margin:8px 0;"><button type="button" class="button outline small" data-action="show-invoice" data-id="${esc(o.id)}">${icon("check")} Cetak Struk / Invoice Mesin</button></div>${pSrc ? `<div class="admin-proof-box"><div class="admin-proof-head"><b>Bukti Transfer:</b> ${esc(o.bank || "Transfer Bank")}${o.sender ? " a.n " + esc(o.sender) : ""}${o.transferAmount ? " (" + money(o.transferAmount) + ")" : ""}</div>${isPdf ? `<a href="${esc(pSrc)}" download="bukti-${esc(o.id)}.pdf" class="button outline small">Unduh berkas PDF</a>` : isProc ? `<button type="button" class="button outline small" onclick="const b=this.nextElementSibling;const o=b.style.display!=='none';b.style.display=o?'none':'block';this.textContent=o?'Lihat bukti pembayaran':'Sembunyikan bukti'">${icon("search")} Lihat bukti pembayaran</button><div style="display:none;margin-top:10px;"><img class="payment-proof" src="${esc(pSrc)}" alt="Bukti transfer ${esc(o.id)}" onclick="this.classList.toggle('zoomed')" title="Klik untuk perbesar / perkecil"><small class="muted" style="display:block;text-align:center;margin-top:4px;">Klik gambar untuk perbesar / perkecil</small></div>` : `<div><img class="payment-proof" src="${esc(pSrc)}" alt="Bukti transfer ${esc(o.id)}" onclick="this.classList.toggle('zoomed')" title="Klik untuk perbesar / perkecil"><small class="muted" style="display:block;text-align:center;margin-top:4px;">Klik gambar untuk perbesar / perkecil</small></div>`}</div>` : '<p class="muted small-text"><b>Bukti transfer:</b> Belum ada berkas diunggah.</p>'}${o.payment === "Menunggu verifikasi" ? `<div class="form-grid"><button class="button" data-action="verify" data-id="${o.id}">Terima pembayaran</button><button class="button outline" data-action="reject" data-id="${o.id}">Tolak bukti</button></div>` : ""}<form id="status-form" data-id="${o.id}"><label>Progres pesanan<select name="status" ${o.payment !== "Lunas" ? "disabled" : ""}>${states.map((s, i) => `<option value="${i}" ${o.status === i ? "selected" : ""}>${s}</option>`).join("")}</select></label><button class="button full" type="submit" ${o.payment !== "Lunas" ? "disabled" : ""}>Simpan progres</button></form></div>`,
        );
    }
    function customerPage() {
        const list =
            sData.customers && sData.customers.length
                ? sData.customers
                : customers;
        return `<div class="admin-content">${heading("Pelanggan", "Kenali pelanggan dan lihat riwayat pesanannya.")}<section class="panel table-panel"><div class="panel-heading"><h2>${list.length} pelanggan terdaftar</h2></div><div class="table-scroll"><table><thead><tr>${["Pelanggan", "WhatsApp", "Pesanan", "Total belanja", "Aksi"].map((t) => `<th scope="col">${t}</th>`).join("")}</tr></thead><tbody>${
            list
                .map((c, i) => {
                    const os =
                        c.orders && c.orders.length
                            ? c.orders.map(mapOrder)
                            : orders.filter((o) => o.email === c.email);
                    return `<tr><td><b>${esc(c.name)}</b><small>${esc(c.email)}</small></td><td>${esc(c.phone)}</td><td>${c.order_count || os.length} transaksi</td><td class="numeric">${money(c.total_spend || os.filter((o) => o.payment === "Lunas").reduce((a, o) => a + total(o.items) + o.fee, 0))}</td><td><button class="text-button" data-action="customer" data-index="${i}">Lihat riwayat</button></td></tr>`;
                })
                .join("") ||
            '<tr><td colspan="5" class="table-empty">Belum ada pelanggan terdaftar.</td></tr>'
        }</tbody></table></div></section></div>`;
    }
    let reportList = orders;
    function reports() {
        return `<div class="admin-content">${heading("Laporan penjualan", "Tinjau transaksi dan omzet sesuai periode yang Anda pilih.")}<form id="report-filter" class="panel filter-bar"><label>Tanggal mulai<input name="start" type="date" value="2026-11-01" required></label><label>Tanggal akhir<input name="end" type="date" value="${today()}" required></label><label>Status<select name="status"><option value="">Semua status</option>${states.map((s, i) => `<option value="${i}">${s}</option>`).join("")}</select></label><button class="button">Terapkan filter</button></form><div id="report-results"></div></div>`;
    }
    function renderReport() {
        const f = $("#report-filter");
        let sDate = "2026-11-01",
            eDate = today();
        if (f) {
            const d = new FormData(f);
            sDate = d.get("start") || sDate;
            eDate = d.get("end") || eDate;
            reportList = orders.filter(
                (o) =>
                    o.date >= sDate &&
                    o.date <= eDate &&
                    (d.get("status") === "" ||
                        o.status === Number(d.get("status"))),
            );
        }
        $("#report-results").innerHTML =
            `${metrics(reportList)}<section class="panel table-panel"><div class="panel-heading"><div><h2>Rincian transaksi</h2><p>Periode: ${date(sDate)} s.d. ${date(eDate)} · ${reportList.length} transaksi</p></div><div class="table-actions"><button class="button outline small" data-action="print">Cetak / PDF</button><button class="button small" data-action="export">Unduh CSV</button></div></div>${orderTable(reportList, true)}</section><p class="muted small-text">Omzet dan porsi terjual dihitung dari pembayaran terverifikasi. CSV dapat dibuka di Excel.</p>`;
    }
    function render() {
        const views = {
            home,
            catalog,
            cart: cartPage,
            checkout,
            payment,
            history,
            tracking,
            login: () => auth(),
            register: () => auth(true),
            dashboard,
            "admin-menu": adminMenus,
            "admin-orders": adminOrders,
            customers: customerPage,
            reports,
        };
        $("#main").innerHTML = (views[page] || home)();
        if (page === "reports") renderReport();
        if (page === "checkout") setTimeout(initCheckoutMap, 60);
        if (page === "payment") setTimeout(initUploadArea, 50);
        if (["login", "register"].includes(page) && sData.flash?.error)
            setTimeout(() => {
                const p =
                    $('#auth-form [aria-invalid="true"]') ||
                    $('#auth-form input[name="password"]');
                if (p) p.focus();
            }, 60);
        document.title =
            ({
                home: "Nasi uduk untuk makan bersama",
                catalog: "Pilihan menu",
                cart: "Keranjang",
                checkout: "Checkout",
                payment: "Pembayaran",
                history: "Pesanan Anda",
                tracking: "Lacak pesanan",
                login: "Masuk",
                register: "Daftar akun",
                dashboard: "Ringkasan admin",
                "admin-menu": "Menu & paket",
                "admin-orders": "Pesanan masuk",
                customers: "Pelanggan",
                reports: "Laporan penjualan",
            }[page] || "Beranda") + " — Dapur Menteng";
    }
    function persistCart() {
        save("cart", cart);
        headerCount();
    }
    function headerCount() {
        const count = $(".cart-count");
        if (count) {
            count.textContent = cart.reduce((a, x) => a + x.qty, 0);
            count.classList.remove("bump");
            void count.offsetWidth;
            count.classList.add("bump");
        }
    }
    function persistOrders() {
        save("orders", orders);
    }
    function calcHaversine(lat1, lon1, lat2, lon2) {
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371.0;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
        return Math.round(2 * R * Math.asin(Math.sqrt(a)) * 10) / 10;
    }
    let reverseGeocodeTimer = null;
    function triggerReverseGeocode(lat, lon) {
        clearTimeout(reverseGeocodeTimer);
        reverseGeocodeTimer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                );
                const data = await res.json();
                if (data && data.display_name) {
                    const addr = $("#checkout-address");
                    if (
                        addr &&
                        (!addr.value.trim() ||
                            addr.dataset.autofilled === "true")
                    ) {
                        addr.value = data.display_name;
                        addr.dataset.autofilled = "true";
                    }
                }
            } catch (e) {}
        }, 800);
    }
    function generateAddressCandidates(raw) {
        if (!raw) return [];
        const clean = raw
            .replace(/RT\s*\.?\s*\d+\s*[\/\-]\s*RW\s*\.?\s*\d+/gi, " ")
            .replace(/RT\s*\.?\s*\d+/gi, " ")
            .replace(/RW\s*\.?\s*\d+/gi, " ")
            .replace(/No\s*\.?\s*\d+[a-zA-Z]?/gi, " ")
            .replace(/Nomor\s*\d+/gi, " ")
            .replace(/Central Jakarta City/gi, "Jakarta Pusat")
            .replace(/South Jakarta City/gi, "Jakarta Selatan")
            .replace(/West Jakarta City/gi, "Jakarta Barat")
            .replace(/East Jakarta City/gi, "Jakarta Timur")
            .replace(/North Jakarta City/gi, "Jakarta Utara")
            .replace(/\b\d{5}\b/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        const parts = raw
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
        const candidates = [raw, clean];
        const streetOnly = (parts[0] || "")
            .replace(/RT.*$/i, "")
            .replace(/No\..*$/i, "")
            .replace(/\s+/g, " ")
            .trim();
        if (streetOnly) {
            candidates.push(streetOnly + ", Jakarta");
            const simplified = streetOnly
                .replace(
                    /\b(Senayan|Menteng|Tebet|Kuningan|Kemang|Cikini|Sudirman|Thamrin)\b/gi,
                    "",
                )
                .trim();
            if (simplified && simplified !== streetOnly) {
                candidates.push(simplified + ", Jakarta");
                if (parts[2])
                    candidates.push(simplified + ", " + parts[2] + ", Jakarta");
            }
        }
        if (parts.length > 2) {
            candidates.push(parts[0] + ", " + parts[2]);
            candidates.push(parts[2] + ", Jakarta");
        }
        if (parts.length > 3) {
            candidates.push(parts[3] + ", Jakarta");
        }
        return [
            ...new Set(candidates.map((c) => c.replace(/\s+/g, " ").trim())),
        ].filter((c) => c.length > 2);
    }
    async function searchNominatimCandidates(
        rawInput,
        triggerBtn,
        map,
        updatePinFn,
    ) {
        if (!rawInput || !rawInput.trim()) return;
        const candidates = generateAddressCandidates(rawInput.trim());
        if (triggerBtn) {
            triggerBtn.disabled = true;
            triggerBtn.dataset.origText = triggerBtn.textContent;
            triggerBtn.textContent = "Mencari...";
        }
        try {
            for (const q of candidates) {
                try {
                    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&viewbox=106.5,-6.45,107.1,-6.0&bounded=0&q=${encodeURIComponent(q)}`;
                    const res = await fetch(url, {
                        headers: { Accept: "application/json" },
                    });
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const best = data[0];
                        const lat = parseFloat(best.lat);
                        const lon = parseFloat(best.lon);
                        updatePinFn(lat, lon, false);
                        if (map) {
                            const kLat = Number(
                                sData.kitchen?.latitude || -6.1944,
                            );
                            const kLon = Number(
                                sData.kitchen?.longitude || 106.8372,
                            );
                            const bounds = L.latLngBounds([
                                [kLat, kLon],
                                [lat, lon],
                            ]);
                            map.flyToBounds(bounds, {
                                padding: [55, 55],
                                maxZoom: 15,
                                duration: 1.2,
                            });
                        }
                        const label = best.display_name
                            .split(",")
                            .slice(0, 3)
                            .join(", ");
                        toast(`Lokasi ditemukan: ${label}`);
                        return true;
                    }
                } catch (e) {}
            }
            toast(
                "Alamat spesifik belum terindeks otomatis. Silakan geser pin pada peta atau gunakan Layar Penuh.",
            );
            return false;
        } finally {
            if (triggerBtn) {
                triggerBtn.disabled = false;
                triggerBtn.textContent = triggerBtn.dataset.origText || "Cari";
            }
        }
    }
    function initCheckoutMap() {
        const container = $("#map-picker");
        if (!container) return;
        if (typeof L === "undefined") {
            setTimeout(initCheckoutMap, 150);
            return;
        }
        if (window._checkoutMap) {
            try {
                window._checkoutMap.remove();
            } catch (e) {}
            window._checkoutMap = null;
        }
        const kLat = Number(sData.kitchen?.latitude || -6.1944);
        const kLon = Number(sData.kitchen?.longitude || 106.8372);
        const kitchenPos = [kLat, kLon];
        let curLat = Number($("#input-delivery-lat")?.value || -6.21);
        let curLon = Number($("#input-delivery-lon")?.value || 106.845);
        if (isNaN(curLat) || curLat === 0) curLat = -6.21;
        if (isNaN(curLon) || curLon === 0) curLon = 106.845;
        const map = L.map("map-picker", {
            center: [(kLat + curLat) / 2, (kLon + curLon) / 2],
            zoom: 13,
            scrollWheelZoom: true,
        });
        window._checkoutMap = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap",
        }).addTo(map);
        L.circle(kitchenPos, {
            radius: 20000,
            color: "#244d3b",
            weight: 2,
            dashArray: "6, 8",
            fillColor: "#244d3b",
            fillOpacity: 0.07,
        }).addTo(map);
        const kitchenIcon = L.divIcon({
            className: "kitchen-pin",
            html: '<div style="background:#244d3b;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid #fff;font-weight:700;font-size:11px;">D</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
        const kitchenMarker = L.marker(kitchenPos, {
            icon: kitchenIcon,
            title: "Dapur Menteng",
        }).addTo(map);
        kitchenMarker.bindPopup(
            "<b>Dapur Menteng</b><br><small>Titik Asal Katering</small>",
        );
        const customerIcon = L.divIcon({
            className: "customer-pin",
            html: '<div style="background:#b84233;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(184,66,51,0.5);border:2px solid #fff;cursor:grab;"><span style="width:8px;height:8px;background:#fff;border-radius:50%;"></span></div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
        });
        const customerMarker = L.marker([curLat, curLon], {
            draggable: true,
            icon: customerIcon,
            title: "Geser ke titik tujuan",
        }).addTo(map);
        customerMarker.bindPopup(
            "<b>Titik Pengantaran Anda</b><br><small>Geser atau klik peta untuk ubah titik</small>",
        );
        const glowLine = L.polyline([kitchenPos, [curLat, curLon]], {
            color: "#244d3b",
            weight: 7,
            opacity: 0.2,
            className: "delivery-route-glow",
        }).addTo(map);
        const connectionLine = L.polyline([kitchenPos, [curLat, curLon]], {
            color: "#244d3b",
            weight: 3.5,
            className: "delivery-route-animated",
            dashArray: "10, 10",
            opacity: 0.95,
        }).addTo(map);
        const initialDist = calcHaversine(kLat, kLon, curLat, curLon);
        const distanceMarker = L.marker(
            [(kLat + curLat) / 2, (kLon + curLon) / 2],
            {
                icon: L.divIcon({
                    className: "route-midpoint-marker",
                    html: `<div class="route-distance-pill"><span>${initialDist.toFixed(1)} km</span></div>`,
                    iconSize: [85, 26],
                    iconAnchor: [42, 13],
                }),
                interactive: false,
            },
        ).addTo(map);
        const updatePinLocation = (lat, lon, autoGeocode = true) => {
            curLat = lat;
            curLon = lon;
            customerMarker.setLatLng([lat, lon]);
            glowLine.setLatLngs([kitchenPos, [lat, lon]]);
            connectionLine.setLatLngs([kitchenPos, [lat, lon]]);
            const dist = calcHaversine(kLat, kLon, lat, lon);
            distanceMarker.setLatLng([(kLat + lat) / 2, (kLon + lon) / 2]);
            distanceMarker.setIcon(
                L.divIcon({
                    className: "route-midpoint-marker",
                    html: `<div class="route-distance-pill"><span>${dist.toFixed(1)} km</span></div>`,
                    iconSize: [85, 26],
                    iconAnchor: [42, 13],
                }),
            );
            const latInput = $("#input-delivery-lat");
            const lonInput = $("#input-delivery-lon");
            const distInput = $("#input-delivery-dist");
            if (latInput) latInput.value = lat.toFixed(7);
            if (lonInput) lonInput.value = lon.toFixed(7);
            if (distInput) distInput.value = dist.toFixed(1);
            shipping();
            if (autoGeocode) triggerReverseGeocode(lat, lon);
        };
        customerMarker.on("drag", (e) => {
            const p = e.target.getLatLng();
            glowLine.setLatLngs([kitchenPos, [p.lat, p.lng]]);
            connectionLine.setLatLngs([kitchenPos, [p.lat, p.lng]]);
            const dist = calcHaversine(kLat, kLon, p.lat, p.lng);
            distanceMarker.setLatLng([(kLat + p.lat) / 2, (kLon + p.lng) / 2]);
            distanceMarker.setIcon(
                L.divIcon({
                    className: "route-midpoint-marker",
                    html: `<div class="route-distance-pill"><span>${dist.toFixed(1)} km</span></div>`,
                    iconSize: [85, 26],
                    iconAnchor: [42, 13],
                }),
            );
            const readout = $("#distance-readout");
            if (readout) readout.textContent = `${dist.toFixed(1)} km`;
        });
        customerMarker.on("dragend", (e) => {
            const p = e.target.getLatLng();
            updatePinLocation(p.lat, p.lng, true);
            const bounds = L.latLngBounds([kitchenPos, [p.lat, p.lng]]);
            map.flyToBounds(bounds, {
                padding: [55, 55],
                maxZoom: 15,
                duration: 0.9,
            });
        });
        map.on("click", (e) => {
            updatePinLocation(e.latlng.lat, e.latlng.lng, true);
            const bounds = L.latLngBounds([
                kitchenPos,
                [e.latlng.lat, e.latlng.lng],
            ]);
            map.flyToBounds(bounds, {
                padding: [55, 55],
                maxZoom: 15,
                duration: 0.9,
            });
        });
        const btnGps = $("#btn-my-location");
        if (btnGps) {
            btnGps.onclick = () => {
                if (!navigator.geolocation) {
                    toast("Perangkat tidak mendukung GPS.");
                    return;
                }
                btnGps.disabled = true;
                btnGps.textContent = "Mencari GPS...";
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        btnGps.disabled = false;
                        btnGps.innerHTML = `${icon("pin")} Lokasi Saya`;
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        updatePinLocation(lat, lon, true);
                        const bounds = L.latLngBounds([kitchenPos, [lat, lon]]);
                        map.flyToBounds(bounds, {
                            padding: [55, 55],
                            maxZoom: 1.2,
                        });
                        toast("Titik lokasi berhasil ditemukan dari GPS!");
                    },
                    (err) => {
                        btnGps.disabled = false;
                        btnGps.innerHTML = `${icon("pin")} Lokasi Saya`;
                        toast(
                            "GPS tidak dapat diakses. Silakan klik langsung pada peta.",
                        );
                    },
                    { enableHighAccuracy: true, timeout: 8000 },
                );
            };
        }
        const btnSyncAddr = $("#btn-sync-address");
        const txtAddr = $("#checkout-address");
        if (btnSyncAddr && txtAddr) {
            btnSyncAddr.onclick = () =>
                searchNominatimCandidates(
                    txtAddr.value,
                    btnSyncAddr,
                    map,
                    updatePinLocation,
                );
            txtAddr.addEventListener("change", () => {
                if (
                    txtAddr.value.trim() &&
                    txtAddr.dataset.autofilled !== "true"
                ) {
                    searchNominatimCandidates(
                        txtAddr.value,
                        btnSyncAddr,
                        map,
                        updatePinLocation,
                    );
                }
            });
        }
        const sec = $(".map-picker-section");
        const btnFullscreen = $("#btn-toggle-fullscreen");
        const btnApplyFs = $("#btn-apply-fullscreen");
        const labelFs = $("#fullscreen-label");
        const toggleFullscreen = () => {
            if (!sec) return;
            const isFs = sec.classList.toggle("fullscreen-active");
            if (labelFs)
                labelFs.textContent = isFs
                    ? "Tutup Layar Penuh"
                    : "Layar Penuh";
            if (btnApplyFs) btnApplyFs.style.display = isFs ? "block" : "none";
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    const bounds = L.latLngBounds([
                        kitchenPos,
                        [curLat, curLon],
                    ]);
                    map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
                }
            }, 150);
            if (isFs) {
                toast(
                    "Mode layar penuh aktif. Geser pin dengan leluasa lalu klik Terapkan.",
                );
            }
        };
        if (btnFullscreen) btnFullscreen.onclick = toggleFullscreen;
        if (btnApplyFs) btnApplyFs.onclick = toggleFullscreen;
        document.addEventListener("keydown", (e) => {
            if (
                e.key === "Escape" &&
                sec?.classList.contains("fullscreen-active")
            ) {
                toggleFullscreen();
            }
        });
        updatePinLocation(curLat, curLon, false);
        const defLoc = sData.defaultLocation;
        if (defLoc?.latitude && defLoc?.longitude) {
            const d = calcHaversine(kLat, kLon, curLat, curLon);
            if (d > 20.0) {
                const f = $("#checkout-form");
                if (f && f.elements.method) {
                    f.elements.method.value = "pickup";
                    shipping();
                    toast(
                        `Alamat tersimpan berjarak ${d.toFixed(1)} km (di luar radius kurir 20 km). Pilihan pengiriman dialihkan ke Ambil di Dapur.`,
                    );
                }
            }
        } else if (
            defLoc?.source === "profile_address" &&
            txtAddr?.value?.trim()
        ) {
            setTimeout(() => {
                if (btnSyncAddr && txtAddr.value.trim()) {
                    searchNominatimCandidates(
                        txtAddr.value,
                        btnSyncAddr,
                        map,
                        updatePinLocation,
                    );
                }
            }, 600);
        }
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                const bounds = L.latLngBounds([kitchenPos, [curLat, curLon]]);
                map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
            }
        }, 200);
    }
    function shipping() {
        const f = $("#checkout-form");
        if (!f) return 0;
        const pickup = f.elements.method.value === "pickup";
        $("#delivery-fields").hidden = pickup;
        $("#pickup-message").hidden = !pickup;
        f.elements.address.required = !pickup;
        if (pickup) {
            $("#shipping-cost").textContent = money(0);
            $("#grand-total").textContent = money(total(cart));
            const badge = $("#radius-badge");
            if (badge) {
                badge.className = "badge";
                badge.textContent = "Ambil Sendiri";
            }
            const desc = $("#distance-status-desc");
            if (desc)
                desc.textContent =
                    "Pesanan diambil langsung di Dapur Menteng tanpa ongkos kirim.";
            const feeBox = $("#calculated-fee");
            if (feeBox) feeBox.textContent = money(0);
            f.querySelector('[type="submit"]').disabled = false;
            return 0;
        }
        if (window._checkoutMap) {
            setTimeout(() => window._checkoutMap?.invalidateSize(), 150);
        }
        const dist = Number($("#input-delivery-dist")?.value || 3.0);
        const invalid = dist > 20.0;
        const badge = $("#radius-badge");
        const readout = $("#distance-readout");
        const desc = $("#distance-status-desc");
        const feeBox = $("#calculated-fee");
        if (readout) readout.textContent = `${dist.toFixed(1)} km`;
        if (invalid) {
            if (badge) {
                badge.className = "badge danger";
                badge.textContent = "Di Luar Radius 20 km";
            }
            if (desc)
                desc.textContent = `Jarak ${dist.toFixed(1)} km melebihi batas jangkauan kurir (maksimal 20 km). Silakan pilih opsi 'Ambil di dapur (Pick-up)' untuk melanjutkan.`;
            f.querySelector('[type="submit"]').disabled = true;
        } else {
            if (badge) {
                badge.className = "badge success";
                badge.textContent = "Dalam Jangkauan";
            }
            const extraKm = Math.ceil(Math.max(0, dist - 1.0));
            const extraFee = extraKm * 2000;
            if (desc) {
                desc.textContent =
                    dist <= 1.0
                        ? `Tarif dasar 1 km pertama: ${money(5000)} (Jarak: ${dist.toFixed(1)} km dari Dapur Menteng).`
                        : `Rincian: ${money(5000)} (1 km pertama) + ${money(extraFee)} (${extraKm} km × ${money(2000)}).`;
            }
            f.querySelector('[type="submit"]').disabled = false;
        }
        const fee = dist <= 1.0 ? 5000 : 5000 + Math.ceil(dist - 1.0) * 2000;
        if (feeBox) feeBox.textContent = money(fee);
        $("#shipping-cost").textContent = money(fee);
        $("#grand-total").textContent = money(total(cart) + fee);
        return fee;
    }
    document.addEventListener("click", async (e) => {
        const copyBtn = e.target.closest(".copy-btn");
        if (copyBtn) {
            const text = copyBtn.dataset.copy;
            if (text) {
                navigator.clipboard
                    ?.writeText(text)
                    .then(() => {
                        const orig = copyBtn.innerHTML;
                        copyBtn.textContent = "Tersalin! ✓";
                        copyBtn.classList.add("copied");
                        setTimeout(() => {
                            copyBtn.innerHTML = orig;
                            copyBtn.classList.remove("copied");
                        }, 2000);
                        toast(`Tersalin ke clipboard: ${text}`);
                    })
                    .catch(() => toast("Gagal menyalin."));
            }
            return;
        }
        const checkoutLink = e.target.closest('a[href="/checkout"]');
        if (checkoutLink && !user) {
            e.preventDefault();
            showModal(
                `<div class="modal-form"><h2 id="modal-title">Masuk untuk Checkout</h2><p>Untuk melanjutkan ke proses pemesanan dan pembayaran, silakan masuk ke akun Anda atau daftar jika belum memiliki akun.</p><div style="display:flex;flex-direction:column;gap:10px;margin-top:18px;"><a href="/login?return=/checkout" class="button full">Masuk ke Akun</a><a href="/register?return=/checkout" class="button outline full">Daftar Akun Baru</a><button type="button" class="button outline" data-action="close">Kembali ke Keranjang</button></div></div>`,
            );
            return;
        }
        const el = e.target.closest("[data-action]");
        if (!el) return;
        const a = el.dataset.action,
            id = Number(el.dataset.id),
            i = Number(el.dataset.index);
        if (a === "clear-proof") {
            const input = $(
                'input[name="bukti_transfer"], input[name="proof"]',
            );
            if (input) input.value = "";
            const p = $("#proof-preview");
            if (p) p.innerHTML = "";
            const err = $("#payment-error");
            if (err) err.textContent = "";
            return;
        }
        if (a === "nav") {
            $("#navigation").classList.toggle("open");
            el.setAttribute(
                "aria-expanded",
                $("#navigation").classList.contains("open"),
            );
        }
        if (a === "category") {
            activeCategory = el.dataset.category;
            window.history.pushState(
                null,
                "",
                "/menu?kategori=" + activeCategory,
            );
            $("#main").innerHTML = catalog();
        }
        if (a === "detail") detail(id);
        if (a === "qty") {
            const item = cart[i];
            item.qty = Math.max(item.min, item.qty + Number(el.dataset.delta));
            persistCart();
            render();
        }
        if (a === "remove") {
            const item = cart[i];
            if (item.cart_id) {
                try {
                    await fetch("/keranjang/" + item.cart_id, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-CSRF-TOKEN": sData.csrfToken,
                        },
                    });
                } catch (e) {}
            }
            cart.splice(i, 1);
            persistCart();
            render();
            toast("Menu dihapus dari keranjang.");
        }
        if (a === "close") $("#modal").close();
        if (a === "logout")
            showModal(
                `<div class="modal-form"><h2 id="modal-title">Keluar dari akun?</h2><p>Sesi Anda akan diakhiri. Anda dapat masuk kembali kapan saja.</p><div style="display:flex;gap:10px;margin-top:18px;"><button type="button" class="button" data-action="confirm-logout">Ya, keluar akun</button><button type="button" class="button outline" data-action="close">Batal</button></div></div>`,
            );
        if (a === "confirm-logout") {
            try {
                const res = await fetch("/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": sData.csrfToken,
                    },
                });
                if (res.ok) {
                    user = null;
                    cart = [];
                    persistCart();
                    location.href = "/login";
                }
            } catch (e) {
                location.href = "/logout";
            }
        }
        if (a === "show-invoice")
            showInvoice(el.dataset.id || selectedOrder()?.id, true);
        if (a === "print-thermal" || a === "print") window.print();
        if (a === "history-filter") {
            const f = el.dataset.filter;
            document
                .querySelectorAll(".history-tabs button")
                .forEach((b) => b.setAttribute("aria-pressed", b === el));
            const all = customerOrders();
            const list =
                f === "active"
                    ? all.filter((o) => o.status < 3)
                    : f === "done"
                      ? all.filter((o) => o.status === 3)
                      : all;
            $("#history-list").innerHTML = historyCards(list);
        }
        if (a === "zoom-menu-img") {
            const img = $("#menu-img-preview");
            if (img)
                openLightbox(
                    img.src,
                    $('#menu-form input[name="name"]')?.value ||
                        "Pratinjau Foto Menu",
                );
        }
        if (a === "edit-menu") editMenu(id);
        if (a === "availability") {
            const m = menus.find((m) => m.id === id);
            if (!m) return;
            try {
                const r = await fetch("/admin/menu/" + id + "/toggle", {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": sData.csrfToken,
                    },
                });
                const d = await r.json();
                if (r.ok) {
                    m.available = d.menu?.status_tersedia ?? !m.available;
                    render();
                    toast(d.message || "Ketersediaan menu diperbarui.");
                } else toast(d.message || "Gagal mengubah status.");
            } catch (e) {
                toast("Gagal menghubungi server.");
            }
        }
        if (a === "delete-menu")
            showModal(
                `<div class="modal-form"><h2 id="modal-title">Hapus menu ini?</h2><p>Menu akan dihapus dari katalog. Pesanan yang sudah dibuat tetap tersimpan.</p><button class="button" data-action="confirm-delete" data-id="${id}">Hapus menu</button> <button class="button outline" data-action="close">Batal</button></div>`,
            );
        if (a === "confirm-delete") {
            try {
                const r = await fetch("/admin/menu/" + id, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": sData.csrfToken,
                    },
                });
                const d = await r.json();
                if (r.ok) {
                    menus = menus.filter((m) => m.id !== id);
                    $("#modal").close();
                    render();
                    toast(d.message || "Menu dihapus.");
                } else toast(d.message || "Gagal menghapus.");
            } catch (e) {
                toast("Gagal menghubungi server.");
            }
        }
        if (a === "order-detail")
            orderDetail(el.dataset.id, el.dataset.fromCustomer);
        if (a === "verify") {
            const o = orders.find(
                (o) =>
                    o.id === el.dataset.id || String(o.rawId) === el.dataset.id,
            );
            if (!o) return;
            const tid = o.rawId || o.id;
            try {
                const r = await fetch("/admin/pesanan/" + tid + "/verify", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": sData.csrfToken,
                    },
                });
                const d = await r.json();
                if (r.ok) {
                    o.payment = "Lunas";
                    o.status = 1;
                    $("#modal").close();
                    render();
                    toast(d.message || "Pembayaran diverifikasi.");
                } else toast(d.message || "Gagal memverifikasi.");
            } catch (e) {
                toast("Gagal menghubungi server.");
            }
        }
        if (a === "reject") {
            showModal(
                `<form id="reject-form" data-id="${esc(el.dataset.id)}" class="modal-form"><h2 id="modal-title">Tolak bukti pembayaran</h2><label>Alasan penolakan<textarea name="reason" rows="3" maxlength="500" placeholder="Jelaskan apa yang perlu diperbaiki pelanggan" required></textarea></label><button class="button full">Kirim alasan penolakan</button></form>`,
            );
        }
        if (a === "customer") {
            const list =
                sData.customers && sData.customers.length
                    ? sData.customers
                    : customers;
            const c = list[i];
            if (!c) return;
            const cOrders =
                c.orders && c.orders.length
                    ? c.orders.map(mapOrder)
                    : orders.filter((o) => o.email === c.email);
            showModal(
                `<div class="modal-form"><h2 id="modal-title">Riwayat: ${esc(c.name)}</h2><p class="muted small-text">${esc(c.email)}${c.phone ? " · " + esc(c.phone) : ""}</p>${historyCards(cOrders, true, i)}</div>`,
            );
        }
        if (a === "export") {
            location.href = "/admin/laporan/export-csv";
            toast("Laporan CSV diunduh.");
        }
    });
    document.addEventListener("input", (e) => {
        if (e.target.id === "menu-search") {
            const q = e.target.value.toLowerCase();
            const list = menus.filter(
                (m) =>
                    m.available &&
                    m.category === activeCategory &&
                    (m.name + " " + m.desc).toLowerCase().includes(q),
            );
            $("#menu-grid").innerHTML =
                list.map(menuCard).join("") ||
                empty(
                    "Menu belum ditemukan",
                    "Coba nama lauk lain atau ganti kategori.",
                );
        }
        if (e.target.matches?.("#auth-form input, #auth-form textarea"))
            e.target.removeAttribute("aria-invalid");
        if (e.target.name === "price" && e.target.closest("#menu-form")) {
            const pv = $("#price-preview");
            if (pv) pv.textContent = money(e.target.value) + " / porsi";
        }
    });
    document.addEventListener("change", (e) => {
        if (e.target.matches("[data-cart-note]")) {
            cart[Number(e.target.dataset.cartNote)].note = e.target.value;
            persistCart();
        }
        if (e.target.matches("[data-cart-qty]")) {
            const x = cart[Number(e.target.dataset.cartQty)];
            const n = Number(e.target.value);
            x.qty = Number.isInteger(n) ? Math.max(x.min, n) : x.min;
            persistCart();
            render();
        }
        if (e.target.closest("#checkout-form")) shipping();
        if (e.target.name === "category" && e.target.closest("#menu-form")) {
            const mi = $('#menu-form input[name="min"]');
            const defs = { satuan: 1, box: 10, prasmanan: 30 };
            if (mi && defs[e.target.value]) mi.value = defs[e.target.value];
            const fi = $('#menu-form input[name="foto_menu"]');
            if (!fi?.files?.length) {
                const pv = $("#menu-img-preview"),
                    h = $("#menu-img-preview-hint");
                if (pv) pv.src = "/images/" + e.target.value + ".jpg";
                if (h)
                    h.textContent =
                        "Ilustrasi bawaan " +
                        cats[e.target.value] +
                        " (pilih berkas untuk mengganti)";
            }
        }
        if (e.target.name === "foto_menu") {
            const f = e.target.files?.[0];
            if (f) {
                const ext = (f.name.split(".").pop() || "").toLowerCase(),
                    valid =
                        ["image/jpeg", "image/png", "image/webp"].includes(
                            f.type,
                        ) || ["jpg", "jpeg", "png", "webp"].includes(ext);
                if (!valid) {
                    toast("Pilih foto JPG, PNG, atau WebP.");
                    return;
                }
                if (f.size > 2 * 1024 * 1024) {
                    toast("Foto terlalu besar (maksimal 2 MB).");
                    return;
                }
                const url = URL.createObjectURL(f),
                    pv = $("#menu-img-preview"),
                    lbl = $("#menu-img-preview-label"),
                    h = $("#menu-img-preview-hint");
                if (pv) pv.src = url;
                if (lbl) lbl.textContent = "Foto baru dipilih";
                if (h)
                    h.textContent =
                        esc(f.name) +
                        " (" +
                        Math.round(f.size / 1024) +
                        " KB) — Siap disimpan";
            }
        }
        if (e.target.name === "bukti_transfer" || e.target.name === "proof")
            handleFilePreview(e.target.files[0], e.target);
    });
    document.addEventListener("reset", (e) => {
        if (e.target.id === "order-filter")
            setTimeout(
                () => ($("#orders-table").innerHTML = orderTable(orders)),
                0,
            );
    });
    document.addEventListener("submit", async (e) => {
        const f = e.target;
        if (f.id === "checkout-form") {
            if (f.querySelector('[type="submit"]').disabled) {
                e.preventDefault();
                return;
            }
            const d = new FormData(f),
                delDate = d.get("delivery_date") || d.get("deliveryDate");
            if (delDate < tomorrow()) {
                e.preventDefault();
                toast("Pilih tanggal acara paling awal besok.");
                return;
            }
            return;
        }
        if (f.id === "payment-form") {
            const file = f.querySelector('input[type="file"]')?.files[0];
            if (
                !file ||
                file.size > 2 * 1024 * 1024 ||
                !["image/jpeg", "image/png", "application/pdf"].includes(
                    file.type,
                )
            ) {
                e.preventDefault();
                const err = $("#payment-error");
                if (err)
                    err.textContent = "Pilih JPG, PNG, atau PDF maksimal 2 MB.";
                return;
            }
            const btn = f.querySelector('[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.textContent = "Mengunggah bukti pembayaran...";
            }
            return;
        }
        if (f.id === "auth-form") return;
        e.preventDefault();
        const d = new FormData(f);
        if (f.id === "add-form") {
            const m = menus.find((x) => x.id === Number(f.dataset.id)),
                qty = Number(d.get("qty"));
            if (!Number.isInteger(qty) || qty < m.min) {
                toast(
                    `Minimal pemesanan untuk ${m.name} adalah ${m.min} porsi.`,
                );
                return;
            }
            const note = d.get("note") || "";
            try {
                const res = await fetch("/keranjang", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": sData.csrfToken,
                    },
                    body: JSON.stringify({
                        id_menu: m.id,
                        kuantitas: qty,
                        catatan: note,
                    }),
                });
                const json = await res.json();
                if (!res.ok) {
                    toast(
                        json.message ||
                            Object.values(json.errors || {})[0]?.[0] ||
                            "Gagal menambahkan menu.",
                    );
                    return;
                }
                if (json.items && json.items.length) {
                    cart = json.items.map((it) => ({
                        id: it.id_menu || it.menu_id || it.menu?.id,
                        cart_id: it.id,
                        name:
                            it.menu?.nama_menu ||
                            it.menu?.name ||
                            it.nama_menu ||
                            m.name,
                        price: Number(
                            it.menu?.harga ||
                                it.menu?.price ||
                                it.harga ||
                                m.price,
                        ),
                        min:
                            it.menu?.minimal_pesanan ||
                            it.menu?.min_order ||
                            m.min ||
                            1,
                        image:
                            it.menu?.foto_menu ||
                            it.menu?.image_path ||
                            m.image ||
                            "box.jpg",
                        qty: Number(it.kuantitas || it.quantity),
                        note: it.catatan || it.notes || "",
                    }));
                } else {
                    const found = cart.find(
                        (x) => x.id === m.id && x.note === note,
                    );
                    if (found) found.qty += qty;
                    else cart.push({ ...m, qty, note });
                }
                headerCount();
                $("#modal").close();
                toast(`${qty} porsi ditambahkan ke keranjang.`);
            } catch (err) {
                toast("Gagal menghubungi server.");
            }
            return;
        }
        if (f.id === "menu-form") {
            const id = Number(f.dataset.id),
                isEdit = !isNaN(id) && id > 0,
                catsMap = { satuan: 1, box: 2, prasmanan: 3 },
                cSlug = d.get("category") || "satuan";
            const fd = new FormData();
            fd.append("nama_menu", d.get("name"));
            fd.append("id_kategori", catsMap[cSlug] || 1);
            fd.append("harga", d.get("price"));
            fd.append("minimal_pesanan", d.get("min"));
            fd.append("jenis_paket", cSlug);
            fd.append("deskripsi", d.get("desc") || d.get("name") || "-");
            fd.append("status_tersedia", d.get("status_tersedia") ? "1" : "0");
            const fi = f.querySelector('input[type="file"]');
            if (fi?.files?.[0]) {
                const file = fi.files[0],
                    ext = (file.name.split(".").pop() || "").toLowerCase();
                if (
                    file.size > 2 * 1024 * 1024 ||
                    (!["image/jpeg", "image/png", "image/webp"].includes(
                        file.type,
                    ) &&
                        !["jpg", "jpeg", "png", "webp"].includes(ext))
                ) {
                    toast("Foto harus JPG, PNG, atau WebP maksimal 2 MB.");
                    return;
                }
                fd.append("foto_menu", file);
            }
            if (isEdit) fd.append("_method", "PUT");
            try {
                const r = await fetch(
                    isEdit ? "/admin/menu/" + id : "/admin/menu",
                    {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "X-CSRF-TOKEN": sData.csrfToken,
                        },
                        body: fd,
                    },
                );
                const res = await r.json();
                if (r.ok) {
                    $("#modal").close();
                    toast(res.message || "Menu disimpan.");
                    setTimeout(() => location.reload(), 400);
                } else toast(res.message || "Gagal menyimpan menu.");
            } catch (e) {
                toast("Gagal menghubungi server.");
            }
        }
        if (f.id === "status-form") {
            const o = orders.find(
                (x) =>
                    x.id === f.dataset.id || String(x.rawId) === f.dataset.id,
            );
            if (!o) return;
            const tid = o.rawId || o.id,
                nextStatus = Number(d.get("status"));
            try {
                const r = await fetch("/admin/pesanan/" + tid + "/status", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": sData.csrfToken,
                    },
                    body: JSON.stringify({ status_pesanan: nextStatus }),
                });
                const res = await r.json();
                if (r.ok) {
                    o.status = nextStatus;
                    $("#modal").close();
                    render();
                    toast(res.message || "Progres pesanan diperbarui.");
                } else toast(res.message || "Gagal mengubah status.");
            } catch (e) {
                toast("Gagal menghubungi server.");
            }
        }
        if (f.id === "reject-form") {
            const o = orders.find(
                (x) =>
                    x.id === f.dataset.id || String(x.rawId) === f.dataset.id,
            );
            if (!o) return;
            const tid = o.rawId || o.id,
                reason = d.get("reason") || "";
            try {
                const r = await fetch("/admin/pesanan/" + tid + "/reject", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": sData.csrfToken,
                    },
                    body: JSON.stringify({
                        catatan_penolakan: reason,
                        reason: reason,
                    }),
                });
                const res = await r.json();
                if (r.ok) {
                    o.payment = "Ditolak";
                    o.status = 4;
                    o.rejection = reason;
                    $("#modal").close();
                    render();
                    toast(res.message || "Bukti ditolak.");
                } else toast(res.message || "Gagal menolak bukti.");
            } catch (e) {
                toast("Gagal menghubungi server.");
            }
        }
        if (f.id === "order-filter") {
            const q = String(d.get("search")).toLowerCase();
            $("#orders-table").innerHTML = orderTable(
                orders.filter(
                    (o) =>
                        (o.id + " " + o.name).toLowerCase().includes(q) &&
                        (d.get("status") === "" ||
                            o.status === Number(d.get("status"))) &&
                        (!d.get("payment") || o.payment === d.get("payment")),
                ),
            );
        }
        if (f.id === "report-filter") {
            if (d.get("start") > d.get("end")) {
                toast("Tanggal akhir harus setelah tanggal mulai.");
                return;
            }
            renderReport();
        }
    });
    $("#modal").addEventListener("click", (e) => {
        if (e.target === $("#modal")) {
            const r = e.target.getBoundingClientRect();
            if (
                e.clientX < r.left ||
                e.clientX > r.right ||
                e.clientY < r.top ||
                e.clientY > r.bottom
            )
                e.target.close();
        }
    });
    $("#modal").addEventListener("close", () =>
        document.body.classList.remove("print-receipt"),
    );
    window.addEventListener("popstate", () => {
        if (page === "catalog") {
            activeCategory =
                new URLSearchParams(location.search).get("kategori") ||
                "satuan";
            if (!cats[activeCategory]) activeCategory = "satuan";
            $("#main").innerHTML = catalog();
        }
    });
    header();
    render();
    if (admin) {
        const sidebar = $(".sidebar"),
            current = sidebar.querySelector("[aria-current=page]");
        if (matchMedia("(max-width:700px)").matches && current)
            sidebar.scrollLeft +=
                current.getBoundingClientRect().left -
                sidebar.getBoundingClientRect().left -
                16;
        decorateAdminTables();
        const tableObserver = new MutationObserver(decorateAdminTables);
        tableObserver.observe($("#main"), { childList: true, subtree: true });
    }
    if (sData.flash?.success) {
        setTimeout(() => toast(sData.flash.success), 150);
    }
    if (sData.flash?.error && !["login", "register"].includes(page)) {
        setTimeout(() => toast(sData.flash.error), 150);
    }
})();
