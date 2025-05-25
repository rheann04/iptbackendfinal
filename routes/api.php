<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/status', function () {
    return response()->json([
        'status' => 'operational',
        'version' => '1.0.0',
        'timestamp' => now()->toDateTimeString()
    ]);
});


Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->noContent();
});


Route::post('/auth/change-password', [UserController::class, 'changePassword']);


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

Route::middleware(['auth:sanctum'])->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        Route::prefix('users')->group(function () {
            Route::put('/{user}', [UserController::class, 'update'])->name('users.update');
        });
    });

    // Books
    Route::prefix('books')->group(function () {
        Route::get('/', [BookController::class, 'index'])->name('books.index');
        Route::get('/{book}', [BookController::class, 'show'])->name('books.show');
        Route::post('/{book}/borrow', [BookController::class, 'borrow'])->name('books.borrow');
    });

    
    // Transactions
    Route::prefix('transactions')->group(function () {
        Route::get('/stats', [TransactionController::class, 'userStats']);
        Route::get('/', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
        Route::post('/{transaction}/return', [TransactionController::class, 'returnBook'])->name('transactions.return');
    });

    // User-specific routes
    Route::get('/user/borrowed-books', [UserController::class, 'borrowedBooks'])->name('user.borrowed-books');

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard-stats', [AdminController::class, 'dashboardStats']);

        Route::prefix('books')->group(function () {
            Route::get('/', [BookController::class, 'adminIndex'])->name('admin.books.index');
            Route::post('/', [BookController::class, 'store'])->name('admin.books.store');
            Route::get('/{book}', [BookController::class, 'show'])->name('admin.books.show');
            Route::put('/{book}', [BookController::class, 'update'])->name('admin.books.update');
            Route::delete('/{book}', [BookController::class, 'destroy'])->name('admin.books.destroy');
        });

        Route::prefix('users')->group(function () {
            Route::get('/', [AdminController::class, 'getUsers'])->name('admin.users.index');
            Route::get('/{user}', [UserController::class, 'show'])->name('admin.users.show');
            Route::delete('/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
        });

        Route::prefix('transactions')->group(function () {
            Route::get('/', [AdminController::class, 'getTransactions'])->name('admin.transactions.index');
            Route::post('/transactions/{transaction}/mark-returned', [TransactionController::class, 'markAsReturned'])
                ->name('admin.transactions.mark-returned');
        });
    });

    // Profile routes
    Route::get('/profile', [UserController::class, 'profile']);
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
    Route::post('/profile/update-password', [UserController::class, 'updatePassword']);
});
