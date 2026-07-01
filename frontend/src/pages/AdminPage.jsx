import { formatGbp } from "../utils/currency";

function AdminPage({
  editingId,
  form,
  saving,
  onBookChange,
  onSubmit,
  onReset,
  users,
  userForm,
  onUserFormChange,
  onEditUser,
  onSaveUser,
  onResetUser,
  onDeleteUser,
  books,
  issueForm,
  onIssueFormChange,
  onIssueBook,
  issuedBooks,
  onReturnIssuedBook,
  borrowRequests,
  onApproveRequest,
  onRejectRequest,
  analytics,
}) {
  const chartRows = analytics
    ? [
        {
          label: "Users",
          value: analytics.total_users,
          max: Math.max(analytics.total_users, analytics.active_issued_books, analytics.pending_borrow_requests, 1),
        },
        {
          label: "Issued",
          value: analytics.active_issued_books,
          max: Math.max(analytics.total_users, analytics.active_issued_books, analytics.pending_borrow_requests, 1),
        },
        {
          label: "Pending",
          value: analytics.pending_borrow_requests,
          max: Math.max(analytics.total_users, analytics.active_issued_books, analytics.pending_borrow_requests, 1),
        },
      ]
    : [];

  const healthSegments = analytics
    ? [
        { label: "Active Issued", value: analytics.active_issued_books, tone: "var(--secondary)" },
        { label: "Overdue", value: analytics.overdue_books, tone: "var(--danger)" },
        { label: "Returned", value: analytics.returned_books || 0, tone: "var(--success)" },
      ]
    : [];

  const healthTotal = healthSegments.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <section className="single-column-page">
      {analytics && (
        <>
          <div className="analytics-grid">
            <article className="analytics-card">
              <span>Total Users</span>
              <strong>{analytics.total_users}</strong>
            </article>
            <article className="analytics-card">
              <span>Admins</span>
              <strong>{analytics.total_admins}</strong>
            </article>
            <article className="analytics-card">
              <span>Issued Books</span>
              <strong>{analytics.active_issued_books}</strong>
            </article>
            <article className="analytics-card warning">
              <span>Overdue Books</span>
              <strong>{analytics.overdue_books}</strong>
            </article>
            <article className="analytics-card">
              <span>Pending Requests</span>
              <strong>{analytics.pending_borrow_requests}</strong>
            </article>
            <article className="analytics-card">
              <span>Wishlist Count</span>
              <strong>{analytics.wishlist_count}</strong>
            </article>
            <article className="analytics-card warning">
              <span>Outstanding Fines</span>
              <strong>{formatGbp(analytics.outstanding_fine_total)}</strong>
            </article>
          </div>

          <div className="analytics-visual-grid">
            <article className="wide-card chart-card">
              <div className="section-head">
                <div>
                  <h3>Users, active issues, and pending demand</h3>
                </div>
              </div>
              <div className="mini-bar-chart">
                {chartRows.map((item) => (
                  <div className="bar-row" key={item.label}>
                    <div className="bar-row-head">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="side-card chart-card">
              <div className="section-head">
                <div>
                  <h3>Current issue mix</h3>
                </div>
              </div>
              <div className="donut-chart-shell">
                <div
                  className="donut-chart"
                  style={{
                    background: `conic-gradient(
                      var(--secondary) 0% ${(healthSegments[0].value / healthTotal) * 100}%,
                      var(--danger) ${(healthSegments[0].value / healthTotal) * 100}% ${((healthSegments[0].value + healthSegments[1].value) / healthTotal) * 100}%,
                      var(--success) ${((healthSegments[0].value + healthSegments[1].value) / healthTotal) * 100}% 100%
                    )`,
                  }}
                >
                  <div className="donut-hole">
                    <strong>{healthTotal}</strong>
                    <span>Total</span>
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                {healthSegments.map((item) => (
                  <div className="legend-item" key={item.label}>
                    <span className="legend-dot" style={{ background: item.tone }} />
                    <p>{item.label}: {item.value}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </>
      )}

      {analytics?.overdue_books > 0 && (
        <div className="wide-card overdue-banner">
          <h3>{analytics.overdue_books} book(s) are currently overdue</h3>
          <p>Review the Issue Desk below and follow up with users who have crossed their due dates.</p>
        </div>
      )}

      <div className="content-grid">
        <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>{editingId ? "Update existing book" : "Upload a new book photo"}</h3>
            </div>
          </div>

          <div className="form-grid">
            <input type="text" name="title" placeholder="Book Title" value={form.title} onChange={onBookChange} />
            <input type="text" name="author" placeholder="Author Name" value={form.author} onChange={onBookChange} />
            <input type="text" name="category" placeholder="Category" value={form.category} onChange={onBookChange} />
            <input type="number" name="published_year" placeholder="Published Year" value={form.published_year} onChange={onBookChange} />
            <input type="number" step="0.01" name="price" placeholder="Price (INR, shown as GBP)" value={form.price} onChange={onBookChange} />
            <select name="status" value={form.status} onChange={onBookChange}>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
            </select>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={onBookChange}
              required={!editingId}
            />
            <input type="file" name="ebook_file" accept=".pdf,.epub,application/pdf,application/epub+zip" onChange={onBookChange} />
          </div>

          <p className="about-text">
            Upload a real book photo. It is required for new books. If you edit an existing book, you can keep the current photo unless you want to replace it.
          </p>

          <textarea
            name="description"
            placeholder="Book description, overview, offer text, or reading summary..."
            value={form.description}
            onChange={onBookChange}
            className="description-box"
          />

          <textarea
            name="preview_content"
            placeholder="Preview content shown before full purchase..."
            value={form.preview_content}
            onChange={onBookChange}
            className="description-box"
          />

          <textarea
            name="reader_content"
            placeholder="Full reader content unlocked after purchase..."
            value={form.reader_content}
            onChange={onBookChange}
            className="description-box"
          />

          <div className="button-row">
            <button className="primary-btn" onClick={onSubmit} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Book" : "Add Book"}
            </button>
            <button className="ghost-btn" onClick={onReset} disabled={saving}>
              Clear Form
            </button>
          </div>
        </div>

        <aside className="side-stack">
          <div className="side-card">
            <h3>Admin Access</h3>
            <p>
              Frontend admin access is currently protected by the backend role validation.
              Only admin accounts can reach these management actions.
            </p>
          </div>
        </aside>
      </div>

      <div className="wide-card">
        <div className="section-head">
          <div>
            <h3>Edit user role and account details</h3>
          </div>
        </div>

        <div className="form-grid">
          <input type="text" name="name" placeholder="User Name" value={userForm.name} onChange={onUserFormChange} />
          <input type="email" name="email" placeholder="User Email" value={userForm.email} onChange={onUserFormChange} />
          <select name="role" value={userForm.role} onChange={onUserFormChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="button-row admin-user-actions">
          <button className="primary-btn" onClick={onSaveUser} disabled={!userForm.id}>
            {userForm.id ? "Update User" : "Select User"}
          </button>
          <button className="ghost-btn" onClick={onResetUser}>
            Clear User Form
          </button>
        </div>

        <div className="admin-user-list">
          {users.map((account) => (
            <article className="admin-user-card" key={account.id}>
              <div>
                <h4>{account.name}</h4>
                <p>{account.email}</p>
                <p>User ID: {account.id}</p>
              </div>
              <div className="button-row">
                <button className="secondary-btn" onClick={() => onEditUser(account)}>
                  Edit User
                </button>
                <button className="ghost-btn danger-btn" onClick={() => onDeleteUser(account.id)}>
                  Delete User
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="wide-card">
        <div className="section-head">
          <div>
            <h3>Approve or reject user requests</h3>
          </div>
        </div>

        <div className="admin-user-list">
          {borrowRequests.length > 0 ? (
            borrowRequests.map((request) => (
              <article className="admin-user-card" key={request.id}>
                <div>
                  <h4>{request.book?.title || "Book"}</h4>
                  <p>User: {request.user?.name || request.user_id}</p>
                  <p>Email: {request.user?.email || "N/A"}</p>
                  <p>Due days: {request.due_days}</p>
                  <p>Requested: {request.created_at ? new Date(request.created_at).toLocaleString() : "N/A"}</p>
                  <p>{request.note || "No note added."}</p>
                </div>
                {request.status === "pending" && (
                  <div className="button-row">
                    <button className="secondary-btn" onClick={() => onApproveRequest(request.id)}>
                      Approve
                    </button>
                    <button className="ghost-btn danger-btn" onClick={() => onRejectRequest(request.id)}>
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="about-text">No borrow requests in queue.</p>
          )}
        </div>
      </div>

      <div className="wide-card">
        <div className="section-head">
          <div>
            <h3>Issue books to users and mark returns</h3>
          </div>
        </div>

        <div className="form-grid">
          <select name="user_id" value={issueForm.user_id} onChange={onIssueFormChange}>
            <option value="">Select User</option>
            {users
              .filter((account) => account.role === "user")
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.email})
                </option>
              ))}
          </select>
          <select name="book_id" value={issueForm.book_id} onChange={onIssueFormChange}>
            <option value="">Select Book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="due_days"
            min="1"
            max="60"
            placeholder="Due days"
            value={issueForm.due_days}
            onChange={onIssueFormChange}
          />
        </div>

        <div className="button-row admin-user-actions">
          <button className="primary-btn" onClick={onIssueBook}>
            Issue Book
          </button>
        </div>

        <div className="admin-user-list">
          {issuedBooks.map((item) => (
            <article className="admin-user-card" key={item.id}>
              <div>
                <h4>{item.book?.title || "Book"}</h4>
                <p>User ID: {item.user_id}</p>
                <p>Issued: {item.issued_at ? new Date(item.issued_at).toLocaleString() : "N/A"}</p>
                <p>Due: {item.due_at ? new Date(item.due_at).toLocaleString() : "N/A"}</p>
                <p>Overdue Days: {item.overdue_days || 0}</p>
                <p>Fine: {formatGbp(item.fine_amount || 0)}</p>
                <p>Returned: {item.returned_at ? new Date(item.returned_at).toLocaleString() : "Not returned"}</p>
              </div>
              {item.status === "issued" && (
                <div className="button-row">
                  <button className="secondary-btn" onClick={() => onReturnIssuedBook(item.id)}>
                    Mark Returned
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminPage;
