# Testing Report Draft

## Introduction

Testing is an important part of the development of any web application because it provides evidence that the system behaves as expected and reduces the likelihood of regression when new features are added. In the Smart Library Hub project, the application has grown into a fairly complex full-stack system that includes user authentication, role-based access control, book browsing, borrowing workflows, profile management, and paid ebook access. Because the assignment brief specifically requires some automated testing using techniques covered during the module, this report focuses on automated backend feature testing. These tests were selected because the Laravel API acts as the central point of control for the most important business logic in the application.

## Testing approach

The chosen approach was automated feature testing using Laravel's built-in testing framework and PHPUnit. Feature tests are appropriate here because they simulate realistic HTTP requests to the API and validate both status codes and JSON responses. This is more useful than only testing isolated functions because the assignment project is built around communication between a React single page application and a Laravel server-side API. Testing the HTTP layer therefore reflects how the real application is used.

The test suite concentrates on the authentication and access-control layer because these features are essential for both functional correctness and security. If these areas fail, the distinction between a normal user and an administrator breaks down, protected routes may become available without authorisation, and profile or account actions may not behave correctly. Since the brief emphasises sophisticated website and internet application development, testing access control is an appropriate demonstration of understanding.

## Automated tests implemented

The first test checks that a standard user can register successfully and receive a token. This verifies that the `/api/register` endpoint accepts valid data, creates a user record, applies the expected default role, and returns the token and user payload needed by the frontend. This test is important because registration is the entry point for a new user journey.

The second test confirms that an administrator account cannot be created without the correct admin access code. This validates one of the custom project rules added to separate the admin panel from the normal user panel. Without this test, a future change could accidentally allow unrestricted admin account creation.

The third test checks that a user cannot log in to the wrong panel. In this project the login request can include a role selection, and the system is expected to reject a normal user who attempts to authenticate as an administrator. This test supports the role-based design of the application and ensures the UI distinction between panels is enforced by the backend rather than only by frontend code.

The fourth test confirms that a protected route cannot be accessed when no bearer token is supplied. This demonstrates that the custom token middleware is operating correctly and that the API does not expose authenticated user data to anonymous requests.

The fifth test checks that logging out clears the stored API token. This is important because logout must not simply change frontend state; it should invalidate the server-side authentication token so the account cannot continue to use protected routes after logout.

The sixth test verifies that a regular user cannot access an admin-only route for book creation. This specifically tests the admin middleware and confirms that a non-admin account is blocked from a privileged endpoint. In a system with role separation, this is one of the most critical security behaviours.

## Why these tests are appropriate

These tests are appropriate for three reasons. First, they align with the most important risks in the project. Authentication and authorisation issues can undermine the whole application, no matter how polished the interface is. Second, they provide strong evidence that the project is more than a static frontend, because they test the server-side behaviour that powers the single page application. Third, they are realistic feature tests that follow the same request and response patterns used by the live React client.

The tests are also maintainable because they are focused, readable, and based on expected business rules. If the application evolves, new tests can be added alongside the same pattern for cart operations, borrow requests, review submission, and payment verification.

## Tools and methods used

The main tools used were Laravel feature tests and PHPUnit. Laravel provides helper methods such as `postJson`, `getJson`, request header simulation, JSON assertion helpers, and database assertions. These tools reduce boilerplate and make the tests readable. The project also uses an in-memory SQLite configuration during testing, which allows tests to run quickly in isolation without touching the main development database.

A small custom schema setup was used inside the tests to create the user table needed by the authentication routes. This choice was practical for the current project because the existing codebase does not contain the full original migration history for every table used in development, yet the authentication tests only depend on the users table. By creating only the needed schema in the test environment, the tests remain fast and reliable.

## Limitations of the current testing

Although the new tests satisfy the assignment requirement for some automated testing, the coverage is not complete. Many major features are still untested, including book CRUD operations, cart and checkout behaviour, borrow request approval, issue and return flows, review submission, notifications, and paid reader access. In a production system, these areas would also need feature tests.

Another limitation is that the frontend itself is not currently covered by automated tests. Since the user interface is built with React, it would be useful in future work to add component or integration testing for key screens such as login, cart, profile, and admin management. However, for the purpose of this assignment and the time available, backend feature testing provides the strongest immediate evidence of application correctness.

## Reflection

The process of adding automated testing highlighted the difference between manually verifying a feature and systematically proving behaviour through repeatable checks. During development, it is easy to assume that a feature works because it appears correct in the browser, but automated tests force the developer to define exact expected outputs. This improves confidence and reduces accidental regressions when the project is modified.

The testing work also reinforced the importance of designing backend rules clearly. For example, the distinction between user and admin roles becomes easier to test when the API responses and status codes are explicit. In that sense, testing did not only verify the application; it also encouraged better API design.

## Conclusion

In conclusion, automated backend testing has now been introduced into the Smart Library Hub project in a way that directly supports the assignment brief. The tests cover registration, role enforcement, protected routes, logout, and admin-only access control. These areas were chosen because they are central to the application's security and structure. While the current suite is not exhaustive, it demonstrates an appropriate understanding of automated testing techniques and provides a solid foundation for future expansion.
