const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const pastedTextPath = "C:/Users/temiz/.codex/attachments/aa5d5b99-6d17-4b7d-a8ba-b5a6033da679/pasted-text.txt";
const site = "https://www.nezamandi.com/";

const categoryPages = {
  "arsiv.html": { title: "Arsiv", cat: "Arsiv" },
  "vefatlar.html": { title: "Vefatlar", cat: "Vefat Tarihleri" },
  "depremler.html": { title: "Depremler", cat: "Deprem ve Afet" },
  "olaylar.html": { title: "Olaylar", cat: "Tarih & Kisiler" },
};

const categoryLinks = {
  "Teknoloji": "teknoloji.html",
  "Oyun": "oyun.html",
  "Spor": "spor.html",
  "Vefat Tarihleri": "vefat-tarihleri.html",
  "Tarih & Kisiler": "tarih-ve-kisiler.html",
  "Tarihte Bugun": "tarihte-bugun.html",
  "Deprem ve Afet": "deprem-ve-afet.html",
  "Icatlar Ne Zaman?": "icatlar-ne-zaman.html",
  "Saglik & Cocuk": "saglik-ve-cocuk.html",
  "Arsiv": "tum-kayitlar.html",
};

const replacements = new Map([
  ["cikti", "çıktı"],
  ["cikardi", "çıkardı"],
  ["cikacak", "çıkacak"],
  ["kuruldu", "kuruldu"],
  ["dogdu", "doğdu"],
  ["vefat", "vefat"],
  ["oldu", "oldu"],
  ["basladi", "başladı"],
  ["bitti", "bitti"],
  ["yapildi", "yapıldı"],
  ["duzenlendi", "düzenlendi"],
  ["imzalandi", "imzalandı"],
  ["ilan", "ilan"],
  ["hangi", "hangi"],
  ["yil", "yıl"],
  ["yuzyilda", "yüzyılda"],
  ["donemde", "dönemde"],
  ["basbakan", "başbakan"],
  ["cumhurbaskani", "cumhurbaşkanı"],
  ["baskent", "başkent"],
  ["savasi", "savaşı"],
  ["ateskes", "ateşkes"],
  ["antlasmasi", "antlaşması"],
  ["kullanildi", "kullanıldı"],
  ["icat", "icat"],
  ["edildi", "edildi"],
  ["firlatildi", "fırlatıldı"],
  ["tanitildi", "tanıtıldı"],
  ["yayina", "yayına"],
  ["gonderildi", "gönderildi"],
  ["paylasildi", "paylaşıldı"],
  ["gundeme", "gündeme"],
  ["geldi", "geldi"],
  ["populer", "popüler"],
  ["unlu", "ünlü"],
  ["evlendi", "evlendi"],
  ["kazandi", "kazandı"],
  ["aldi", "aldı"],
  ["acildi", "açıldı"],
  ["acildi", "açıldı"],
  ["bekleniyor", "bekleniyor"],
  ["tarihte", "tarihte"],
  ["bugun", "bugün"],
  ["aralik", "aralık"],
  ["mayis", "mayıs"],
  ["subat", "şubat"],
  ["eylul", "eylül"],
  ["ocak", "ocak"],
  ["mart", "mart"],
  ["temmuz", "temmuz"],
  ["ekim", "ekim"],
  ["kasim", "kasım"],
  ["nisan", "nisan"],
  ["agustos", "ağustos"],
]);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sentenceTitle(text) {
  const brands = new Map([
    ["iphone", "iPhone"],
    ["ipad", "iPad"],
    ["ios", "iOS"],
    ["usb", "USB"],
    ["covid", "COVID"],
    ["hiv", "HIV"],
    ["aids", "AIDS"],
    ["nato", "NATO"],
    ["ab", "AB"],
    ["gpt", "GPT"],
    ["dall e", "DALL-E"],
    ["playstation", "PlayStation"],
    ["xbox", "Xbox"],
    ["facebook", "Facebook"],
    ["instagram", "Instagram"],
    ["google", "Google"],
    ["apple", "Apple"],
    ["samsung", "Samsung"],
    ["netflix", "Netflix"],
    ["spotify", "Spotify"],
    ["youtube", "YouTube"],
    ["chatgpt", "ChatGPT"],
    ["spacex", "SpaceX"],
  ]);
  let value = text.toLocaleLowerCase("tr-TR");
  for (const [from, to] of brands) {
    value = value.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  }
  value = value.charAt(0).toLocaleUpperCase("tr-TR") + value.slice(1);
  return value
    .replace(/İPhone/g, "iPhone")
    .replace(/İPad/g, "iPad")
    .replace(/İOS/g, "iOS");
}

function slugToTitle(slug) {
  const base = slug.replace(/\.html$/, "");
  const words = base
    .split("-")
    .filter(Boolean)
    .map((word) => replacements.get(word) || word);
  return `${sentenceTitle(words.join(" "))}?`;
}

function categorize(slug) {
  if (slug.startsWith("tarihte-bugun-")) return "Tarihte Bugun";
  if (slug.includes("vefat-etti")) return "Vefat Tarihleri";
  if (slug.includes("deprem") || slug.includes("tsunami")) return "Deprem ve Afet";
  if (/(playstation|xbox|pubg|steam|oyun|euro-2024|dunya-kupasi|galatasaray|fenerbahce|besiktas|ronaldo|messi|hakan-sukur|lebron)/.test(slug)) return "Spor";
  if (/(iphone|ipad|windows|google|facebook|instagram|telegram|threads|java|android|ios|gpt|llama|claude|sora|dall-e|stable-diffusion|netflix|spotify|amazon|apple|samsung|spacex|wordpress|gmail|usb|5g|hgs|internet|web|bilgisayar|mikroislemci|transistor|ssd|capcut|youtube|tiktok|trendyol|getir|hepsiburada|yemeksepeti|sony|macintosh)/.test(slug)) return "Teknoloji";
  if (/(asi|salgini|covid|ebola|sars|mers|kolera|hiv|kizamik|maymun-cicegi|tup-bebek)/.test(slug)) return "Saglik & Cocuk";
  if (/(icat|ilk-|tekerlek|otomobil|motorlu-ucus|teleskop|radyo|yapay-uydu|robot|pil|ford-model-t|renkli-televizyon|yerli-uydu|turksat)/.test(slug)) return "Icatlar Ne Zaman?";
  return "Tarih & Kisiler";
}

function answerFor(title, cat, slug) {
  if (cat === "Vefat Tarihleri") {
    return `${title.replace(/\?$/, "")} sorusu, ilgili kisinin vefat tarihi ve olay baglami uzerinden yanitlanir.`;
  }
  if (cat === "Tarihte Bugun") {
    return `${title.replace(/\?$/, "")} basligi altinda ilgili gunun one cikan olaylari ve tarihsel notlari derlenir.`;
  }
  if (cat === "Teknoloji" || cat === "Oyun") {
    return `${title.replace(/\?$/, "")} sorusunun cevabi urunun, platformun veya hizmetin ilk duyuru/cikis tarihine gore ele alinir.`;
  }
  if (cat === "Spor") {
    return `${title.replace(/\?$/, "")} sorusu ilgili organizasyon, kupa veya spor olayinin yil ve donem bilgisiyle aciklanir.`;
  }
  if (cat === "Deprem ve Afet") {
    return `${title.replace(/\?$/, "")} konusu tarih, yer ve olay etkisi birlikte dikkate alinarak ozetlenir.`;
  }
  return `${title.replace(/\?$/, "")} sorusu icin kisa tarih cevabi ve baglam bilgisi bu sayfada toparlanir.`;
}

function detailFor(title, cat) {
  return `${title.replace(/\?$/, "")} aramasi yapan kullanicilar genellikle tek bir tarih veya donem arar. Konu; olay, kisi, urun ya da kurum baglamina gore yil, gun veya donem bilgisiyle birlikte degerlendirilmelidir. Kesin tarih gereken durumlarda resmi kaynak, ansiklopedi veya kurum duyurusu ile karsilastirma yapilmalidir.`;
}

function nav() {
  return `<header class="site-header">
<a class="brand" href="index.html"><span class="brand-mark">NZ</span><span><strong>Ne Zaman?</strong></span></a>
<nav class="top-nav"><a href="index.html">Ana Sayfa</a><a href="index.html#kategoriler">Kategoriler</a><a href="icatlar-ne-zaman.html">Icatlar</a><a href="index.html#populer">Populer</a><a href="tarihte-bugun.html">Tarihte Bugun</a><a href="tum-kayitlar.html">Tum Kayitlar</a><a href="index.html">TR</a><a href="en/index.html">EN</a></nav>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
<p>© 2026 Nezamandi.com - Konuya ozel, sade ve net "ne zaman?" cevaplari.</p>
<nav><a href="index.html">Ana Sayfa</a><a href="hakkimizda.html">Hakkimizda</a><a href="iletisim.html">Iletisim</a><a href="gizlilik-politikasi.html">Gizlilik</a><a href="kullanim-sartlari.html">Kullanim Sartlari</a><a href="tum-kayitlar.html">Tum Kayitlar</a><a href="en/index.html">EN</a></nav>
</footer>`;
}

function pageShell({ title, cat, slug, answer, detail, keywords }) {
  const categoryUrl = categoryLinks[cat] || "tum-kayitlar.html";
  const description = `${title} sorusuna kisa cevap, tarih bilgisi ve pratik aciklama.`;
  const keywordText = keywords || `${title.replace(/\?$/, "").toLocaleLowerCase("tr-TR")}, ne zaman, nezamandi, ${cat.toLocaleLowerCase("tr-TR")}`;
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google-site-verification" content="E4u0XYhMVfLicVVHhWNh9Htad20LVZlV-n38zQH--wY">
<title>${escapeHtml(title)} | Nezamandi</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="keywords" content="${escapeHtml(keywordText)}">
<link rel="canonical" href="${site}${escapeHtml(slug)}">
<meta property="og:title" content="${escapeHtml(title)} | Nezamandi">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${site}${escapeHtml(slug)}">
<meta property="og:type" content="article">
<meta name="application-name" content="Ne Zaman? Ne Zamandi?">
<meta name="apple-mobile-web-app-title" content="Ne Zaman?">
<meta name="theme-color" content="#c7651d">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta property="og:site_name" content="Ne Zaman? Ne Zamandi?">
<meta property="og:image" content="https://www.nezamandi.com/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://www.nezamandi.com/og-image.png">
<link rel="stylesheet" href="style.css">
</head>
<body>
${nav()}
<div class="breadcrumbs"><a href="index.html">Ana sayfa</a> › <a href="${escapeHtml(categoryUrl)}">${escapeHtml(cat)}</a></div>
<main>
<article class="content-card">
<span class="tag">${escapeHtml(cat)}</span>
<h1><strong>${escapeHtml(title)}</strong></h1>
<h2><strong>Kisa cevap</strong></h2>
<div class="answer-box"><p><strong>${escapeHtml(answer)}</strong></p></div>
<h2><strong>Detayli aciklama</strong></h2>
<div class="detail-strong"><p>${escapeHtml(detail)}</p></div>
<h2><strong>Neden onemli?</strong></h2>
<p>Bu kayit, ilgili konuya hizli ulasmak isteyen kullanici icin kisa cevap ve baglam sunar.</p>
<h2><strong>Ilgili sayfalar</strong></h2>
<ul>
<li><a href="${escapeHtml(categoryUrl)}">${escapeHtml(cat)} kategorisi</a></li>
<li><a href="tum-kayitlar.html">Tum kayitlar</a></li>
<li><a href="tarihte-bugun.html">Tarihte Bugun</a></li>
</ul>
</article>
</main>
${footer()}
<script src="tarihte-bugun.js"></script>
<script src="app.js?v=56"></script>
</body>
</html>
`;
}

function categoryPage(slug, entries) {
  const meta = categoryPages[slug];
  const links = entries
    .filter((item) => item.cat === meta.cat || (meta.cat === "Arsiv" && item.url !== slug))
    .sort((a, b) => a.title.localeCompare(b.title, "tr"))
    .slice(0, 500)
    .map((item) => `<a href="${escapeHtml(item.url)}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.cat)}</small></a>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(meta.title)} | Nezamandi</title>
<meta name="description" content="${escapeHtml(meta.title)} arsiv sayfasi.">
<link rel="canonical" href="${site}${escapeHtml(slug)}">
<link rel="stylesheet" href="style.css">
</head>
<body>
${nav()}
<main><section class="page-hero"><span class="tag">${escapeHtml(meta.cat)}</span><h1><strong>${escapeHtml(meta.title)}</strong></h1><p>Bu bolumde ilgili arsiv kayitlari listelenir.</p></section>
<section class="section-block"><div class="section-title"><span>Arsiv</span><h2>${escapeHtml(meta.title)} kayitlari</h2></div><div class="list-grid">${links}</div></section></main>
${footer()}
<script src="app.js?v=56"></script>
</body>
</html>
`;
}

function getQuestions() {
  const appPath = path.join(root, "app.js");
  const code = fs.readFileSync(appPath, "utf8");
  const cut = code.indexOf("const examplePool");
  const sandbox = {};
  vm.runInNewContext(code.slice(0, cut).replace("const questions", "var questions"), sandbox);
  return { appPath, code, cut, questions: sandbox.questions || [] };
}

const pasted = fs.readFileSync(pastedTextPath, "utf8");
const urls = [...pasted.matchAll(/https:\/\/www\.nezamandi\.com\/([^\s]+)/g)]
  .map((match) => match[1])
  .filter((url) => url.endsWith(".html"));
const targetSlugs = [...new Set(urls)];
const { appPath, code, cut, questions } = getQuestions();
const existingUrls = new Set(questions.map((item) => item.url));
const generatedEntries = [];
let created = 0;

for (const slug of targetSlugs) {
  const filePath = path.join(root, slug);
  const shouldRefresh = fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").includes("Bu kayit, ilgili konuya");
  if (fs.existsSync(filePath) && !shouldRefresh) continue;
  let title;
  let cat;
  let html;
  if (categoryPages[slug]) {
    title = categoryPages[slug].title;
    cat = categoryPages[slug].cat;
  } else {
    title = slugToTitle(slug);
    cat = categorize(slug);
    const answer = answerFor(title, cat, slug);
    const detail = detailFor(title, cat);
    html = pageShell({ title, cat, slug, answer, detail });
    const entry = {
      title,
      cat,
      url: slug,
      answer,
      detail,
      keywords: [
        title.replace(/\?$/, "").toLocaleLowerCase("tr-TR"),
        "ne zaman",
        "nezamandi",
        cat.toLocaleLowerCase("tr-TR"),
      ],
    };
    generatedEntries.push(entry);
  }
  if (!html) {
    html = categoryPage(slug, [...questions, ...generatedEntries]);
  }
  fs.writeFileSync(filePath, html, "utf8");
  created += shouldRefresh ? 0 : 1;
}

const generatedByUrl = new Map(generatedEntries.map((item) => [item.url, item]));
const additions = generatedEntries.filter((item) => !existingUrls.has(item.url));
const refreshedQuestions = questions.map((item) => generatedByUrl.get(item.url) || item);
if (additions.length || generatedEntries.some((item) => existingUrls.has(item.url))) {
  const updatedQuestions = [...refreshedQuestions, ...additions];
  const prefix = `const questions = ${JSON.stringify(updatedQuestions)};\n`;
  fs.writeFileSync(appPath, prefix + code.slice(cut), "utf8");
}

const allHtml = fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".html"))
  .sort((a, b) => a.localeCompare(b, "tr"));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}</loc></url>\n${allHtml.map((file) => `  <url><loc>${site}${file}</loc></url>`).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

const tumPath = path.join(root, "tum-kayitlar.html");
let tum = fs.readFileSync(tumPath, "utf8");
const missingLinks = generatedEntries
  .filter((item) => !tum.includes(`href="${item.url}"`))
  .sort((a, b) => a.title.localeCompare(b.title, "tr"))
  .map((item) => `<a href="${escapeHtml(item.url)}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.cat)}</small></a>`)
  .join("\n");
if (missingLinks) {
  tum = tum.replace("</div></section></main>", `${missingLinks}\n</div></section></main>`);
  tum = tum.replace(/<p>\d+ arama kayd/, `<p>${questions.length + additions.length} arama kayd`);
  fs.writeFileSync(tumPath, tum, "utf8");
}

console.log(JSON.stringify({
  targetUrls: targetSlugs.length,
  created,
  appEntriesAdded: additions.length,
  sitemapUrls: allHtml.length + 1,
}, null, 2));
