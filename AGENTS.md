# Project architecture rules

- Keep cPanel support as a separate static-export build mode, with a host-side PHP proxy and Apache rewrite files packaged into `dist/cpanel`, because shared hosting cannot run the existing TanStack server routes.