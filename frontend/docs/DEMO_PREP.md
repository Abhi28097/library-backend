# Demonstration Preparation Notes

## What to be ready to explain
- Why you chose the library and ebook store topic.
- Why React was used for the client side.
- Why Laravel and PHP were used for the API.
- How the frontend communicates with the backend through JSON endpoints.
- How authentication works with bearer tokens.
- How admin and user roles are separated.
- How books are stored and managed in the database.
- How the cart and paid access flow works.
- How borrow requests, issuing, and returns work.
- How testing was carried out.

## Likely technical questions
- Why did you choose a SPA instead of traditional server-rendered pages?
- How is user authentication secured?
- Why must admin routes be protected on the backend as well as the frontend?
- What database tables support the main features?
- What automated tests did you write and why did you choose them?
- What are the limitations of your current system?
- How would you deploy the application to the student server?

## Short answer prompts
- The frontend is React because it supports client-side routing, reusable components, and dynamic UI updates.
- The backend is Laravel because it provides routing, validation, middleware, ORM support, and a structured PHP framework that matches the assignment brief.
- The API returns JSON, which the React application consumes to render and update state without full page reloads.
- Role-based access is enforced by backend middleware so that hidden buttons alone cannot be bypassed.
- Automated tests were added around registration, login role restrictions, protected routes, logout, and admin-only route access.

## Final demo checklist
- Start frontend successfully.
- Start backend successfully.
- Be able to log in as both a user and an admin.
- Show the books catalogue and detail page.
- Show profile features.
- Show admin dashboard features.
- Show one automated test run.
- Be ready to explain code structure and file organisation.
- Bring the report with testing and discussion sections.
