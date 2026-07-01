function AboutPage({ isAdmin }) {
  return (
    <section className="surface-card about-layout single-column-page">
      <div className="about-grid">
        <article className="about-card">
          <h4>Reader Access</h4>
          <p>Browse books, open details, rate titles, and manage your profile.</p>
        </article>
        <article className="about-card">
          <h4>Admin Access</h4>
          <p>
            {isAdmin
              ? "Your admin role is active, so management tools are available."
              : "Admins can add, update, and remove books from a private panel."}
          </p>
        </article>
        <article className="about-card">
          <h4>Profile Hub</h4>
          <p>Email ID, user ID, and edit profile options are in the top corner menu.</p>
        </article>
      </div>
    </section>
  );
}

export default AboutPage;
