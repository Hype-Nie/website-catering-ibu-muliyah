let reverseGeocodeTimer = null;
function calcHaversine(lat1, lon1, lat2, lon2) {
  const toRad = (x) => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)) * 10) / 10;
}
function triggerReverseGeocode(lat, lon) {
  clearTimeout(reverseGeocodeTimer);
  reverseGeocodeTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.display_name) {
        const addr = $("#checkout-address");
        if (addr && (!addr.value.trim() || addr.dataset.autofilled === "true")) {
          addr.value = data.display_name;
          addr.dataset.autofilled = "true";
        }
      }
    } catch (e) {
    }
  }, 800);
}
function generateAddressCandidates(raw) {
  if (!raw) return [];
  const clean = raw.replace(/RT\s*\.?\s*\d+\s*[\/\-]\s*RW\s*\.?\s*\d+/gi, " ").replace(/RT\s*\.?\s*\d+/gi, " ").replace(/RW\s*\.?\s*\d+/gi, " ").replace(/No\s*\.?\s*\d+[a-zA-Z]?/gi, " ").replace(/Nomor\s*\d+/gi, " ").replace(/Central Jakarta City/gi, "Jakarta Pusat").replace(/South Jakarta City/gi, "Jakarta Selatan").replace(/West Jakarta City/gi, "Jakarta Barat").replace(/East Jakarta City/gi, "Jakarta Timur").replace(/North Jakarta City/gi, "Jakarta Utara").replace(/\b\d{5}\b/g, " ").replace(/\s+/g, " ").trim();
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  const candidates = [raw, clean];
  const streetOnly = (parts[0] || "").replace(/RT.*$/i, "").replace(/No\..*$/i, "").replace(/\s+/g, " ").trim();
  if (streetOnly) {
    candidates.push(streetOnly + ", Jakarta");
    const simplified = streetOnly.replace(/\b(Senayan|Menteng|Tebet|Kuningan|Kemang|Cikini|Sudirman|Thamrin)\b/gi, "").trim();
    if (simplified && simplified !== streetOnly) {
      candidates.push(simplified + ", Jakarta");
      if (parts[2]) candidates.push(simplified + ", " + parts[2] + ", Jakarta");
    }
  }
  if (parts.length > 2) {
    candidates.push(parts[0] + ", " + parts[2]);
    candidates.push(parts[2] + ", Jakarta");
  }
  if (parts.length > 3) {
    candidates.push(parts[3] + ", Jakarta");
  }
  return [...new Set(candidates.map((c) => c.replace(/\s+/g, " ").trim()))].filter((c) => c.length > 2);
}
async function searchNominatimCandidates(rawInput, triggerBtn, map, updatePinFn) {
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
        const res = await fetch(url, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        if (data && data.length > 0) {
          const best = data[0];
          const lat = parseFloat(best.lat);
          const lon = parseFloat(best.lon);
          updatePinFn(lat, lon, false);
          if (map) {
            const kLat = Number(sData.kitchen?.latitude || -6.1944);
            const kLon = Number(sData.kitchen?.longitude || 106.8372);
            const bounds = L.latLngBounds([[kLat, kLon], [lat, lon]]);
            map.flyToBounds(bounds, { padding: [55, 55], maxZoom: 15, duration: 1.2 });
          }
          const label = best.display_name.split(",").slice(0, 3).join(", ");
          toast(`Lokasi ditemukan: ${label}`);
          return true;
        }
      } catch (e) {
      }
    }
    toast("Alamat spesifik belum terindeks otomatis. Silakan geser pin pada peta atau gunakan Layar Penuh.");
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
    } catch (e) {
    }
    window._checkoutMap = null;
  }
  const kLat = Number(sData.kitchen?.latitude || -6.1944);
  const kLon = Number(sData.kitchen?.longitude || 106.8372);
  const kitchenPos = [kLat, kLon];
  let curLat = Number($("#input-delivery-lat")?.value || -6.21);
  let curLon = Number($("#input-delivery-lon")?.value || 106.845);
  if (isNaN(curLat) || curLat === 0) curLat = -6.21;
  if (isNaN(curLon) || curLon === 0) curLon = 106.845;
  const map = L.map("map-picker", { center: [(kLat + curLat) / 2, (kLon + curLon) / 2], zoom: 13, scrollWheelZoom: true });
  window._checkoutMap = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(map);
  L.circle(kitchenPos, { radius: 2e4, color: "#244d3b", weight: 2, dashArray: "6, 8", fillColor: "#244d3b", fillOpacity: 0.07 }).addTo(map);
  const kitchenIcon = L.divIcon({ className: "kitchen-pin", html: '<div style="background:#244d3b;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid #fff;font-weight:700;font-size:11px;">D</div>', iconSize: [32, 32], iconAnchor: [16, 16] });
  const kitchenMarker = L.marker(kitchenPos, { icon: kitchenIcon, title: "Dapur Menteng" }).addTo(map);
  kitchenMarker.bindPopup("<b>Dapur Menteng</b><br><small>Titik Asal Katering</small>");
  const customerIcon = L.divIcon({ className: "customer-pin", html: '<div style="background:#b84233;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(184,66,51,0.5);border:2px solid #fff;cursor:grab;"><span style="width:8px;height:8px;background:#fff;border-radius:50%;"></span></div>', iconSize: [28, 28], iconAnchor: [14, 14] });
  const customerMarker = L.marker([curLat, curLon], { draggable: true, icon: customerIcon, title: "Geser ke titik tujuan" }).addTo(map);
  customerMarker.bindPopup("<b>Titik Pengantaran Anda</b><br><small>Geser atau klik peta untuk ubah titik</small>");
  const glowLine = L.polyline([kitchenPos, [curLat, curLon]], { color: "#244d3b", weight: 7, opacity: 0.2, className: "delivery-route-glow" }).addTo(map);
  const connectionLine = L.polyline([kitchenPos, [curLat, curLon]], { color: "#244d3b", weight: 3.5, className: "delivery-route-animated", dashArray: "10, 10", opacity: 0.95 }).addTo(map);
  const initialDist = calcHaversine(kLat, kLon, curLat, curLon);
  const distanceMarker = L.marker([(kLat + curLat) / 2, (kLon + curLon) / 2], { icon: L.divIcon({ className: "route-midpoint-marker", html: `<div class="route-distance-pill"><span>${initialDist.toFixed(1)} km</span></div>`, iconSize: [85, 26], iconAnchor: [42, 13] }), interactive: false }).addTo(map);
  const updatePinLocation = (lat, lon, autoGeocode = true) => {
    curLat = lat;
    curLon = lon;
    customerMarker.setLatLng([lat, lon]);
    glowLine.setLatLngs([kitchenPos, [lat, lon]]);
    connectionLine.setLatLngs([kitchenPos, [lat, lon]]);
    const dist = calcHaversine(kLat, kLon, lat, lon);
    distanceMarker.setLatLng([(kLat + lat) / 2, (kLon + lon) / 2]);
    distanceMarker.setIcon(L.divIcon({ className: "route-midpoint-marker", html: `<div class="route-distance-pill"><span>${dist.toFixed(1)} km</span></div>`, iconSize: [85, 26], iconAnchor: [42, 13] }));
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
    distanceMarker.setIcon(L.divIcon({ className: "route-midpoint-marker", html: `<div class="route-distance-pill"><span>${dist.toFixed(1)} km</span></div>`, iconSize: [85, 26], iconAnchor: [42, 13] }));
    const readout = $("#distance-readout");
    if (readout) readout.textContent = `${dist.toFixed(1)} km`;
  });
  customerMarker.on("dragend", (e) => {
    const p = e.target.getLatLng();
    updatePinLocation(p.lat, p.lng, true);
    const bounds = L.latLngBounds([kitchenPos, [p.lat, p.lng]]);
    map.flyToBounds(bounds, { padding: [55, 55], maxZoom: 15, duration: 0.9 });
  });
  map.on("click", (e) => {
    updatePinLocation(e.latlng.lat, e.latlng.lng, true);
    const bounds = L.latLngBounds([kitchenPos, [e.latlng.lat, e.latlng.lng]]);
    map.flyToBounds(bounds, { padding: [55, 55], maxZoom: 15, duration: 0.9 });
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
      navigator.geolocation.getCurrentPosition((pos) => {
        btnGps.disabled = false;
        btnGps.innerHTML = `${icon("pin")} Lokasi Saya`;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        updatePinLocation(lat, lon, true);
        const bounds = L.latLngBounds([kitchenPos, [lat, lon]]);
        map.flyToBounds(bounds, { padding: [55, 55], maxZoom: 1.2 });
        toast("Titik lokasi berhasil ditemukan dari GPS!");
      }, (err) => {
        btnGps.disabled = false;
        btnGps.innerHTML = `${icon("pin")} Lokasi Saya`;
        toast("GPS tidak dapat diakses. Silakan klik langsung pada peta.");
      }, { enableHighAccuracy: true, timeout: 8e3 });
    };
  }
  const btnSyncAddr = $("#btn-sync-address");
  const txtAddr = $("#checkout-address");
  if (btnSyncAddr && txtAddr) {
    btnSyncAddr.onclick = () => searchNominatimCandidates(txtAddr.value, btnSyncAddr, map, updatePinLocation);
    txtAddr.addEventListener("change", () => {
      if (txtAddr.value.trim() && txtAddr.dataset.autofilled !== "true") {
        searchNominatimCandidates(txtAddr.value, btnSyncAddr, map, updatePinLocation);
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
    if (labelFs) labelFs.textContent = isFs ? "Tutup Layar Penuh" : "Layar Penuh";
    if (btnApplyFs) btnApplyFs.style.display = isFs ? "block" : "none";
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        const bounds = L.latLngBounds([kitchenPos, [curLat, curLon]]);
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
      }
    }, 150);
    if (isFs) {
      toast("Mode layar penuh aktif. Geser pin dengan leluasa lalu klik Terapkan.");
    }
  };
  if (btnFullscreen) btnFullscreen.onclick = toggleFullscreen;
  if (btnApplyFs) btnApplyFs.onclick = toggleFullscreen;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sec?.classList.contains("fullscreen-active")) {
      toggleFullscreen();
    }
  });
  updatePinLocation(curLat, curLon, false);
  const defLoc = sData.defaultLocation;
  if (defLoc?.latitude && defLoc?.longitude) {
    const d = calcHaversine(kLat, kLon, curLat, curLon);
    if (d > 20) {
      const f = $("#checkout-form");
      if (f && f.elements.method) {
        f.elements.method.value = "pickup";
        shipping();
        toast(`Alamat tersimpan berjarak ${d.toFixed(1)} km (di luar radius kurir 20 km). Pilihan pengiriman dialihkan ke Ambil di Dapur.`);
      }
    }
  } else if (defLoc?.source === "profile_address" && txtAddr?.value?.trim()) {
    setTimeout(() => {
      if (btnSyncAddr && txtAddr.value.trim()) {
        searchNominatimCandidates(txtAddr.value, btnSyncAddr, map, updatePinLocation);
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
