import { useEffect, useRef } from "react";
import { formatGbp } from "../utils/currency";
import { getBookImageSrc } from "../utils/bookImage";

function BooksPage({
  books,
  totalBooks,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  categoryOptions,
  ratings,
  isAdmin,
  uploadsBase,
  wishlistBookIds,
  borrowRequests,
  onBorrowRequest,
  onWishlistToggle,
  onRate,
  onOpenBook,
  onEditBook,
  onDeleteBook,
}) {
  const pendingRequestBookIds = new Set(
    (borrowRequests || [])
      .filter((item) => item.status === "pending")
      .map((item) => item.book_id)
  );
  const loadMoreRef = useRef(null);
  const availableCount = books.filter((book) => book.status === "Available").length;
  const averagePrice = books.length
    ? books.reduce((sum, book) => sum + Number(book.price || 0), 0) / books.length
    : 0;

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || currentPage >= totalPages || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          onPageChange(Math.min(currentPage + 1, totalPages));
        }
      },
      {
        rootMargin: "240px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [currentPage, totalPages, loading, onPageChange]);

  return (
    <section className="surface-card single-column-page">
      <div className="section-head">
        <div>
          <h3>Discover, search, compare, and collect premium reads</h3>
        </div>
        <input
          type="text"
          placeholder="Search by title, author, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
      </div>

      <div className="filter-toolbar">
        <div className="filter-group">
          <label>
            <span>Category</span>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
            </select>
          </label>
          <label>
            <span>Sort By</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="latest">Latest</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
        </div>
        <button
          className="ghost-btn"
          onClick={() => {
            setSearch("");
            setSelectedCategory("All");
            setSelectedStatus("All");
            setSortBy("featured");
          }}
        >
          Reset Filters
        </button>
      </div>

      <div className="storefront-banner">
          <div className="storefront-copy">
            <h3>Built for high-volume browsing with premium cards and fast actions</h3>
            <p>
              Search across the full catalog, jump into details, unlock digital reading,
              and manage your favorites in one storefront.
            </p>
          </div>
        <div className="storefront-stats">
          <article className="storefront-stat">
            <span>Results</span>
            <strong>{totalBooks}</strong>
          </article>
          <article className="storefront-stat">
            <span>Available</span>
            <strong>{availableCount}</strong>
          </article>
          <article className="storefront-stat">
            <span>Avg Price</span>
            <strong>{formatGbp(averagePrice)}</strong>
          </article>
        </div>
      </div>

      {loading ? (
        <div className="book-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <article className="book-card skeleton-card" key={`book-skeleton-${index}`}>
              <div className="book-media">
                <div className="book-image skeleton-block" />
              </div>
              <div className="book-body">
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line short" />
                <div className="skeleton-line long" />
                <div className="skeleton-line long" />
                <div className="skeleton-button-row">
                  <div className="skeleton-button" />
                  <div className="skeleton-button" />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : totalBooks === 0 ? (
        <p className="empty-state">No books found for your search.</p>
      ) : (
        <>
          <div className="book-grid">
            {books.map((book) => {
              const currentRating = ratings[book.id] || Math.round(Number(book.reviews_avg_rating || 0));
              const displayRating = Number(book.reviews_avg_rating || currentRating || 0).toFixed(1);

              return (
                <article className="book-card" key={book.id}>
                  <div className="book-media">
                    <img
                      src={getBookImageSrc(book.image, uploadsBase, book.title, book.category)}
                      alt={book.title}
                      className="book-image"
                      loading="lazy"
                    />
                    <span className={book.status === "Available" ? "status available" : "status issued"}>
                      {book.status}
                    </span>
                  </div>

                  <div className="book-body">
                    <h3>{book.title}</h3>
                    <p className="meta-line">By {book.author}</p>
                    <p className="meta-line">Published {book.published_year}</p>
                    <p className="price-line">{formatGbp(book.price)}</p>
                    <p className="meta-line">{displayRating} average from {book.reviews_count || 0} review(s)</p>
                    <p className="summary-text">
                      {book.description || "No description has been added for this book yet."}
                    </p>

                    <div className="rating-row">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          className={value <= currentRating ? "star-btn active" : "star-btn"}
                          onClick={() => onRate(book.id, value)}
                        >
                          {"\u2605"}
                        </button>
                      ))}
                      <span>{currentRating || 0}.0 your quick rating</span>
                    </div>

                    <div className="button-row">
                      <button className="primary-btn" onClick={() => onOpenBook(book.id)}>View Details</button>
                      {isAdmin ? (
                        <>
                          <button className="secondary-btn" onClick={() => onEditBook(book)}>Edit</button>
                          <button className="ghost-btn danger-btn" onClick={() => onDeleteBook(book.id)}>Delete</button>
                        </>
                      ) : (
                        <>
                          <button className="ghost-btn" onClick={() => onWishlistToggle(book.id)}>
                            {wishlistBookIds.has(book.id) ? "Remove Wishlist" : "Add to Wishlist"}
                          </button>
                          <button
                            className="ghost-btn"
                            onClick={() => onBorrowRequest(book.id)}
                            disabled={pendingRequestBookIds.has(book.id)}
                          >
                            {pendingRequestBookIds.has(book.id) ? "Request Pending" : "Request Book"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pagination-bar">
            <div className="pagination-info">
              <strong>{books.length} loaded</strong>
              <span>{totalBooks} total books</span>
            </div>
            {currentPage < totalPages ? (
              <button
                className="ghost-btn"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              >
                Load More
              </button>
            ) : (
              <span className="about-text">You have reached the end of the catalog.</span>
            )}
          </div>
          <div ref={loadMoreRef} className="scroll-trigger" aria-hidden="true" />
        </>
      )}
    </section>
  );
}

export default BooksPage;
