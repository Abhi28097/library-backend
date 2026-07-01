<?php

use Database\Seeders\BulkBooksSeeder;
use Illuminate\Support\Facades\File;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

$buildBookDescription = function (string $title, string $author, string $category): string {
    $categoryAngles = [
        'Fiction' => 'character-driven storytelling, emotional tension, and a vivid world',
        'Mystery' => 'clues, suspense, and a slow reveal that keeps the reader guessing',
        'Romance' => 'warm chemistry, emotional honesty, and a satisfying central connection',
        'Science Fiction' => 'future-facing ideas, speculative systems, and big-picture imagination',
        'Fantasy' => 'mythic atmosphere, imaginative worldbuilding, and a sense of wonder',
        'History' => 'context, chronology, and meaningful connections to the past',
        'Business' => 'strategy, growth, and practical decisions for modern readers',
        'Technology' => 'innovation, digital systems, and a clear look at how tools shape life',
        'Self Help' => 'habits, clarity, and practical motivation for everyday progress',
        'Biography' => 'personal experience, resilience, and the voice of a real life story',
        'Psychology' => 'thought patterns, behavior, and the reasons people make choices',
        'Finance' => 'money habits, smart planning, and confident decision-making',
        'Education' => 'learning, improvement, and ideas that support deeper understanding',
        'Philosophy' => 'reflection, meaning, and a thoughtful look at how people think',
        'Adventure' => 'motion, risk, discovery, and momentum from chapter to chapter',
    ];

    $angle = $categoryAngles[$category] ?? 'a balanced mix of storytelling, insight, and reading rhythm';

    return "{$title} by {$author} is a {$category} title built around {$angle}. "
        . "It is written to feel like a premium digital edition, with a clear editorial voice, a memorable premise, "
        . "and a description that helps the book stand out in a modern library storefront.";
};

$buildBookCoverSvg = function ($book, array $colors): string {
    $variant = ((int) $book->id) % 6;
    $titleLines = collect(str_split(wordwrap($book->title, 16, "\n"), 16))->take(4)->values();
    $titleSvg = $titleLines->map(function ($line, $index) use ($variant) {
        $safeLine = htmlspecialchars(trim($line), ENT_QUOTES);
        $baseY = [382, 386, 390, 394, 398, 402][$variant];
        $spacing = [46, 48, 44, 48, 45, 46][$variant];
        $y = $baseY + ($index * $spacing);
        $size = [34, 36, 35, 36, 33, 34][$variant];
        $x = [70, 74, 68, 72, 70, 76][$variant];

        return "<text x='{$x}' y='{$y}' fill='white' font-size='{$size}' font-family='Georgia, Times New Roman, serif' font-weight='700'>{$safeLine}</text>";
    })->implode('');

    $category = htmlspecialchars(strtoupper($book->category ?: 'BOOK'), ENT_QUOTES);
    $author = htmlspecialchars($book->author ?: 'Unknown Author', ENT_QUOTES);
    $subtitle = htmlspecialchars($book->category ?: 'Curated Edition', ENT_QUOTES);
    $variantLabels = [
        ['TOP SPOTLIGHT', 'BOOK CLUB PICK'],
        ['CURATED STORY', 'READING HOUSE'],
        ['EDITORIAL DROP', 'FEATURED TITLE'],
        ['PREMIUM PICK', 'SMART LIBRARY'],
        ['LIMITED EDITION', 'DIGITAL FIRST'],
        ['COLLECTOR COPY', 'PRIME SHELF'],
    ];
    [$tagA, $tagB] = $variantLabels[$variant];

    $variantArt = match ($variant) {
        0 => "<circle cx='690' cy='250' r='210' fill='rgba(255,255,255,0.18)'/><circle cx='530' cy='122' r='120' fill='rgba(255,255,255,0.10)'/>",
        1 => "<path d='M0 1020 C180 910, 350 980, 510 870 S820 780, 900 840 V1300 H0 Z' fill='rgba(255,255,255,0.10)'/><circle cx='760' cy='210' r='170' fill='rgba(255,255,255,0.12)'/>",
        2 => "<rect x='560' y='110' width='220' height='520' rx='96' transform='rotate(18 560 110)' fill='rgba(255,255,255,0.12)'/><circle cx='150' cy='1110' r='240' fill='rgba(255,255,255,0.08)'/>",
        3 => "<path d='M70 170 L280 70 L420 180 L260 300 Z' fill='rgba(255,255,255,0.12)'/><path d='M600 980 L820 890 L860 1130 L650 1210 Z' fill='rgba(255,255,255,0.10)'/>",
        4 => "<circle cx='760' cy='150' r='130' fill='rgba(255,255,255,0.14)'/><path d='M640 260 C760 330, 760 450, 640 510 C560 550, 480 520, 430 450 C510 330, 560 250, 640 260 Z' fill='rgba(255,255,255,0.11)'/>",
        default => "<rect x='76' y='100' width='210' height='60' rx='30' fill='rgba(255,255,255,0.14)'/><rect x='590' y='1080' width='210' height='60' rx='30' fill='rgba(255,255,255,0.14)'/>",
    };

    return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1300" viewBox="0 0 900 1300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$colors[0]}"/>
      <stop offset="100%" stop-color="{$colors[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="28%" cy="15%" r="80%">
      <stop offset="0%" stop-color="{$colors[2]}" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.20)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.02)"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1300" rx="44" fill="url(#bg)"/>
  <rect width="900" height="1300" rx="44" fill="url(#glow)"/>
  {$variantArt}
  <rect x="36" y="36" width="828" height="1228" rx="40" fill="rgba(12,11,23,0.18)" stroke="rgba(255,255,255,0.20)"/>
  <rect x="60" y="60" width="780" height="1180" rx="34" fill="url(#glass)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="70" y="70" width="220" height="46" rx="23" fill="rgba(255,255,255,0.14)"/>
  <text x="96" y="101" fill="white" font-size="20" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="2">SMART LIBRARY</text>
  <text x="68" y="165" fill="rgba(255,255,255,0.82)" font-size="22" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="4">{$category}</text>
  <rect x="68" y="208" width="300" height="40" rx="20" fill="rgba(255,255,255,0.12)"/>
  <text x="88" y="236" fill="white" font-size="16" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="3">{$tagA}</text>
  <rect x="68" y="258" width="220" height="40" rx="20" fill="rgba(255,255,255,0.10)"/>
  <text x="88" y="286" fill="rgba(255,255,255,0.86)" font-size="15" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="2">{$tagB}</text>
  <text x="74" y="344" fill="rgba(255,255,255,0.78)" font-size="24" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="2">{$subtitle}</text>
  <text x="74" y="390" fill="white" font-size="58" font-family="Georgia, Times New Roman, serif" font-weight="700">Curated</text>
  <text x="74" y="438" fill="rgba(255,255,255,0.78)" font-size="24" font-family="Segoe UI, Arial, sans-serif">Premium digital reading edition</text>
  {$titleSvg}
  <rect x="68" y="1000" width="764" height="176" rx="34" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.14)"/>
  <text x="96" y="1068" fill="rgba(255,255,255,0.74)" font-size="20" font-family="Segoe UI, Arial, sans-serif" letter-spacing="3">AUTHOR</text>
  <text x="96" y="1116" fill="white" font-size="34" font-family="Segoe UI, Arial, sans-serif" font-weight="700">{$author}</text>
  <text x="96" y="1154" fill="rgba(255,255,255,0.76)" font-size="20" font-family="Segoe UI, Arial, sans-serif">Curated for the Smart Library premium store</text>
  <rect x="96" y="1190" width="180" height="14" rx="7" fill="{$colors[2]}" fill-opacity="0.80"/>
  <rect x="286" y="1190" width="126" height="14" rx="7" fill="rgba(255,255,255,0.34)"/>
</svg>
SVG;
};

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('library:seed-books {count=1200} {--replace}', function (BulkBooksSeeder $seeder) {
    $count = max((int) $this->argument('count'), 1);
    $replace = (bool) $this->option('replace');

    $this->info("Preparing to seed {$count} books...");

    $inserted = $seeder->seedCount($count, $replace);

    $this->info("Bulk import complete. {$inserted} books seeded successfully.");
})->purpose('Seed a large demo book catalog for the ebook storefront');

Artisan::command('library:generate-covers {--replace}', function () use ($buildBookDescription, $buildBookCoverSvg) {
    $replace = (bool) $this->option('replace');
    $books = \App\Models\Book::query()
        ->when(!$replace, fn ($query) => $query->whereNull('image'))
        ->select('id', 'title', 'author', 'category', 'image')
        ->get();

    if ($books->isEmpty()) {
        $this->info('No books need cover generation.');
        return;
    }

    $palette = [
        'Fiction' => ['#241b4b', '#ef7d57', '#ffd166'],
        'Mystery' => ['#07111f', '#2f5bea', '#8bd3ff'],
        'Romance' => ['#5b1638', '#ff6b9a', '#ffd0e0'],
        'Science Fiction' => ['#081f3f', '#20b8d9', '#96f2ff'],
        'Fantasy' => ['#2b124d', '#9d4edd', '#ffba08'],
        'History' => ['#5c2b12', '#b85c38', '#f2d0a4'],
        'Business' => ['#092c2e', '#1ca58e', '#9ce8d7'],
        'Technology' => ['#0c2161', '#3587ff', '#9fd0ff'],
        'Self Help' => ['#16371c', '#4caf50', '#d4f5a6'],
        'Biography' => ['#512512', '#d97706', '#ffddab'],
        'Psychology' => ['#5a1745', '#e75480', '#ffd6eb'],
        'Finance' => ['#0d3b2a', '#2ecc71', '#b9f6ca'],
        'Education' => ['#102b75', '#4f83ff', '#d5e6ff'],
        'Philosophy' => ['#35155d', '#8c52ff', '#dbc3ff'],
        'Adventure' => ['#6c2d19', '#ff7b54', '#ffe29a'],
    ];

    $coverDir = public_path('uploads/generated-covers');
    File::ensureDirectoryExists($coverDir);

    $created = 0;

    foreach ($books as $book) {
        $colors = $palette[$book->category] ?? ['#16324f', '#d97757', '#ffdfa1'];
        $description = $buildBookDescription($book->title, $book->author, $book->category);
        $fileName = 'generated-covers/' . $book->id . '-' . Str::slug(Str::limit($book->title, 40, '')) . '.svg';
        $svg = $buildBookCoverSvg($book, $colors);

        File::put(public_path('uploads/' . $fileName), $svg);

        $book->update([
            'description' => $description,
            'image' => $fileName,
        ]);

        $created++;
    }

    $this->info("Updated {$created} books with descriptions and premium covers successfully.");
})->purpose('Generate premium SVG covers for the full book catalog');

Artisan::command('library:backfill-book-data {--replace-covers}', function () use ($buildBookDescription, $buildBookCoverSvg) {
    $replaceCovers = (bool) $this->option('replace-covers');
    $books = \App\Models\Book::query()
        ->select('id', 'title', 'author', 'category', 'description', 'image')
        ->orderBy('id')
        ->get();

    if ($books->isEmpty()) {
        $this->info('No books found.');
        return;
    }

    $palette = [
        'Fiction' => ['#241b4b', '#ef7d57', '#ffd166'],
        'Mystery' => ['#07111f', '#2f5bea', '#8bd3ff'],
        'Romance' => ['#5b1638', '#ff6b9a', '#ffd0e0'],
        'Science Fiction' => ['#081f3f', '#20b8d9', '#96f2ff'],
        'Fantasy' => ['#2b124d', '#9d4edd', '#ffba08'],
        'History' => ['#5c2b12', '#b85c38', '#f2d0a4'],
        'Business' => ['#092c2e', '#1ca58e', '#9ce8d7'],
        'Technology' => ['#0c2161', '#3587ff', '#9fd0ff'],
        'Self Help' => ['#16371c', '#4caf50', '#d4f5a6'],
        'Biography' => ['#512512', '#d97706', '#ffddab'],
        'Psychology' => ['#5a1745', '#e75480', '#ffd6eb'],
        'Finance' => ['#0d3b2a', '#2ecc71', '#b9f6ca'],
        'Education' => ['#102b75', '#4f83ff', '#d5e6ff'],
        'Philosophy' => ['#35155d', '#8c52ff', '#dbc3ff'],
        'Adventure' => ['#6c2d19', '#ff7b54', '#ffe29a'],
    ];

    $updated = 0;
    $coverDir = public_path('uploads/generated-covers');
    File::ensureDirectoryExists($coverDir);

    foreach ($books as $book) {
        $description = $buildBookDescription($book->title, $book->author, $book->category);
        $colors = $palette[$book->category] ?? ['#16324f', '#d97757', '#ffdfa1'];
        $fileName = 'generated-covers/' . $book->id . '-' . Str::slug(Str::limit($book->title, 40, '')) . '.svg';

        $book->description = $description;

        if ($replaceCovers || !$book->image) {
            File::put(public_path('uploads/' . $fileName), $buildBookCoverSvg($book, $colors));
            $book->image = $fileName;
        }

        $book->save();
        $updated++;
    }

    $this->info("Backfilled {$updated} books with descriptions" . ($replaceCovers ? " and regenerated covers" : ""));
})->purpose('Backfill descriptions and optionally regenerate covers for the book catalog');
