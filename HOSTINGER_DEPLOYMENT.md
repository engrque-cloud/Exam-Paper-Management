# Deploying to Hostinger Guide

This project is pre-configured and ready for one-click upload to Hostinger Web Hosting (Shared, Cloud, or VPS).

---

## What has been pre-configured:
1. **Hostinger Apache/LiteSpeed `.htaccess`**: Pre-placed in `public/.htaccess`. It automatically copies into `dist/.htaccess` on build. Handles SPA route rewrites, prevents 404 on page refresh, forces HTTPS, and applies browser caching.
2. **Relative Path Resolution (`base: './'`)**: Configured in `vite.config.ts` so the application works seamlessly whether deployed at the domain root (`example.com`) or inside a subdirectory/subdomain (`example.com/portal/`).

---

## 3-Step Upload Instructions for Hostinger

### 1. Build the Production Bundle
If you have exported the code to your local machine:
```bash
npm install
npm run build
```
The compiled production files will be located in the **`dist/`** directory.

---

### 2. Upload to Hostinger File Manager
1. Log into your **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Websites** → click **Manage** next to your domain.
3. Open **File Manager** (Files → File Manager).
4. Navigate into the **`public_html`** directory (or your subdomain directory).
5. If there is a default file like `default.php`, delete it.
6. Upload the files inside `dist/`:
   - Either compress the contents of `dist/` into a `dist.zip`, upload to `public_html/`, and click **Extract**.
   - Or drag and drop all files and folders directly from `dist/`.

> **Verification:** Your `public_html/` should contain:
> - `index.html`
> - `.htaccess`
> - `assets/` (folder containing JS, CSS, and fonts)

---

### 3. Verify SSL & Launch
1. In hPanel, navigate to **Security** → **SSL**.
2. Ensure SSL is **Active** and toggle **Force HTTPS** ON.
3. Open your domain (e.g., `https://yourcollege.edu`) in any browser.
