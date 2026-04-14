<?php

use Database\Seeders\BulkBooksSeeder;
use Illuminate\Support\Facades\File;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

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

Artisan::command('library:generate-covers {--replace}', function () {
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
        $titleLines = collect(str_split(wordwrap($book->title, 18, "\n"), 18));
        $displayLines = $titleLines->take(4)->values();
        $titleSvg = $displayLines->map(function ($line, $index) {
            $y = 378 + ($index * 52);
            $safeLine = htmlspecialchars(trim($line), ENT_QUOTES);

            return "<text x='64' y='{$y}' fill='white' font-size='36' font-family='Georgia, Times New Roman, serif' font-weight='700'>{$safeLine}</text>";
        })->implode('');

        $category = htmlspecialchars(strtoupper($book->category ?: 'BOOK'), ENT_QUOTES);
        $author = htmlspecialchars($book->author ?: 'Unknown Author', ENT_QUOTES);
        $fileName = 'generated-covers/' . $book->id . '-' . Str::slug(Str::limit($book->title, 40, '')) . '.svg';
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1300" viewBox="0 0 900 1300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$colors[0]}"/>
      <stop offset="100%" stop-color="{$colors[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="15%" r="75%">
      <stop offset="0%" stop-color="{$colors[2]}" stop-opacity="0.58"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="1300" rx="44" fill="url(#bg)"/>
  <rect width="900" height="1300" rx="44" fill="url(#glow)"/>
  <circle cx="760" cy="180" r="180" fill="rgba(255,255,255,0.08)"/>
  <circle cx="140" cy="1120" r="210" fill="rgba(255,255,255,0.06)"/>
  <rect x="40" y="40" width="820" height="1220" rx="40" fill="rgba(7,10,20,0.16)" stroke="rgba(255,255,255,0.18)"/>
  <rect x="64" y="64" width="772" height="1172" rx="34" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="64" y="72" width="220" height="44" rx="22" fill="rgba(255,255,255,0.18)"/>
  <text x="94" y="101" fill="white" font-size="21" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="2">SMART LIBRARY</text>
  <text x="64" y="170" fill="rgba(255,255,255,0.82)" font-size="24" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="4">{$category}</text>
  <rect x="64" y="214" width="772" height="108" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.10)"/>
  <text x="96" y="280" fill="white" font-size="58" font-family="Georgia, Times New Roman, serif" font-weight="700">Collector's</text>
  <text x="96" y="326" fill="rgba(255,255,255,0.75)" font-size="24" font-family="Segoe UI, Arial, sans-serif">Premium digital reading edition</text>
  {$titleSvg}
  <rect x="64" y="1010" width="772" height="164" rx="34" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.14)"/>
  <text x="96" y="1080" fill="rgba(255,255,255,0.76)" font-size="20" font-family="Segoe UI, Arial, sans-serif" letter-spacing="3">AUTHOR</text>
  <text x="96" y="1128" fill="white" font-size="34" font-family="Segoe UI, Arial, sans-serif" font-weight="700">{$author}</text>
  <text x="96" y="1166" fill="rgba(255,255,255,0.76)" font-size="21" font-family="Segoe UI, Arial, sans-serif">Curated for the Smart Library premium store</text>
  <rect x="64" y="1194" width="180" height="16" rx="8" fill="{$colors[2]}" fill-opacity="0.78"/>
  <rect x="252" y="1194" width="120" height="16" rx="8" fill="rgba(255,255,255,0.38)"/>
</svg>
SVG;

        File::put(public_path('uploads/' . $fileName), $svg);

        $book->update([
            'image' => str_replace('generated-covers/', 'generated-covers/', $fileName),
        ]);

        $created++;
    }

    $this->info("Generated {$created} premium covers successfully.");
})->purpose('Generate premium SVG covers for the full book catalog');
