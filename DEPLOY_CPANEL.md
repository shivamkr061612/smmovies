# Host SM Movies on shared cPanel

This project now has a dedicated static export for Apache/LiteSpeed shared hosting. It keeps the regular Lovable/Cloudflare build unchanged.

## Build the upload folder

From the project root, run:

```sh
npm install
npm run build:cpanel
```

The ready-to-upload website is created at `dist/cpanel/`. The generated `index.html`, compiled assets, `.htaccess`, and `api/proxy.php` are all included together.

The repository’s **Actions → Build cPanel upload package → Run workflow** also builds the same folder and makes it available as a downloadable `sm-movies-cpanel` artifact.

## Upload

In cPanel File Manager, open `public_html` and upload **the contents** of `dist/cpanel/` (not the `cpanel` folder itself). Keep the `api` directory and `.htaccess` file in place. If cPanel hides dotfiles, enable “Show Hidden Files” before confirming `.htaccess` was uploaded.

## Hosting requirements and limits

- Enable PHP 8 or newer and the PHP cURL extension in cPanel’s PHP Selector. The same-origin PHP proxy is needed because this site loads its catalogue from external movie-source domains.
- `.htaccess` enables deep links to load and refresh on Apache/LiteSpeed. The host must allow `mod_rewrite` and `.htaccess` overrides.
- This export is a client-rendered static shell: the initial page HTML is generic; movie data loads in the browser.
- The PHP proxy only accepts the configured MoviesDrive mirror domains and `mdrive.lol`; it is not an open proxy.

If your cPanel host provides an older PHP release without `str_ends_with`, upgrade PHP to version 8 or newer.