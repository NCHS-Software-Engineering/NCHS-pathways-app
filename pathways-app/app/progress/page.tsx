import Link from "next/link";

export default function ProgressPage() {
  return (
    <>
      <header>
        <h1>Pathways Portal</h1>
        <Link href="/signin">Sign In</Link>
      </header>

      <div className="container">
        <aside>
          <nav>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/pathways">Pathways</Link>
            <Link className="active" href="/progress">
              My Progress
            </Link>
            <Link href="/about">About</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </aside>

        <main>
          <h2>My Progress</h2>

          <div className="subtitle">Selected pathway:</div>
          <div className="pathway">
            Programming and Software Development
          </div>

          <div className="progress-label">Progress</div>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>

          <div className="section-title">Completed</div>

          <div className="note">
            When boxes are checked, a popup appears to confirm. The same thing
            happens upon unchecking a box.
          </div>

          <div className="group">
            <label>
              <input type="checkbox" /> Classes taken
            </label>

            <div className="item">
              <input type="checkbox" defaultChecked />
              <span>Computer Programming 2</span>
            </div>

            <div className="item">
              <input type="checkbox" defaultChecked />
              <span>AP Computer Science A</span>
            </div>

            <div className="item">
              <input type="checkbox" defaultChecked />
              <span>Software Engineering 1</span>
            </div>

            <div className="item">
              <input type="checkbox" />
              <span>Software Engineering 2</span>
            </div>
          </div>

          <div className="group">
            <label>
              <input type="checkbox" /> Academic Success in Reading and Math{" "}
              <Link href="/reading-math">Read More</Link>
            </label>

            <div className="item">
              <input type="checkbox" defaultChecked />
              <span>Reading -</span>
              <Link href="/reading-classes">Qualified Classes</Link>
            </div>

            <div className="item">
              <input type="checkbox" />
              <span>Math -</span>
              <Link href="/math-classes">Qualified Classes</Link>
            </div>
          </div>
        </main>
      </div>

      <footer>©2026 Pathways portal</footer>
    </>
  );
}
