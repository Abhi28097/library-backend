<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BulkBooksSeeder extends Seeder
{
    private const DEFAULT_COUNT = 1200;

    private array $categories = [
        'Fiction',
        'Mystery',
        'Romance',
        'Science Fiction',
        'Fantasy',
        'History',
        'Business',
        'Technology',
        'Self Help',
        'Biography',
        'Psychology',
        'Finance',
        'Education',
        'Philosophy',
        'Adventure',
    ];

    private array $titlePrefixes = [
        'The Hidden',
        'Echoes of',
        'Mastering',
        'Beyond',
        'The Future of',
        'Practical',
        'Secrets of',
        'The Last',
        'Rise of',
        'Inside',
        'The Art of',
        'Deep',
        'Blueprint for',
        'Chronicles of',
        'The Modern',
    ];

    private array $titleSubjects = [
        'Midnight Library',
        'Digital Wealth',
        'Silent Empire',
        'Creative Thinking',
        'Golden Horizon',
        'Learning Systems',
        'Reader Experience',
        'Product Design',
        'Startup Growth',
        'Mountain Code',
        'Parallel Worlds',
        'Human Mind',
        'Data Strategy',
        'Ocean of Stories',
        'City of Glass',
    ];

    private array $authorFirstNames = [
        'Aarav', 'Priya', 'Neha', 'Rohan', 'Kiran', 'Ananya', 'Kabir', 'Meera', 'Ishaan', 'Sanya',
        'Arjun', 'Diya', 'Rahul', 'Naina', 'Tara', 'Vivaan', 'Reyansh', 'Sara', 'Aryan', 'Mira',
    ];

    private array $authorLastNames = [
        'Sharma', 'Patel', 'Mehta', 'Kapoor', 'Singh', 'Nair', 'Joshi', 'Das', 'Verma', 'Reddy',
        'Kulkarni', 'Malhotra', 'Rao', 'Khanna', 'Bose', 'Iyer', 'Gupta', 'Chopra', 'Pillai', 'Desai',
    ];

    public function run(): void
    {
        $this->seedCount(self::DEFAULT_COUNT, false);
    }

    public function seedCount(int $count = self::DEFAULT_COUNT, bool $replace = false): int
    {
        if ($replace) {
            DB::table('books')->truncate();
        }

        $batch = [];
        $inserted = 0;

        for ($index = 1; $index <= $count; $index++) {
            $category = $this->categories[array_rand($this->categories)];
            $title = $this->titlePrefixes[array_rand($this->titlePrefixes)] . ' ' .
                $this->titleSubjects[array_rand($this->titleSubjects)] . ' ' . $index;
            $author = $this->authorFirstNames[array_rand($this->authorFirstNames)] . ' ' .
                $this->authorLastNames[array_rand($this->authorLastNames)];
            $price = random_int(149, 1499);
            $year = random_int(1998, 2026);
            $theme = strtolower(str_replace(' ', ' ', $category));

            $previewContent = "Preview of {$title}: discover the opening chapter, the central theme, and the style of {$author}.";
            $readerContent = implode("\n\n", [
                "{$title} opens with a strong chapter designed for immersive digital reading.",
                "This {$category} book combines accessible language with a premium long-form structure for daily reading sessions.",
                "Readers will explore deeper sections on {$theme}, decision-making, storytelling, and practical takeaways.",
                "The final chapters are designed to reward full purchase with more detailed insights, examples, and guided reflection.",
            ]);

            $batch[] = [
                'title' => $title,
                'author' => $author,
                'category' => $category,
                'published_year' => $year,
                'price' => $price,
                'status' => 'Available',
                'preview_content' => $previewContent,
                'reader_content' => $readerContent,
                'ebook_file_path' => null,
                'ebook_file_name' => null,
                'ebook_file_type' => null,
                'image' => null,
            ];

            if (count($batch) === 200) {
                DB::table('books')->insert($batch);
                $inserted += count($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            DB::table('books')->insert($batch);
            $inserted += count($batch);
        }

        return $inserted;
    }
}
