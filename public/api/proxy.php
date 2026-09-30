<?php
declare(strict_types=1);

// Minimal same-origin proxy for the cPanel static build. Only known content
// domains are accepted; arbitrary hosts and non-HTTP(S) URLs are rejected.
function allowed_host(string $host): bool {
    $host = strtolower(rtrim($host, '.'));
    return in_array($host, [
        'mdrive.lol',
        'new1.moviesdrive.christmas',
        'new2.moviesdrive.christmas',
        'new3.moviesdrive.christmas',
        'moviesdrive.christmas',
        'new6.moviesdrives.my',
        'new3.moviesdrives.my',
    ], true);
}

function checked_url(string $url): ?array {
    $parts = parse_url($url);
    if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) return null;
    if (!in_array(strtolower($parts['scheme']), ['http', 'https'], true)) return null;
    if (isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) return null;
    if (filter_var($parts['host'], FILTER_VALIDATE_IP) !== false || !allowed_host($parts['host'])) return null;
    return $parts;
}

function resolve_location(string $current, string $location): string {
    if (preg_match('~^https?://~i', $location)) return $location;
    $base = parse_url($current);
    if (!is_array($base) || !isset($base['scheme'], $base['host'])) return '';
    if (str_starts_with($location, '//')) return $base['scheme'] . ':' . $location;
    $origin = $base['scheme'] . '://' . $base['host'];
    if (str_starts_with($location, '/')) return $origin . $location;
    $path = $base['path'] ?? '/';
    return $origin . substr($path, 0, (int) strrpos($path, '/') + 1) . $location;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    exit('Method not allowed');
}

$target = $_GET['url'] ?? '';
if (!is_string($target) || $target === '' || strlen($target) > 2048 || checked_url($target) === null) {
    http_response_code(400);
    exit('Invalid or unsupported URL');
}
if (!function_exists('curl_init')) {
    http_response_code(503);
    exit('The hosting account must have PHP cURL enabled');
}

for ($redirect = 0; $redirect <= 4; $redirect++) {
    if (checked_url($target) === null) {
        http_response_code(400);
        exit('Redirect target is not allowed');
    }

    $curl = curl_init($target);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
        CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml,application/json,*/*'],
    ]);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $headerSize = (int) curl_getinfo($curl, CURLINFO_HEADER_SIZE);
    $contentType = (string) (curl_getinfo($curl, CURLINFO_CONTENT_TYPE) ?: 'text/html; charset=utf-8');
    $error = curl_error($curl);
    curl_close($curl);

    if ($response === false) {
        http_response_code(502);
        exit('Source request failed: ' . $error);
    }

    if ($status >= 300 && $status < 400) {
        preg_match('/\r?\nLocation:\s*([^\r\n]+)/i', substr($response, 0, $headerSize), $match);
        if (!isset($match[1]) || $redirect === 4) {
            http_response_code($status);
            exit('Too many or invalid redirects');
        }
        $target = resolve_location($target, trim($match[1]));
        continue;
    }

    http_response_code($status > 0 ? $status : 502);
    header('Content-Type: ' . $contentType);
    header('Cache-Control: public, max-age=120');
    header('X-Content-Type-Options: nosniff');
    echo substr($response, $headerSize);
    exit;
}