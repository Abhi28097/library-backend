import { getBookImageSrc } from "../utils/bookImage";

function CartPage({
  cartItems,
  cartSummary,
  orders,
  loading,
  checkoutLoading,
  uploadsBase,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onBrowseBooks,
}) {
  return (
    <section className="single-column-page cart-page-layout">
      <div className="cart-hero-panel">
        <div>
          <h3>Review your premium picks and finish your order</h3>
          <p className="about-text">
            A modern order experience for digital books with quick confirmation and reading access.
          </p>
        </div>
        <div className="cart-hero-stats">
          <article className="cart-hero-stat">
            <span>Items</span>
            <strong>{cartSummary.items_count || 0}</strong>
          </article>
        </div>
      </div>

      <div className="content-grid cart-grid">
        <div className="wide-card">
          {loading ? (
            <div className="cart-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <article className="cart-item-card skeleton-card" key={`cart-skeleton-${index}`}>
                  <div className="cart-item-image skeleton-block" />
                  <div className="cart-item-copy">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line medium" />
                    <div className="skeleton-line short" />
                  </div>
                  <div className="cart-item-actions">
                    <div className="skeleton-button" />
                    <div className="skeleton-line short" />
                  </div>
                </article>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart">
              <h3>Your cart is empty</h3>
              <p className="about-text">Add books from the storefront to start your order.</p>
              <button className="primary-btn" onClick={onBrowseBooks}>Browse Books</button>
            </div>
          ) : (
            <div className="cart-list">
              {cartItems.map((item) => (
                <article className="cart-item-card" key={item.id}>
                  <div className="cart-item-media">
                    <img
                      src={getBookImageSrc(
                        item.book?.image,
                        uploadsBase,
                        item.book?.title,
                        item.book?.category
                      )}
                      alt={item.book?.title || "Book"}
                      className="cart-item-image"
                    />
                  </div>

                  <div className="cart-item-copy">
                    <h4>{item.book?.title || "Untitled Book"}</h4>
                    <p>{item.book?.author || "Unknown Author"}</p>
                  </div>

                  <div className="cart-item-actions">
                    <label className="cart-qty-control">
                      <span>Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, e.target.value)}
                      />
                    </label>
                    <button className="ghost-btn danger-btn" onClick={() => onRemoveItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="side-stack">
          <div className="side-card order-summary-card">
            <h3>{cartSummary.items_count || 0} item(s)</h3>
            <p className="about-text">Pricing is hidden for this submission view.</p>
            <button
              className="primary-btn full-width-btn"
              onClick={onCheckout}
              disabled={checkoutLoading || cartItems.length === 0}
            >
              {checkoutLoading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </aside>
      </div>

      <div className="wide-card">
          <div className="section-head">
            <div>
              <h3>Your premium purchase history</h3>
            </div>
          </div>

        {(orders || []).length > 0 ? (
          <div className="order-history-grid">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <h4>Order</h4>
                <p>Status: {order.payment_status || "Confirmed"}</p>
                <p>Method: {order.payment_method || "Order"}</p>
                <p>Items: {(order.items || []).length}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No orders yet. Your paid book orders will appear here.</p>
        )}
      </div>
    </section>
  );
}

export default CartPage;
