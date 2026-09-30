import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const clientDir = resolve(root, "dist/client");
const shellPath = resolve(clientDir, "_shell.html");
const packageDir = resolve(root, "dist/cpanel");

try {
  await readFile(shellPath);
} catch {
  throw new Error(`Static shell was not generated at ${shellPath}`);
}

await rm(packageDir, { recursive: true, force: true });
await cp(clientDir, packageDir, { recursive: true });
await copyFile(shellPath, resolve(packageDir, "index.html"));
await mkdir(resolve(packageDir, "api"), { recursive: true });
await copyFile(resolve(root, "public/.htaccess"), resolve(packageDir, ".htaccess"));
await copyFile(resolve(root, "public/api/proxy.php"), resolve(packageDir, "api/proxy.php"));

const readme = `SM Movies — cPanel upload package

Upload the contents of this folder (not the folder itself) into public_html.
The package includes index.html, static assets, .htaccess, and api/proxy.php.
The movie feed uses PHP cURL and requires PHP 8+ with the cURL extension enabled.
`;
await writeFile(resolve(packageDir, "UPLOAD-TO-CPANEL.txt"), readme);

console.log(`cPanel upload package ready: ${packageDir}`);