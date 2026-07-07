import { getBookImageSrc } from "../utils/bookImage";

function HomePage({
  user,
  isAdmin,
  totalBooks,
  availableBooks,
  issuedBooks,
  topRatedBook,
  showcaseItems,
  quickCategories,
  featuredBooks,
  uploadsBase,
  onExploreBooks,
  onOpenProfile,
  onSelectCategory,
}) {
  const partnerLogos = ["Reader+", "InkFlow", "PrimeShelf", "NovaBooks", "PageNest", "LitCart"];
  const spotlightStats = [
    { label: "Live Catalogue", value: `${totalBooks}+` },
    { label: "Available Now", value: availableBooks },
    { label: "Reader Access", value: isAdmin ? "Admin+" : "Premium" },
  ];

  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="hero-chip-row">
            <div className="chip">{isAdmin ? "Admin Experience" : "Reader Experience"}</div>
            <div className="hero-sticker">New Drop</div>
          </div>
          <h2>High-end digital bookstore with fast discovery and checkout</h2>
          <p>Browse books, manage your profile, and access admin tools from one clean interface.</p>

          <div className="hero-spotlight-grid">
            {spotlightStats.map((item) => (
              <article className="hero-spotlight-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="hero-actions">
            <button className="primary-btn" onClick={onExploreBooks}>
              Explore Books
            </button>
            <button className="secondary-btn" onClick={onOpenProfile}>
              Open Profile
            </button>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="metric-card emphasis">
            <span>Total Books</span>
            <strong>{totalBooks}</strong>
          </div>
          <div className="metric-card">
            <span>Available</span>
            <strong>{availableBooks}</strong>
          </div>
          <div className="metric-card">
            <span>Issued</span>
            <strong>{issuedBooks}</strong>
          </div>
          <div className="metric-card">
            <span>Top Rated</span>
            <strong>{topRatedBook.title}</strong>
          </div>
          <div className="hero-badge-stack">
            <div className="floating-badge">
              <span>Store Mode</span>
              <strong>Buy, Read, Review</strong>
            </div>
            <div className="floating-badge accent">
              <span>Access</span>
              <strong>{isAdmin ? "Admin Operations" : "Premium Reader Pass"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="ticker-band">
        <div className="ticker-track">
          {[
            "Premium Marketplace UI",
            "1200+ Books Ready",
            "Razorpay Checkout",
            "PDF / EPUB Unlock",
            "Wishlist + Orders + Reviews",
            "Role-Based Dashboards",
          ].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

      <section className="brand-showcase-band">
        <div className="brand-showcase-head">
          <div>
            <h3>Modern browsing, simplified</h3>
          </div>
          <div className="brand-sticker-stack">
            <span className="brand-sticker">Trusted Reader UX</span>
            <span className="brand-sticker alt">Fast Checkout</span>
          </div>
        </div>
        <div className="logo-marquee">
          <div className="logo-marquee-track">
            {[...partnerLogos, ...partnerLogos].map((logo, index) => (
              <article className="logo-chip" key={`${logo}-${index}`}>
                <span className="logo-chip-mark" />
                <strong>{logo}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="showcase-grid">
        {showcaseItems.map((item) => (
          <article className="showcase-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>Browse like a premium shopping platform</h3>
            </div>
            <button className="ghost-btn" onClick={onExploreBooks}>
              View All Books
            </button>
          </div>

          <div className="category-row">
            {quickCategories.map((category) => (
              <button
                key={category}
                className="category-pill"
                onClick={() => onSelectCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mini-grid">
            {featuredBooks.map((book) => (
              <article className="mini-book-card" key={book.id}>
                <img
                  src={getBookImageSrc(book.image, uploadsBase, book.title, book.category)}
                  alt={book.title}
                  className="mini-cover"
                  loading="lazy"
                />
                <div>
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="side-stack">
          <div className="side-card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>User ID: {user.id}</p>
            <button className="secondary-btn" onClick={onOpenProfile}>
              View Profile
            </button>
          </div>

          <div className="side-card">
            <h3>{isAdmin ? "Admin Panel Enabled" : "Reader Panel Enabled"}</h3>
            <p>{isAdmin ? "Upload books, update listings, and manage the catalogue." : "Browse books, open details, and rate titles."}</p>
          </div>
        </aside>
      </section>
    </>
  );
}

export default HomePage;
