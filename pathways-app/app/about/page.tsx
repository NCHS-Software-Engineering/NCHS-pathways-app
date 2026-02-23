import Link from "next/link";
import SideBar from "../components/sidebar";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-(gray-50) extraContainer">
            {/* Header */}
            <header className="headerStyle">
                <h1 className="pageTitle pathwaysText">Pathways Portal</h1>
                <Link
                    href="/signin"
                    className="signIn"
                >
                    Sign In
                </Link>
            </header>

            {/* Page layout */}
            <div className="flex">
                {/* Sidebar */}
                <SideBar />

                {/* Main content */}
                <main className="flex-1 p-10">
                    <div className="max-w bg-blue-100 rounded-3xl p-8 space-y-8">
                        {/* Title */}
                        <div>
                            <h2 className="pageTitle">
                                Purpose
                            </h2>
                        </div>

                        {/* Mission */}
                        <div>
                            <h3 className="text-blue-800 mb-3 bodyText">
                                What is the purpose of the Pathways App?
                            </h3>
                            <div className="bg-(--page-background-primary) rounded-xl p-5 text-sm leading-relaxed bodyText">
                                The purpose of the Pathways App is to help students clearly understand, track, and achieve pathway endorsement requirements for graduation. Many students are unaware of what pathway endorsements are, which ones are offered at their school, or what classes and experiences they need to complete to earn them.
                            </div>
                        </div>

                        {/* Team */}
                        <div>
                            <h3 className="text-blue-800 mb-3 bodyText">
                                How does it do this?
                            </h3>
                            <div className="bg-(--page-background-primary) rounded-xl p-5 text-sm leading-relaxed bodyText">
                                The Pathways App simplifies this process by organizing graduation requirements into easy-to-follow pathways, showing students how their courses, academic progress, and professional learning experiences connect to specific endorsements. By giving students transparent and accessible information, the app empowers them to take ownership of their graduation planning rather than relying solely on counselors for tracking.
                            </div>
                        </div>
                    </div>
                    <div className="h-10"></div>
                    {/* Blue container */}
                    <div className="max-w bg-blue-100 rounded-3xl p-8 space-y-8">
                        {/* Title */}
                        <div>
                            <h2 className="pageTitle">
                                About The Pathways App
                            </h2>
                        </div>

                        {/* Mission */}
                        <div>
                            <h3 className="text-blue-800 mb-3 bodyText">
                                Mission Statement
                            </h3>
                            <div className="bg-(--page-background-primary) rounded-xl p-5 text-sm leading-relaxed bodyText">
                                Our mission is to create a pathways app that helps students
                                educate themselves on the requirements needed to earn specific
                                diploma endorsements. We aim to simplify graduation planning by
                                giving students clear, accurate, and accessible information
                                about courses, credits, and endorsements, empowering them to
                                make informed decisions about their academic futures.
                            </div>
                        </div>

                        {/* Team */}
                        <div>
                            <h3 className="text-blue-800 mb-3 bodyText">
                                The Pathways Team
                            </h3>
                            <div className="bg-(--page-background-primary) rounded-xl p-5 text-sm leading-relaxed bodyText">
                                We are a team of students — Cam, C.D., Dylan, and Trau — working
                                together to improve how students understand and navigate
                                graduation requirements. As students ourselves, we recognized
                                how confusing diploma endorsements, credit requirements, and
                                course pathways can be. This inspired us to create a solution
                                that is built by students, for students.
                            </div>
                        </div>
                    </div>

                    {/* Second section */}
                    <div className="max-w bg-blue-100 rounded-3xl p-8 space-y-6 mt-12">
                        <h3 className="pageTitle text-xl">What are pathways?</h3>

                        <p className="text-sm bodyText">
                            Pathway endorsements are a set of academic requirements that give
                            students a seal on their diploma, signifying that they studied in
                            that field.
                        </p>

                        <h4 className="text-blue-800 bodyText">
                            How do I get them?
                        </h4>

                        <div className="bg-(--page-background-primary) rounded-xl p-5 text-sm bodyText">
                            <p className="mb-3">
                                Certain pathway endorsements can be available at your school.
                                Completing their requirements result in getting the seal on
                                your diploma. Generally, counselors track this.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    Classes related to the pathway (ex: programming classes for
                                    the “Programming and Software Development” endorsement)
                                </li>
                                <li>Professional learning experience</li>
                                <li>
                                    A standard of academic success in reading and math — complete
                                    certain Math & English classes
                                </li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
