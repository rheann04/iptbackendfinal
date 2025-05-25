<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Optional: Clear existing data to avoid duplication
        // Transaction::truncate();
        // Book::truncate();
        // User::where('role', '!=', 'admin')->delete();

        // Create or update admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@library.com'], // match by email
            [
                'name' => 'Library Admin',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'remember_token' => Str::random(10),
            ]
        );

        // Create regular users if not already enough
        if (User::where('role', 'user')->count() < 10) {
            User::factory()->count(10)->create([
                'role' => 'user',
                'password' => Hash::make('password'),
            ]);
        }

        $users = User::where('role', 'user')->get();

        // Define sample books
        $books = [
            [
                'title' => 'To Kill a Mockingbird',
                'author' => 'Harper Lee',
                'genre' => 'Fiction',
                'description' => 'A novel about the serious issues of rape and racial inequality.',
                'total_copies' => 5,
                'available_copies' => 5,
            ],
            [
                'title' => '1984',
                'author' => 'George Orwell',
                'genre' => 'Dystopian',
                'description' => 'A dystopian social science fiction novel and cautionary tale.',
                'total_copies' => 3,
                'available_copies' => 3,
            ],
            [
                'title' => 'The Great Gatsby',
                'author' => 'F. Scott Fitzgerald',
                'genre' => 'Classic',
                'description' => 'A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.',
                'total_copies' => 4,
                'available_copies' => 4,
            ],
            [
                'title' => 'Pride and Prejudice',
                'author' => 'Jane Austen',
                'genre' => 'Classic',
                'description' => 'Romantic novel of manners.',
                'total_copies' => 6,
                'available_copies' => 6,
            ],
            [
                'title' => 'The Hobbit',
                'author' => 'J.R.R. Tolkien',
                'genre' => 'Fantasy',
                'description' => 'Fantasy novel about the adventures of Bilbo Baggins.',
                'total_copies' => 4,
                'available_copies' => 4,
            ]
        ];

        $createdBooks = collect();

        foreach ($books as $bookData) {
            $book = Book::firstOrCreate(
                ['title' => $bookData['title']], // unique key to avoid duplication
                $bookData
            );
            $createdBooks->push($book);
        }

        // Create sample transactions
        foreach ($users as $user) {
            // Each user borrows 1-3 random books
            $booksToBorrow = $createdBooks->random(rand(1, 3));

            foreach ($booksToBorrow as $book) {
                if ($book->available_copies > 0) {
                    $borrowedDate = Carbon::now()->subDays(rand(1, 30));
                    $status = rand(0, 1) ? 'borrowed' : 'returned';
                    $returnedDate = $status === 'returned' ? $borrowedDate->copy()->addDays(rand(1, 14)) : null;

                    Transaction::create([
                        'user_id' => $user->id,
                        'book_id' => $book->id,
                        'borrowed_date' => $borrowedDate,
                        'due_date' => $borrowedDate->copy()->addDays(14),
                        'status' => $status,
                        'returned_date' => $returnedDate,
                    ]);

                    if ($status === 'borrowed') {
                        $book->decrement('available_copies');
                    }
                }
            }
        }
    }
}
