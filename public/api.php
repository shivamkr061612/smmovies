<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

$baseUrl = "https://smmmovies.online";
$action = $_GET['action'] ?? 'home';

function fetchHtml($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36");
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $html = curl_exec($ch);
    curl_close($ch);
    return $html;
}

function getXPath($html) {
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
    return new DOMXPath($dom);
}

// 1. HOME / LATEST MOVIES & SEARCH
if ($action === 'home' || $action === 'search') {
    $page = max(1, intval($_GET['page'] ?? 1));
    if ($action === 'search' && !empty($_GET['q'])) {
        $query = urlencode(trim($_GET['q']));
        $targetUrl = ($page > 1) ? "$baseUrl/page/$page/?s=$query" : "$baseUrl/?s=$query";
    } else {
        $targetUrl = ($page > 1) ? "$baseUrl/page/$page/" : $baseUrl;
    }

    $html = fetchHtml($targetUrl);
    if (!$html) {
        echo json_encode(["status" => false, "message" => "Unable to connect to source"]);
        exit;
    }

    $xpath = getXPath($html);
    $movies = [];
    $articles = $xpath->query("//article | //div[contains(@class, 'post')]");

    foreach ($articles as $article) {
        $titleNode = $xpath->query(".//h2//a | .//h3//a | .//a[contains(@class, 'title')]", $article)->item(0);
        $imgNode = $xpath->query(".//img", $article)->item(0);

        if ($titleNode) {
            $title = trim($titleNode->textContent);
            $link = $titleNode->getAttribute("href");
            $poster = "";

            if ($imgNode) {
                $poster = $imgNode->getAttribute("data-lazy-src")
                    ?: $imgNode->getAttribute("data-src")
                    ?: $imgNode->getAttribute("src");
            }

            if (!empty($title) && !empty($link)) {
                $movies[] = [
                    "title" => $title,
                    "poster" => $poster,
                    "post_url" => $link
                ];
            }
        }
    }

    echo json_encode([
        "status" => true,
        "page" => $page,
        "count" => count($movies),
        "movies" => $movies
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 2. WATCH ONLINE EXTRACTOR (SIRF STREAM LINK, NO DOWNLOADS)
if ($action === 'watch') {
    $postUrl = trim($_GET['url'] ?? '');
    if (empty($postUrl) || strpos($postUrl, $baseUrl) !== 0) {
        echo json_encode(["status" => false, "message" => "Valid post URL required"]);
        exit;
    }

    $html = fetchHtml($postUrl);
    if (!$html) {
        echo json_encode(["status" => false, "message" => "Failed to load movie page"]);
        exit;
    }

    $xpath = getXPath($html);
    $watchPageUrl = "";
    $directStreamUrl = "";

    // Step A: "WATCH ONLINE" button ka link dhundhein
    $links = $xpath->query("//a");
    foreach ($links as $a) {
        $text = strtoupper(trim($a->textContent));
        if (strpos($text, "WATCH ONLINE") !== false || strpos($text, "WATCH NOW") !== false) {
            $watchPageUrl = $a->getAttribute("href");
            break;
        }
    }

    // Step B: Direct iframe ya video source check karein
    $iframe = $xpath->query("//iframe[not(contains(@src, 'ads'))]")->item(0);
    if ($iframe) {
        $directStreamUrl = $iframe->getAttribute("src");
    }

    // Step C: Agar WATCH ONLINE kisi second page par le jata hai, toh wahan se embed iframe nikalein
    if (empty($directStreamUrl) && !empty($watchPageUrl)) {
        $playerHtml = fetchHtml($watchPageUrl);
        if ($playerHtml) {
            $playerXpath = getXPath($playerHtml);
            $playerIframe = $playerXpath->query("//iframe")->item(0);
            if ($playerIframe) {
                $directStreamUrl = $playerIframe->getAttribute("src");
            } else {
                $videoSource = $playerXpath->query("//video//source | //video")->item(0);
                if ($videoSource) {
                    $directStreamUrl = $videoSource->getAttribute("src");
                }
            }
        }
    }

    echo json_encode([
        "status" => (!empty($directStreamUrl) || !empty($watchPageUrl)),
        "stream_url" => $directStreamUrl ?: $watchPageUrl,
        "watch_page" => $watchPageUrl
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

echo json_encode(["status" => false, "message" => "Invalid action"]);
?>
