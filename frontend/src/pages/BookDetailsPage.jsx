import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatGbp } from "../utils/currency";
import { getBookImageSrc } from "../utils/bookImage";

function BookDetailsPage({
  apiBase,
  uploadsBase,
  authToken,
  onRefreshBooks,
  onBuyNow,
  onOpenReader,
  hasAccess,
  isReaderMode = false,
}) {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
  const [readerData, setReaderData] = useState(null);
  const [openingEbook, setOpeningEbook] = useState(false);

  const loadBook = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/books/${bookId}`);
      if (!res.ok) throw new Error("Failed to load book details");
      const data = await res.json();
      setBook(data);
    } catch (error) {
      console.error("Error loading book details:", error);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [bookId]);

  useEffect(() => {
    const loadReader = async () => {
      if (!isReaderMode || !authToken) return;

      try {
        const res = await fetch(`${apiBase}/books/${bookId}/reader`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load reader");
        }
        setReaderData(data);
      } catch (error) {
        console.error("Error loading reader:", error);
        alert(error.message || "Unable to open reader.");
      }
    };

    loadReader();
  }, [apiBase, authToken, bookId, isReaderMode]);

  const handleSubmitReview = async () => {
    if (!authToken) {
      alert("Please login to submit a review.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${apiBase}/books/${bookId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(reviewForm),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save review");
      }

      setReviewForm({ rating: reviewForm.rating, review: "" });
      await loadBook();
      await onRefreshBooks();
    } catch (error) {
      console.error("Error saving review:", error);
      alert(error.message || "Unable to save review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEbook = async () => {
    if (!authToken) {
      alert("Please login first.");
      return;
    }

    try {
      setOpeningEbook(true);
      const res = await fetch(`${apiBase}/books/${bookId}/ebook`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to open ebook file");
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const fileType = readerData?.ebook_file_type || book?.ebook_file_type || "";

      if (fileType.includes("pdf")) {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      } else {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = readerData?.ebook_file_name || book?.ebook_file_name || "ebook-file";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      console.error("Error opening ebook:", error);
      alert(error.message || "Unable to open ebook.");
    } finally {
      setOpeningEbook(false);
    }
  };

  if (loading) {
    return (
      <section className="surface-card single-column-page">
        <div className="detail-grid">
          <div className="detail-panel skeleton-card">
            <div className="detail-cover skeleton-block" />
          </div>
          <div className="detail-panel skeleton-card">
            <div className="skeleton-line short" />
            <div className="skeleton-line long" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line long" />
            <div className="skeleton-line long" />
          </div>
          <div className="detail-panel skeleton-card">
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
            <div className="skeleton-button" />
            <div className="skeleton-button" />
          </div>
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="surface-card single-column-page">
        <h3>Book not found</h3>
        <p className="about-text">The selected book could not be loaded from the current catalogue.</p>
        <Link to="/books" className="primary-btn inline-link-btn">Back to Books</Link>
      </section>
    );
  }

  if (isReaderMode) {
    return (
      <section className="surface-card single-column-page">
        <div className="modal-head page-head-row">
          <div>
            <h3>{readerData?.title || book.title}</h3>
          </div>
          <Link to={`/books/${bookId}`} className="ghost-btn inline-link-btn">Back to Details</Link>
        </div>

        <div className="reader-panel">
          <div className="meta-pills">
            <span>{readerData?.author || book.author}</span>
            <span>{readerData?.category || book.category}</span>
            <span>{readerData?.access_type || "reader"}</span>
          </div>
          {readerData?.ebook_available && (
            <div className="button-row">
              <button className="secondary-btn" onClick={handleOpenEbook} disabled={openingEbook}>
                {openingEbook
                  ? "Opening Ebook..."
                  : (readerData?.ebook_file_type || "").includes("pdf")
                  ? "Open PDF"
                  : "Download Ebook"}
              </button>
            </div>
          )}
          <div className="reader-content">
            {(readerData?.reader_content || "").split("\n").map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 8)}`}>{paragraph || "\u00A0"}</p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const productHighlights = [
    "Instant digital access after payment",
    "Protected premium reader experience",
    book.ebook_file_name ? "PDF / EPUB available with access" : "Story preview available",
  ];

  const trustPoints = [
    "Secure checkout",
    "Premium digital edition",
    "Wishlist and reader sync",
  ];

  return (
    <section className="surface-card single-column-page">
      <div className="modal-head page-head-row">
        <div>
          <h3>{book.title}</h3>
        </div>
        <Link to="/books" className="ghost-btn inline-link-btn">Back to Books</Link>
      </div>

      <div className="detail-grid">
        <div className="detail-panel detail-gallery-panel">
          <img
            src={getBookImageSrc(book.image, uploadsBase, book.title, book.category)}
            alt={book.title}
            className="detail-cover"
            loading="lazy"
          />
          <div className="detail-trust-row">
            {trustPoints.map((item) => (
              <span className="detail-trust-pill" key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="detail-panel prose-panel">
          <div className="meta-pills">
            <span>{book.author}</span>
            <span>{book.category}</span>
            <span>{book.published_year}</span>
            <span>{book.status}</span>
            <span>{Number(book.reviews_avg_rating || 0).toFixed(1)} avg</span>
          </div>
          <div className="detail-headline-block">
            <div>
              <h2>{book.title}</h2>
              <p className="about-text">Built for modern readers who want premium discovery, instant checkout, and protected reading access.</p>
            </div>
            <div className="detail-rating-panel">
              <strong>{Number(book.reviews_avg_rating || 0).toFixed(1)}</strong>
              <span>{book.reviews_count || 0} review(s)</span>
            </div>
          </div>

          <div className="detail-highlights">
            {productHighlights.map((item) => (
              <article className="detail-highlight-card" key={item}>
                <span className="detail-highlight-bullet" />
                <p>{item}</p>
              </article>
            ))}
          </div>

          <h3>Overview</h3>
          <p>{book.description || "No detailed description added for this book yet."}</p>
          {book.preview_content && (
            <>
              <h3>Preview</h3>
              <p>{book.preview_content}</p>
            </>
          )}
        </div>

        <aside className="detail-panel detail-purchase-panel">
          <strong className="detail-price">{formatGbp(book.price)}</strong>
          <p className="about-text">
            Unlock protected reading access, premium preview content, and ebook delivery for supported titles.
          </p>
          <div className="detail-action-stack">
            <button className="secondary-btn full-width-btn" onClick={() => onBuyNow(book.id)}>Buy Now</button>
            {hasAccess?.(book.id) && (
              <button className="ghost-btn full-width-btn" onClick={() => onOpenReader(book.id)}>Read Now</button>
            )}
            {hasAccess?.(book.id) && book.ebook_file_name && (
              <button className="ghost-btn full-width-btn" onClick={handleOpenEbook} disabled={openingEbook}>
                {openingEbook
                  ? "Opening..."
                  : (book.ebook_file_type || "").includes("pdf")
                  ? "Open PDF"
                  : "Download Ebook"}
              </button>
            )}
          </div>
          <div className="detail-trust-box">
            <p>Secure payment ready</p>
            <p>Protected reader unlock</p>
            <p>Works with premium profile library</p>
          </div>
        </aside>
      </div>

      <div className="content-grid review-layout">
        <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>Rate and review this book</h3>
            </div>
          </div>

          <div className="rating-row review-stars-row">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                className={value <= reviewForm.rating ? "star-btn active" : "star-btn"}
                onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
              >
                {"\u2605"}
              </button>
            ))}
          </div>

          <textarea
            className="description-box"
            placeholder="Write your review here..."
            value={reviewForm.review}
            onChange={(e) => setReviewForm((prev) => ({ ...prev, review: e.target.value }))}
          />

          <div className="button-row">
            <button className="primary-btn" onClick={handleSubmitReview} disabled={submitting}>
              {submitting ? "Saving Review..." : "Submit Review"}
            </button>
          </div>
        </div>

        <aside className="side-stack">
          <div className="side-card">
            <h3>{book.reviews_count || 0} reviews</h3>
            <div className="review-list">
              {(book.reviews || []).length > 0 ? (
                book.reviews.map((item) => (
                  <article className="review-item" key={item.id}>
                    <strong>{item.user?.name || "Reader"}</strong>
                    <p>{item.rating}/5</p>
                    <p>{item.review || "Rated without written review."}</p>
                  </article>
                ))
              ) : (
                <p className="about-text">No reviews yet. Be the first reader to rate this book.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default BookDetailsPage;
