import { formatGbp } from "../utils/currency";

function ProfilePage({
  user,
  isAdmin,
  editingProfile,
  setEditingProfile,
  profileDraft,
  wishlistItems,
  issuedBooks,
  borrowRequests,
  purchasedBooks,
  notifications,
  onProfileChange,
  onSaveProfile,
  onCancelProfile,
  onGoAbout,
  onGoBooks,
  onGoAdmin,
  onOpenBook,
  onOpenReader,
  onLogout,
}) {
  const activityTimeline = [
    ...notifications.map((item) => ({
      id: `notification-${item.id}`,
      title: item.title,
      description: item.message,
      createdAt: item.created_at,
      type: item.type || "info",
    })),
    ...purchasedBooks.map((item) => ({
      id: `purchase-${item.book_id}`,
      title: `Purchased ${item.title}`,
      description: `Unlocked digital access for ${formatGbp(item.price || 0)}.`,
      createdAt: null,
      type: "success",
    })),
    ...issuedBooks.map((item) => ({
      id: `issued-${item.id}`,
      title: `${item.book?.title || "Book"} ${item.status === "returned" ? "returned" : "issued"}`,
      description: item.status === "returned"
        ? "This issued book has been returned successfully."
        : `Due on ${item.due_at ? new Date(item.due_at).toLocaleDateString() : "N/A"}.`,
      createdAt: item.returned_at || item.issued_at,
      type: item.status === "overdue" ? "warning" : "info",
    })),
    ...borrowRequests.map((item) => ({
      id: `borrow-${item.id}`,
      title: `Borrow request ${item.status}`,
      description: `${item.book?.title || "Book"} request is currently ${item.status}.`,
      createdAt: item.created_at,
      type: item.status === "approved" ? "success" : item.status === "rejected" ? "warning" : "info",
    })),
  ]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 14);

  return (
    <section className="single-column-page">
      <div className="content-grid">
        <div className="wide-card">
        <div className="section-head">
          <div>
            <h3>Your account details</h3>
          </div>
          <button
            className="secondary-btn"
            onClick={() => setEditingProfile((prev) => !prev)}
          >
            {editingProfile ? "Close Edit" : "Edit Profile"}
          </button>
        </div>

        <div className="profile-hero">
          {user.profile.avatar ? (
            <img src={user.profile.avatar} alt={user.name} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-fallback">
              {(user.name || "U").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h4>{user.name}</h4>
            <p>{user.profile.bio || "Upload a profile photo and add a bio to personalize your account."}</p>
          </div>
        </div>

        <div className="profile-summary">
          <div className="profile-tile">
            <span>Email ID</span>
            <strong>{user.email}</strong>
          </div>
          <div className="profile-tile">
            <span>User ID</span>
            <strong>{user.id}</strong>
          </div>
          <div className="profile-tile">
            <span>Role</span>
            <strong>{isAdmin ? "Admin" : "User"}</strong>
          </div>
        </div>

        {editingProfile ? (
          <div className="profile-form">
            <input type="text" name="phone" placeholder="Phone Number" value={profileDraft.phone} onChange={onProfileChange} />
            <input type="text" name="city" placeholder="City" value={profileDraft.city} onChange={onProfileChange} />
            <input type="text" name="avatar" placeholder="Avatar Image URL" value={profileDraft.avatar} onChange={onProfileChange} />
            <input type="file" name="avatarFile" accept="image/*" onChange={onProfileChange} />
            <textarea name="bio" placeholder="Write something about yourself..." value={profileDraft.bio} onChange={onProfileChange} />
            <div className="button-row">
              <button className="primary-btn" onClick={onSaveProfile}>Save Profile</button>
              <button className="ghost-btn" onClick={onCancelProfile}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-readonly">
            <div>
              <h4>{user.name}</h4>
              <p>{user.profile.bio || "Add your bio from Edit Profile to personalize this section."}</p>
            </div>
            <div className="info-list">
              <p>Phone: {user.profile.phone || "Not added"}</p>
              <p>City: {user.profile.city || "Not added"}</p>
              <p>Avatar URL: {user.profile.avatar || "Not added"}</p>
            </div>
          </div>
        )}
        </div>

        <aside className="side-stack">
          <div className="side-card">
            <button className="ghost-btn full-btn" onClick={onGoAbout}>About Website</button>
            <button className="ghost-btn full-btn" onClick={onGoBooks}>Browse Books</button>
            {isAdmin && (
              <button className="ghost-btn full-btn" onClick={onGoAdmin}>Open Admin Panel</button>
            )}
            <button className="ghost-btn full-btn danger-btn" onClick={onLogout}>Logout</button>
          </div>
        </aside>
      </div>

      <div className="content-grid">
        <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>Your recent library alerts</h3>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <article className={`notification-card ${item.type || "info"}`} key={item.id}>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.message}</p>
                  </div>
                  <span>{item.created_at ? new Date(item.created_at).toLocaleString() : "Now"}</span>
                </article>
              ))
            ) : (
              <p className="about-text">No notifications yet. Your payment, borrow, and issue updates will appear here.</p>
            )}
          </div>
        </div>

        <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>Your unlocked digital library</h3>
            </div>
          </div>

          <div className="profile-library-grid">
            {purchasedBooks.length > 0 ? (
              purchasedBooks.map((item) => (
                <article className="library-item-card" key={item.book_id}>
                  <div>
                    <h4>{item.title || "Book"}</h4>
                    <p>{item.author || "Unknown author"}</p>
                    <p>Paid Price: {formatGbp(item.price || 0)}</p>
                  </div>
                  <button className="primary-btn" onClick={() => onOpenReader(item.book_id)}>
                    Read Now
                  </button>
                </article>
              ))
            ) : (
              <p className="about-text">No purchased books yet. Buy from the cart to unlock reading access.</p>
            )}
          </div>
        </div>

        <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>Saved books for later</h3>
            </div>
          </div>

          <div className="profile-library-grid">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => (
                <article className="library-item-card" key={item.id}>
                  <div>
                    <h4>{item.book?.title || "Book"}</h4>
                    <p>{item.book?.author || "Unknown author"}</p>
                  </div>
                  <button className="secondary-btn" onClick={() => onOpenBook(item.book_id)}>
                    Open Book
                  </button>
                </article>
              ))
            ) : (
              <p className="about-text">No books in wishlist yet.</p>
            )}
          </div>
        </div>

        <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>Your issued and returned books</h3>
            </div>
          </div>

          <div className="profile-library-grid">
            {issuedBooks.length > 0 ? (
              issuedBooks.map((item) => (
                <article className="library-item-card" key={item.id}>
                  <div>
                    <h4>{item.book?.title || "Book"}</h4>
                    <p className={item.status === "overdue" ? "overdue-text" : ""}>Status: {item.status}</p>
                    <p>Issued: {item.issued_at ? new Date(item.issued_at).toLocaleString() : "N/A"}</p>
                    <p>Due: {item.due_at ? new Date(item.due_at).toLocaleString() : "N/A"}</p>
                    <p>Overdue Days: {item.overdue_days || 0}</p>
                    <p className={item.fine_amount > 0 ? "overdue-text" : ""}>Fine: {formatGbp(item.fine_amount || 0)}</p>
                    <p>Returned: {item.returned_at ? new Date(item.returned_at).toLocaleString() : "Not returned"}</p>
                  </div>
                  <button className="secondary-btn" onClick={() => onOpenBook(item.book_id)}>
                    Open Book
                  </button>
                </article>
              ))
            ) : (
              <p className="about-text">No issued books history yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="wide-card">
        <div className="section-head">
          <div>
            <h3>Your recent library journey</h3>
          </div>
        </div>

        <div className="timeline-list">
          {activityTimeline.length > 0 ? (
            activityTimeline.map((item) => (
              <article className="timeline-item" key={item.id}>
                <div className={`timeline-dot ${item.type || "info"}`} />
                <div className="timeline-card">
                  <div className="timeline-head">
                    <h4>{item.title}</h4>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recent"}</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="about-text">No activity yet. Your purchases, borrow events, and notifications will appear here.</p>
          )}
        </div>
      </div>

      <div className="wide-card">
        <div className="section-head">
          <div>
            <h3>Your pending, approved, and rejected requests</h3>
          </div>
        </div>

        <div className="profile-library-grid">
          {borrowRequests.length > 0 ? (
            borrowRequests.map((item) => (
              <article className="library-item-card" key={item.id}>
                <div>
                  <h4>{item.book?.title || "Book"}</h4>
                  <p>Status: {item.status}</p>
                  <p>Requested: {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}</p>
                  <p>Due days requested: {item.due_days}</p>
                  <p>{item.note || "No note added."}</p>
                </div>
                <button className="secondary-btn" onClick={() => onOpenBook(item.book_id)}>
                  Open Book
                </button>
              </article>
            ))
          ) : (
            <p className="about-text">No borrow requests yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
