# Discussion Report Draft

## Introduction

This report discusses how the development of a single page application using a client-side framework and a server-side API compares with a more traditional web development methodology. The Smart Library Hub project was built as a React single page application on the frontend with a Laravel API on the backend, backed by a relational database. This architecture was selected because it matched the requirements of the assessment brief and also provided a good opportunity to apply modern web technologies in a realistic project setting.

A traditional web application usually relies on server-rendered pages. In that model, each new page or major action generally triggers a request to the server, which returns a fully rendered HTML response. By contrast, a single page application loads a shell once in the browser and then dynamically updates the interface through JavaScript, usually by requesting JSON data from an API. The two approaches can achieve similar end-user goals, but they differ significantly in architecture, development process, user experience, debugging, testing, performance trade-offs, and deployment.

## Architecture

The most obvious difference is architectural separation. In a traditional web application, frontend and backend logic are often tightly coupled. The server is responsible for routing, fetching data, applying business logic, and rendering the final HTML. In the single page application approach used in this project, responsibilities are split. React handles the presentation layer, routing inside the browser, and interactive state. Laravel handles authentication, validation, business rules, storage, and API responses.

This separation provides clearer boundaries between concerns. The frontend can focus on rendering interfaces such as the homepage, product pages, profile page, cart, and admin dashboard. The backend can focus on endpoints for registration, login, books, reviews, cart operations, orders, wishlist features, borrow requests, analytics, and profile updates. As a result, the system becomes more modular.

However, this architecture also introduces additional complexity. Instead of one monolithic application returning HTML, the developer now has to manage two connected applications. The React client and the Laravel API must agree on request formats, response structures, authentication headers, and error handling. This creates more moving parts than a traditional server-rendered system.

## User experience

One of the biggest advantages of the single page application model is the user experience. Because the browser does not need to reload the entire page for each navigation step, the interface feels faster and more fluid. In the Smart Library Hub project, this is especially visible when moving between the homepage, books page, profile page, admin dashboard, cart, and individual book details. Client-side routing makes the system feel more like a modern product rather than a sequence of disconnected web pages.

This architecture also supports richer interaction patterns. Features such as live search, infinite scroll, lazy image loading, animated dashboards, skeleton loaders, dynamic notifications, and interactive filters are easier to deliver in a React-based interface. The project benefits from this because the application was intentionally developed toward a high-end bookstore style. A traditional server-rendered approach could still implement some of these features, but often with more page refreshes or extra JavaScript layered on top.

At the same time, a traditional approach can still offer a simpler and more predictable user experience for some types of websites. Where the content is relatively static and interactivity is minimal, server-rendered pages can be easier to implement and maintain. For a small informational website or simple booking form, the overhead of a full SPA may not be justified.

## Development workflow

Developing a single page application with a separate API changes the workflow significantly. The developer must think in terms of contracts between systems. For example, when building login functionality, the frontend needs to know what payload to send, what token to expect in return, and how to persist user state after authentication. The backend must validate the request, check credentials, create a token, and return a structured JSON response. Both sides must then handle success and failure paths correctly.

This project demonstrated that such a workflow is powerful but demanding. The separation of frontend and backend made it possible to create advanced features like role-based access control, profile editing, book catalogue filtering, cart management, protected ebook access, and admin analytics. Yet it also meant that every feature had to be considered from two angles. A new feature was rarely “just UI” or “just backend”; in most cases it required coordinated changes in both layers.

In a traditional server-rendered system, some of this coordination is simplified because data handling and rendering logic live in the same application. A form submission can validate and render an error message within the same request lifecycle. This reduces the amount of state management required in the browser. For beginner developers, that can make the mental model easier.

## State management

State management is another major difference. Traditional web applications rely more heavily on server-side session state and on the browser naturally reloading pages. In an SPA, the developer is responsible for managing more state in the client. The current project manages information such as the authenticated user, admin status, notifications, selected filters, cart state, theme preferences, modal visibility, activity history, and unlocked reading access.

This offers flexibility but also increases the chance of bugs. If state is not managed carefully, the interface may become inconsistent with the backend. For example, a user may appear logged in on the frontend even if the backend token has expired or been removed. Likewise, admin-only features must never rely solely on frontend hiding; they must also be enforced by the backend. This project addressed that by implementing role checks in Laravel middleware and protected endpoints.

## API design and communication

A client-side framework plus API model places great importance on API design. The API must return clear, consistent, and well-structured JSON responses. Status codes, validation errors, and permission failures need to be explicit because the frontend depends on them to show the correct interface state. In this project, endpoints were created for authentication, books, reviews, profile updates, wishlist, borrow requests, issue tracking, cart, checkout, analytics, and notification flows.

This promotes good engineering practice because the backend becomes reusable and testable as an independent service. In future, the same API could theoretically support a mobile app or another frontend client. This is a strength of API-led development.

In a traditional model, the interface and the data layer are usually more tightly integrated, which can make development faster for smaller systems. But that tighter coupling can reduce reusability and make future expansion harder if another client platform is needed.

## Performance considerations

Performance is more nuanced than it first appears. A single page application often feels faster after the first load because subsequent navigation happens client-side. However, the initial bundle can be heavier because JavaScript, components, routing logic, and styling all need to load before the application becomes interactive. This can affect first contentful paint and time to interactive.

Traditional server-rendered applications often deliver meaningful HTML more quickly on the first request, which can benefit perceived performance and search engine indexing. They may be more efficient for simple content-driven websites because less client-side JavaScript is required.

In this project, performance-related improvements such as lazy image loading, infinite scroll, and skeleton loaders were added to improve the SPA experience. These additions show that SPA development often requires deliberate optimisation work to remain smooth, especially when handling a large catalogue such as 1000 or more books.

## Testing implications

The SPA plus API approach also affects testing strategy. In a traditional application, it is common to test controller responses, form submissions, and rendered HTML views within one framework. In a separated architecture, the backend API and frontend UI can be tested independently. This can be an advantage because each layer can have focused tests, but it also means there is more total testing to consider.

For the current project, backend feature tests were the most practical and valuable starting point because the API controls security-sensitive behaviour such as registration, login, token handling, and admin access. If time allowed, frontend integration tests would also be useful for validating routing, user interaction, cart flow, and profile features.

This separation of testing concerns is one of the educational strengths of the architecture. It encourages the developer to think about the reliability of both the API contract and the visual client.

## Security implications

Security in an SPA architecture requires discipline. Because much of the interface runs in the browser, it is easy to accidentally trust client-side state too much. In this project, the separation between user and admin panels could not safely rely on React alone. The backend had to enforce admin-only routes through middleware. Similarly, purchased or issued reading access had to be checked on the server before returning protected content or ebook files.

A traditional server-rendered application can sometimes reduce certain risks because the server directly controls page rendering and can limit exposure of sensitive logic. Nevertheless, both models require proper validation, authentication, authorisation, and secure data handling. The difference is that the SPA pattern tends to make the boundaries more explicit, which can be good for understanding but also unforgiving if implemented incorrectly.

## Maintainability and scalability

From a maintainability perspective, the SPA plus API architecture can scale well if structured properly. New pages, routes, and components can be added to the frontend, while backend endpoints and models can evolve independently. This worked well in the Smart Library Hub project as features expanded from a basic library application into a more advanced ebook store with paid access, reviews, notifications, analytics, and profile activity tracking.

The downside is that small changes may require updates in more than one place. A new field on a book, for example, may require backend validation, database support, controller formatting, frontend form changes, and UI rendering updates. In a traditional server-rendered system, this might feel more direct because template rendering and backend logic are in one application.

## Reflection from this project

The development of this project demonstrated both the strengths and weaknesses of the SPA plus API model. On the positive side, it enabled a highly interactive and modern interface with distinct user and admin experiences, dynamic catalogue browsing, premium-style UI elements, and a strong separation of concerns. It also encouraged a more realistic industry-style workflow, where frontend and backend are treated as separate but coordinated systems.

On the negative side, it increased the complexity of integration, debugging, and testing. Environment configuration became more important, especially for API base URLs, uploads, authentication, and payment setup. The architecture demanded more careful planning than a simpler traditional application would have required.

Even so, for a sophisticated web application such as this one, the SPA plus API approach was appropriate. The range of features implemented would have been harder to present with the same level of interactivity using only a traditional page-by-page approach.

## Conclusion

In conclusion, developing a single page application with a client-side framework and server-side API differs from traditional web development in almost every stage of the process: architecture, state management, communication, testing, performance, and deployment. The SPA approach used in the Smart Library Hub project provided a more dynamic and modern user experience, clearer separation between interface and business logic, and better flexibility for future extension. However, it also introduced more complexity and required stronger discipline in API design, testing, and security.

This project shows that the SPA plus API methodology is highly suitable for sophisticated, interactive systems, especially where rich user interaction and modularity are important. Traditional web development remains valuable and often simpler for smaller or less interactive sites, but for this assignment project the modern architecture offered the most appropriate foundation.

## References to include in final submission

Add and format these properly in your chosen academic style before submission:
- MDN Web Docs on single page applications and client-server communication.
- React official documentation.
- Laravel official documentation.
- PHPUnit documentation.
- Academic or industry literature comparing SPA and server-rendered architectures.
- Any lecture materials provided in module 7CC005.
