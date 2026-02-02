import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <header>
        <h1>Pathways Portal</h1>
        <Link href="/signin">Sign In</Link>
      </header>

      <div className="container">
        <aside>
          <nav>
            <Link className="active" href="/dashboard">Dashboard</Link>
            <Link href="/pathways">Pathways</Link>
            <Link href="/progress">My Progress</Link>
            <Link href="/about">About</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </aside>

        <main>
          <h2>My Dashboard</h2>

          <div className="subtitle">
            Track your progress toward diploma endorsements.{" "}
            <Link href="/progress">View all details in My Progress.</Link>
          </div>

          <div className="card">
            <h3>To-Do List</h3>

            <div className="section">
              <div className="section-title">Test Scores</div>
              <p>
                Submit your test scores to check if you qualify for endorsements.
              </p>
              <div className="row">
                <Link className="btn btn-blue" href="/upload-scores">
                  Upload Scores
                </Link>
                <div className="status">Pending</div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Course Requirements</div>
              <p>
                Mark classes complete once you've passed to update your progress.
              </p>
              <div className="row">
                <Link className="btn btn-green" href="/course-requirements">
                  ✓ Completed
                </Link>
                <div className="row complete">
                  Completed
                  <div className="check">✓</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
