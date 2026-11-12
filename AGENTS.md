# Project architecture rules

- Keep cPanel support as a separate static-export build mode, with a host-side PHP proxy and Apache rewrite files packaged into `dist/cpanel`, because shared hosting cannot run the existing TanStack server routes.
- Keep the approved upstream-host allowlist and redirect validation aligned between the Worker proxy and cPanel PHP proxy, because both deployment modes must fetch the same sources without becoming open proxies.