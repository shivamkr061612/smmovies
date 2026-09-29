# cPanel-ready SM Movies export

## Goal
Make the existing site build into a static package that can be uploaded to shared Apache/LiteSpeed hosting, while preserving live movie loading and direct deep-link refreshes.

## Work
- Add a dedicated cPanel build mode that prerenders a root SPA shell and packages it as `index.html`.
- Route cPanel content requests through a PHP proxy restricted to the known movie-source hosts; leave the existing hosted app proxy unchanged.
- Add Apache `.htaccess` SPA fallback rules and a short upload/build guide.
- Validate the cPanel build output and ensure the root page, PHP proxy, static assets, and rewrite file are included.

## Technical details
- Keep the production Cloudflare/Lovable configuration as the default; cPanel behavior is selected only by `npm run build:cpanel`.
- Build output stays in the normal Vite distribution folder for easy extraction and upload to `public_html`.
