import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import BookDetailsPage from "./pages/BookDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE || "http://127.0.0.1:8000/uploads";

const EMPTY_FORM = {
  title: "",
  author: "",
  category: "",
  published_year: "",
  price: "",
  status: "Available",
  description: "",
  preview_content: "",
  reader_content: "",
  ebook_file: null,
  image: null,
  existing_image: null,
};

const defaultProfile = {
  phone: "",
  city: "",
  bio: "",
  avatar: "",
  avatarFile: null,
};

const quickCategories = ["Fiction", "History", "Technology", "Business", "Romance"];

const demoShowcase = [
  {
    id: "show-1",
    title: "Curated Shelf Picks",
    subtitle: "Fresh arrivals for curious readers",
    description: "Handpicked collections, visual categories, and discovery cards inspired by modern shopping apps.",
  },
  {
    id: "show-2",
    title: "Fast Delivery Feel",
    subtitle: "Card-based browsing with strong visuals",
    description: "Clean product-style book cards with ratings, badges, and quick actions that feel premium.",
  },
  {
    id: "show-3",
    title: "Personal Reader Space",
    subtitle: "Profile, about, wishlist style interactions",
    description: "Every user gets a profile hub with email, id, about section, and editable information.",
  },
];

function createUserRecord(rawUser) {
  const safeEmail = (rawUser.email || "").trim().toLowerCase();
  const baseName = (rawUser.name || safeEmail.split("@")[0] || "Reader").trim();

  return {
    id: rawUser.id,
    name: baseName,
    email: safeEmail,
    role: rawUser.role || "user",
    token: rawUser.token || null,
    profile: {
      ...defaultProfile,
      ...(rawUser.profile || {}),
      avatarFile: null,
    },
  };
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? createUserRecord(JSON.parse(savedUser)) : null;
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(defaultProfile);
  const [ratings, setRatings] = useState({});
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ id: null, name: "", email: "", role: "user" });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [adminIssuedBooks, setAdminIssuedBooks] = useState([]);
  const [issueForm, setIssueForm] = useState({ user_id: "", book_id: "", due_days: "7" });
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [adminBorrowRequests, setAdminBorrowRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const authHeaders = user?.token ? { Authorization: `Bearer ${user.token}` } : {};

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setProfileDraft(user.profile || defaultProfile);
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/books`);
      if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!user?.token || user.role !== "admin") return;

    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMyLibrary = async () => {
    if (!user?.token) return;

    try {
      const res = await fetch(`${API_BASE}/my-library`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to fetch library data");
      const data = await res.json();
      setWishlistItems(Array.isArray(data.wishlist) ? data.wishlist : []);
      setIssuedBooks(Array.isArray(data.issued_books) ? data.issued_books : []);
      setBorrowRequests(Array.isArray(data.borrow_requests) ? data.borrow_requests : []);
      setPurchasedBooks(Array.isArray(data.purchased_books) ? data.purchased_books : []);
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      console.error("Error fetching library data:", error);
    }
  };

  const fetchAdminIssuedBooks = async () => {
    if (!user?.token || user.role !== "admin") return;

    try {
      const res = await fetch(`${API_BASE}/issued-books`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to fetch issued books");
      const data = await res.json();
      setAdminIssuedBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching admin issued books:", error);
    }
  };

  const fetchAdminBorrowRequests = async () => {
    if (!user?.token || user.role !== "admin") return;

    try {
      const res = await fetch(`${API_BASE}/borrow-requests`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to fetch borrow requests");
      const data = await res.json();
      setAdminBorrowRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching borrow requests:", error);
    }
  };

  const fetchAnalytics = async () => {
    if (!user?.token || user.role !== "admin") return;

    try {
      const res = await fetch(`${API_BASE}/analytics`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [user?.token, user?.role]);

  useEffect(() => {
    fetchMyLibrary();
  }, [user?.token]);

  useEffect(() => {
    fetchAdminIssuedBooks();
  }, [user?.token, user?.role]);

  useEffect(() => {
    fetchAdminBorrowRequests();
  }, [user?.token, user?.role]);

  useEffect(() => {
    fetchAnalytics();
  }, [user?.token, user?.role]);

  useEffect(() => {
    const syncCurrentUser = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch(`${API_BASE}/me`, { headers: authHeaders });
        if (!res.ok) throw new Error("Failed to sync current user");
        const data = await res.json();
        setUser((prev) => createUserRecord({ ...data.user, token: prev?.token }));
      } catch (error) {
        console.error("Error syncing user:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    syncCurrentUser();
  }, []);

  const handleBookChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "image" || name === "ebook_file" ? files?.[0] ?? null : value,
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    setProfileDraft((prev) => ({
      ...prev,
      [name]: name === "avatarFile" ? files?.[0] ?? null : value,
    }));
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleIssueFormChange = (e) => {
    const { name, value } = e.target;
    setIssueForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  };

  const addOrUpdateBook = async () => {
    if (!form.title || !form.author || !form.category || !form.published_year) {
      alert("Please fill all required fields.");
      return;
    }

    if (!form.image && !form.existing_image) {
      alert("Please upload a book photo before saving.");
      return;
    }

    const formData = new FormData();
    Object.entries({
      title: form.title,
      author: form.author,
      category: form.category,
      published_year: form.published_year,
      price: form.price || 0,
      status: form.status,
      description: form.description,
      preview_content: form.preview_content,
      reader_content: form.reader_content,
    }).forEach(([key, value]) => formData.append(key, value));

    if (form.image) formData.append("image", form.image);
    if (form.ebook_file) formData.append("ebook_file", form.ebook_file);

    let url = `${API_BASE}/books`;
    if (editingId) {
      url = `${API_BASE}/books/${editingId}`;
      formData.append("_method", "PUT");
    }

    try {
      setSaving(true);
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to save book: ${res.status}`);
      }
      await fetchBooks();
      resetForm();
      navigate("/admin");
    } catch (error) {
      console.error("Error saving book:", error);
      alert(error.message || "Unable to save the book. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to delete book: ${res.status}`);
      }
      await fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert(error.message || "Unable to delete the book. Please try again.");
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      published_year: book.published_year || "",
      price: book.price || "",
      status: book.status || "Available",
      description: book.description || "",
      preview_content: book.preview_content || "",
      reader_content: book.reader_content || "",
      ebook_file: null,
      image: null,
      existing_image: book.image || null,
    });
    navigate("/admin");
  };

  const editUser = (account) => {
    setUserForm({
      id: account.id,
      name: account.name || "",
      email: account.email || "",
      role: account.role || "user",
    });
  };

  const resetUserForm = () => {
    setUserForm({ id: null, name: "", email: "", role: "user" });
  };

  const saveUser = async () => {
    if (!userForm.id || !userForm.name || !userForm.email) {
      alert("Please fill all user fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/${userForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update user");

      await fetchUsers();
      resetUserForm();
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message || "Unable to update user.");
    }
  };

  const deleteUser = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/users/${accountId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete user");

      await fetchUsers();
      if (userForm.id === accountId) {
        resetUserForm();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.message || "Unable to delete user.");
    }
  };

  const submitRating = async (bookId, rating, review = "") => {
    if (!user?.token) {
      alert("Please login first.");
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ rating, review }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save review");
      }

      setRatings((prev) => ({ ...prev, [bookId]: rating }));
      await fetchBooks();
      return true;
    } catch (error) {
      console.error("Error saving review:", error);
      alert(error.message || "Unable to save review. Please try again.");
      return false;
    }
  };

  const wishlistBookIds = useMemo(
    () => new Set(wishlistItems.map((item) => item.book_id)),
    [wishlistItems]
  );

  const toggleWishlist = async (bookId) => {
    if (!user?.token) {
      alert("Please login first.");
      return;
    }

    const isWishlisted = wishlistBookIds.has(bookId);

    try {
      const res = await fetch(`${API_BASE}/wishlist/${bookId}`, {
        method: isWishlisted ? "DELETE" : "POST",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Wishlist update failed");
      await fetchMyLibrary();
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(error.message || "Unable to update wishlist.");
    }
  };

  const requestBorrow = async (bookId) => {
    if (!user?.token) {
      alert("Please login first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/borrow-requests/${bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ due_days: 7 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to submit borrow request");
      await fetchMyLibrary();
    } catch (error) {
      console.error("Error submitting borrow request:", error);
      alert(error.message || "Unable to submit borrow request.");
    }
  };

  const issueBookToUser = async () => {
    if (!issueForm.user_id || !issueForm.book_id) {
      alert("Please select both a user and a book.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/issued-books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(issueForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to issue book");
      setIssueForm({ user_id: "", book_id: "", due_days: "7" });
      await fetchBooks();
      await fetchMyLibrary();
      await fetchAdminIssuedBooks();
      await fetchAdminBorrowRequests();
      await fetchAnalytics();
    } catch (error) {
      console.error("Error issuing book:", error);
      alert(error.message || "Unable to issue book.");
    }
  };

  const returnIssuedBook = async (issueId) => {
    try {
      const res = await fetch(`${API_BASE}/issued-books/${issueId}/return`, {
        method: "PUT",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to return book");
      await fetchBooks();
      await fetchMyLibrary();
      await fetchAdminIssuedBooks();
      await fetchAdminBorrowRequests();
      await fetchAnalytics();
    } catch (error) {
      console.error("Error returning book:", error);
      alert(error.message || "Unable to return book.");
    }
  };

  const saveProfile = async () => {
    try {
      const payload = new FormData();
      payload.append("name", user.name);
      payload.append("phone", profileDraft.phone || "");
      payload.append("city", profileDraft.city || "");
      payload.append("bio", profileDraft.bio || "");
      payload.append("avatar", profileDraft.avatar || "");

      if (profileDraft.avatarFile) {
        payload.append("avatar_file", profileDraft.avatarFile);
      }

      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { ...authHeaders },
        body: payload,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update profile");
      }
      const data = await res.json();
      setUser((prev) => createUserRecord({ ...data.user, token: prev?.token }));
      setEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.message || "Unable to update profile. Please try again.");
    }
  };

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesQuery = !query
        || [book.title, book.author, book.category].some((value) =>
          (value || "").toLowerCase().includes(query)
        );
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || book.status === selectedStatus;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [books, search, selectedCategory, selectedStatus]);

  const sortedBooks = useMemo(() => {
    const clonedBooks = [...filteredBooks];

    switch (sortBy) {
      case "rating":
        return clonedBooks.sort(
          (a, b) => Number(b.reviews_avg_rating || 0) - Number(a.reviews_avg_rating || 0)
        );
      case "latest":
        return clonedBooks.sort((a, b) => Number(b.published_year || 0) - Number(a.published_year || 0));
      case "title":
        return clonedBooks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      default:
        return clonedBooks.sort((a, b) => {
          const ratingGap = Number(b.reviews_avg_rating || 0) - Number(a.reviews_avg_rating || 0);
          if (ratingGap !== 0) return ratingGap;
          return Number(b.price || 0) - Number(a.price || 0);
        });
    }
  }, [filteredBooks, sortBy]);

  const booksPerPage = 12;
  const totalBookPages = Math.max(Math.ceil(sortedBooks.length / booksPerPage), 1);
  const paginatedBooks = useMemo(() => {
    const visibleCount = currentPage * booksPerPage;
    return sortedBooks.slice(0, visibleCount);
  }, [sortedBooks, currentPage]);

  const categoryOptions = useMemo(
    () => ["All", ...new Set(books.map((book) => book.category).filter(Boolean))],
    [books]
  );

  const totalBooks = books.length;
  const availableBooks = books.filter((book) => book.status === "Available").length;
  const issuedBooksCount = books.filter((book) => book.status === "Issued").length;
  const isAdmin = user?.role === "admin";
  const purchasedBookIds = useMemo(
    () => new Set(purchasedBooks.map((item) => item.book_id || item.id)),
    [purchasedBooks]
  );
  const readableIssuedBookIds = useMemo(
    () => new Set(issuedBooks.map((item) => item.book_id)),
    [issuedBooks]
  );
  const topRatedBook = sortedBooks.reduce(
    (best, book) => {
      const bookRating = Number(book.reviews_avg_rating || ratings[book.id] || 0);
      return bookRating > best.rating ? { rating: bookRating, title: book.title || "Featured Book" } : best;
    },
    { rating: 0, title: "Featured Book" }
  );

  const logout = async () => {
    try {
      if (user?.token) {
        await fetch(`${API_BASE}/logout`, { method: "POST", headers: authHeaders });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      setProfileMenuOpen(false);
      navigate("/");
    }
  };

  if (!user) {
    return <Login onLogin={(loggedInUser) => setUser(createUserRecord(loggedInUser))} />;
  }

  const handleBorrowRequestDecision = async (requestId, action) => {
    try {
      const res = await fetch(`${API_BASE}/borrow-requests/${requestId}/${action}`, {
        method: "PUT",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to ${action} request`);
      await fetchAdminBorrowRequests();
      await fetchAdminIssuedBooks();
      await fetchMyLibrary();
      await fetchBooks();
      await fetchAnalytics();
    } catch (error) {
      console.error(`Error trying to ${action} borrow request:`, error);
      alert(error.message || `Unable to ${action} request.`);
    }
  };

  return (
    <div className="app-shell">
      {showWelcome && location.pathname === "/" && (
        <div className="overlay">
          <div className="modal-card welcome-modal">
            <div className="chip">Smart Launch</div>
            <h2>Welcome to your advanced library storefront</h2>
            <p>
              Explore product-style book cards, a personal profile hub, role-based dashboards,
              and an admin zone for managing the catalogue.
            </p>
            <div className="modal-actions">
              <button className="primary-btn" onClick={() => setShowWelcome(false)}>Start Exploring</button>
              <button className="ghost-btn" onClick={() => navigate("/books")}>Jump to Books</button>
            </div>
          </div>
        </div>
      )}

      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">SL</div>
          <div>
            <h1>Smart Library Hub</h1>
          </div>
        </div>

        <nav className="topnav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>Home</NavLink>
          <NavLink to="/books" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>Books</NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>Profile</NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>About</NavLink>
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}>Admin Panel</NavLink>}
        </nav>

        <div className="toolbar">
          <button className="ghost-btn" onClick={() => setDarkMode((prev) => !prev)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button className="ghost-btn danger-btn" onClick={logout}>
            Logout
          </button>

          <div className="profile-anchor">
            <button className="profile-trigger" onClick={() => setProfileMenuOpen((prev) => !prev)}>
              {user.profile.avatar ? (
                <img src={user.profile.avatar} alt={user.name} className="avatar-image" />
              ) : (
                <div className="avatar-badge">{(user.name || "U").slice(0, 1).toUpperCase()}</div>
              )}
              <div className="profile-copy">
                <strong>{user.name}</strong>
                <span>{user.role === "admin" ? "Admin" : "User"} ID: {user.id}</span>
              </div>
            </button>

            {profileMenuOpen && (
              <div className="profile-menu">
                <p><strong>{user.email}</strong></p>
                <p>User ID: {user.id}</p>
                <button onClick={() => navigate("/profile")}>Open Profile</button>
                <button onClick={() => { setEditingProfile(true); navigate("/profile"); }}>Edit Profile</button>
                <button onClick={() => navigate("/about")}>About</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage user={user} isAdmin={isAdmin} totalBooks={totalBooks} availableBooks={availableBooks} issuedBooks={issuedBooksCount} topRatedBook={topRatedBook} showcaseItems={demoShowcase} quickCategories={quickCategories} featuredBooks={sortedBooks.slice(0, 3)} uploadsBase={UPLOADS_BASE} onExploreBooks={() => navigate("/books")} onOpenProfile={() => navigate("/profile")} onSelectCategory={(category) => { setSelectedCategory(category); setSearch(""); navigate("/books"); }} />} />
          <Route path="/books" element={<BooksPage books={paginatedBooks} totalBooks={sortedBooks.length} currentPage={currentPage} totalPages={totalBookPages} onPageChange={setCurrentPage} loading={loading} search={search} setSearch={setSearch} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} sortBy={sortBy} setSortBy={setSortBy} categoryOptions={categoryOptions} ratings={ratings} isAdmin={isAdmin} uploadsBase={UPLOADS_BASE} wishlistBookIds={wishlistBookIds} borrowRequests={borrowRequests} onBorrowRequest={requestBorrow} onWishlistToggle={toggleWishlist} onRate={submitRating} onOpenBook={(bookId) => navigate(`/books/${bookId}`)} onEditBook={editBook} onDeleteBook={deleteBook} />} />
          <Route path="/books/:bookId" element={<BookDetailsPage apiBase={API_BASE} uploadsBase={UPLOADS_BASE} authToken={user.token} hasAccess={(bookId) => isAdmin || purchasedBookIds.has(Number(bookId)) || readableIssuedBookIds.has(Number(bookId))} onRefreshBooks={fetchBooks} onOpenReader={(bookId) => navigate(`/reader/${bookId}`)} />} />
          <Route path="/reader/:bookId" element={<BookDetailsPage apiBase={API_BASE} uploadsBase={UPLOADS_BASE} authToken={user.token} isReaderMode hasAccess={() => true} onRefreshBooks={fetchBooks} onOpenReader={() => {}} />} />
          <Route path="/profile" element={<ProfilePage user={user} isAdmin={isAdmin} editingProfile={editingProfile} setEditingProfile={setEditingProfile} profileDraft={profileDraft} wishlistItems={wishlistItems} issuedBooks={issuedBooks} borrowRequests={borrowRequests} purchasedBooks={purchasedBooks} notifications={notifications} onProfileChange={handleProfileChange} onSaveProfile={saveProfile} onCancelProfile={() => { setProfileDraft(user.profile || defaultProfile); setEditingProfile(false); }} onGoAbout={() => navigate("/about")} onGoBooks={() => navigate("/books")} onGoAdmin={() => navigate("/admin")} onOpenBook={(bookId) => navigate(`/books/${bookId}`)} onOpenReader={(bookId) => navigate(`/reader/${bookId}`)} onLogout={logout} />} />
          <Route path="/about" element={<AboutPage isAdmin={isAdmin} />} />
          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminPage
                  editingId={editingId}
                  form={form}
                  saving={saving}
                  onBookChange={handleBookChange}
                  onSubmit={addOrUpdateBook}
                  onReset={resetForm}
                  users={users}
                  userForm={userForm}
                  onUserFormChange={handleUserFormChange}
                  onEditUser={editUser}
                  onSaveUser={saveUser}
                  onResetUser={resetUserForm}
                  onDeleteUser={deleteUser}
                  books={books}
                  issueForm={issueForm}
                  onIssueFormChange={handleIssueFormChange}
                  onIssueBook={issueBookToUser}
                  issuedBooks={adminIssuedBooks}
                  onReturnIssuedBook={returnIssuedBook}
                  borrowRequests={adminBorrowRequests}
                  onApproveRequest={(requestId) => handleBorrowRequestDecision(requestId, "approve")}
                  onRejectRequest={(requestId) => handleBorrowRequestDecision(requestId, "reject")}
                  analytics={analytics}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
