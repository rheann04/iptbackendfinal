"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowPathIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import ProfileModal from "@/components/ProfileModal";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  available_copies: number;
  total_copies: number;
  borrowed_at?: string;
  due_date?: string;
  returned_date?: string;
  added_by?: string;
  user?: {
    name: string;
  };
  transaction_id: number;
  unique_key?: string;
  status?: string;
}

const UserDashboard = () => {
  const { authToken, user, isLoading } = useAppContext();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "available" | "borrowed">("all");
  const [loading, setLoading] = useState({
    books: false,
    borrowed: false,
    action: false,
    refreshing: false
  });
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (authToken) {
      fetchBooks();
      fetchBorrowedBooks();
    }
  }, [authToken]);

  const fetchBooks = async () => {
    setLoading(prev => ({...prev, books: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.books ? response.data.books : 
                  response.data.data ? response.data.data : [];
      
      setBooks(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load books");
    } finally {
      setLoading(prev => ({...prev, books: false}));
    }
  };

  const fetchBorrowedBooks = async () => {
    setLoading(prev => ({...prev, borrowed: true}));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/borrowed-books`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.books ? response.data.books : 
                  response.data.data ? response.data.data : [];
      
      setBorrowedBooks(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load borrowed books");
    } finally {
      setLoading(prev => ({...prev, borrowed: false}));
    }
  };

  const refreshData = async () => {
    setLoading(prev => ({...prev, refreshing: true}));
    try {
      await Promise.all([fetchBooks(), fetchBorrowedBooks()]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setLoading(prev => ({...prev, refreshing: false}));
    }
  };

  const handleBorrow = async (bookId: number) => {
    if (!dueDate) {
      toast.error("Please select a return date");
      return;
    }

    const today = new Date();
    const maxDueDate = new Date();
    maxDueDate.setDate(today.getDate() + 7);

    if (dueDate > maxDueDate) {
      toast.error("Maximum borrowing period is 1 week");
      return;
    }

    if (dueDate < today) {
      toast.error("Return date cannot be in the past");
      return;
    }

    setLoading(prev => ({...prev, action: true}));
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/borrow`,
        { due_date: dueDate.toISOString().split('T')[0] },
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          }
        }
      );
      
      toast.success(response.data?.message || "Book borrowed successfully");
      setDueDate(null);
      setSelectedBookId(null);
      await Promise.all([fetchBooks(), fetchBorrowedBooks()]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to borrow book");
    } finally {
      setLoading(prev => ({...prev, action: false}));
    }
  };

  const handleReturn = async (transactionId: number, bookTitle: string) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Return",
        text: `Are you sure you want to return "${bookTitle}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, return it",
      });

      if (result.isConfirmed) {
        setLoading(prev => ({...prev, action: true}));
        
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}/return`,
            {},
            {
              headers: { 
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json'
              }
            }
          );

          toast.success(response.data.message || "Book returned successfully");
          await Promise.all([fetchBooks(), fetchBorrowedBooks()]);
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to return book");
        } finally {
          setLoading(prev => ({...prev, action: false}));
        }
      }
    } catch (error) {
      toast.error("An error occurred during confirmation");
    }
  };

  if (isLoading || !authToken || (user?.role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredBooks = activeTab === "available" 
    ? books.filter(book => book.available_copies > 0)
    : activeTab === "borrowed" 
      ? borrowedBooks 
      : books;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
            >
              {user?.profile_image ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${user.profile_image}`} 
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4B5563&color=fff`;
                  }}
                />
              ) : (
                <span className="text-gray-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            <div>
              <h1 className="text-xl font-semibold">{user?.name}</h1>
              <p className="text-sm text-gray-500">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={loading.refreshing}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading.refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="h-5 w-5 text-primary-600" />
            <span className="text-sm text-gray-600">Borrowed Books:</span>
            <span className="font-semibold">{borrowedBooks.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-primary-600" />
            <span className="text-sm text-gray-600">Overdue Books:</span>
            <span className="font-semibold">
              {borrowedBooks.filter(book => new Date(book.due_date || '') < new Date()).length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-primary-600 text-primary-600" : "text-gray-600"}`}
          >
            All Books
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 ${activeTab === "available" ? "border-b-2 border-primary-600 text-primary-600" : "text-gray-600"}`}
          >
            Available
          </button>
          <button
            onClick={() => setActiveTab("borrowed")}
            className={`px-4 py-2 ${activeTab === "borrowed" ? "border-b-2 border-primary-600 text-primary-600" : "text-gray-600"}`}
          >
            My Books
          </button>
        </div>
      </div>

      {/* Book List */}
      {activeTab !== "borrowed" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading.books ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No books found
            </div>
          ) : (
            filteredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.description}</p>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Available: {book.available_copies}/{book.total_copies}</p>
                </div>
                {selectedBookId === book.id ? (
                  <div className="space-y-2">
                    <DatePicker
                      selected={dueDate}
                      onChange={(date) => setDueDate(date)}
                      minDate={new Date()}
                      maxDate={new Date(new Date().setDate(new Date().getDate() + 7))}
                      className="w-full p-2 border rounded"
                      placeholderText="Select return date"
                    />
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                        onClick={() => handleBorrow(book.id)}
                        disabled={loading.action}
                      >
                        {loading.action ? 'Processing...' : 'Confirm'}
                      </button>
                      <button
                        className="px-4 py-2 border rounded hover:bg-gray-50"
                        onClick={() => {
                          setSelectedBookId(null);
                          setDueDate(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={`w-full px-4 py-2 rounded ${
                      book.available_copies > 0
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => book.available_copies > 0 && setSelectedBookId(book.id)}
                    disabled={book.available_copies <= 0}
                  >
                    {book.available_copies > 0 ? 'Borrow' : 'Unavailable'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Author</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading.borrowed ? (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : borrowedBooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                    No borrowed books
                  </td>
                </tr>
              ) : (
                borrowedBooks.map(book => (
                  <tr key={book.unique_key} className="border-t">
                    <td className="px-4 py-2">{book.title}</td>
                    <td className="px-4 py-2">{book.author}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        book.status === 'returned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {book.status === 'returned' ? 'Returned' : 'Borrowed'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {book.status !== 'returned' && (
                        <button
                          className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                          onClick={() => handleReturn(book.transaction_id, book.title)}
                          disabled={loading.action}
                        >
                          {loading.action ? 'Returning...' : 'Return'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default UserDashboard; 