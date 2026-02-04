import Link from "next/link";
import SideBar from "../components/sidebar.jsx";

export default function AboutPage() {
    return (
        <>
            <header>
                <h1>Pathways Portal</h1>
                <Link href="/signin">Sign In</Link>
            </header>

            <div className="container">
                <SideBar></SideBar>
                

                <main>
                    <h2>About Pathways App</h2>

                    <div className="subtitle">
                        Learn more about the Pathways Portal and how it helps students plan
                        for graduation.
                    </div>

                    <div className="">
                        <h3>Mission Statement</h3>

                        <div className="section">
                            <p>
                                Our mission is to create a pathways app that helps students
                                educate themselves on the requirements needed to earn specific
                                diploma endorsements. We aim to simplify graduation planning by
                                giving students clear, accurate, and accessible information
                                about courses, credits, and endorsements, empowering them to
                                make informed decisions about their academic futures.
                            </p>
                        </div>

                        <div className="section">
                            <h3>The Pathways Team</h3>
                            <p>
                                We are a team of students — Cam, C.D., Dylan, and Trau — working
                                together to improve how students understand and navigate
                                graduation requirements. As students ourselves, we recognized
                                how confusing diploma endorsements, credit requirements, and
                                course pathways can be. This inspired us to create a solution
                                that is built by students, for students.
                            </p>
                        </div>
                    </div>

                    <div className="">
                        <h3>What are Pathways?</h3>

                        <div className="section">
                            <p>
                                Pathway endorsements are a set of academic requirements that give
                                students a seal on their diploma, signifying that they studied
                                in that field.
                            </p>
                        </div>

                        <div className="section">
                            <div className="section-title">How do I get them?</div>
                            <p>
                                Certain pathway endorsements may be available at your school.
                                Completing their requirements results in getting a seal on your
                                diploma. Counselors typically track this progress.
                            </p>
                            <ul>
                                <li>
                                    Classes related to the pathway (for example, programming
                                    classes for the “Programming and Software Development”
                                    endorsement)
                                </li>
                                <li>
                                    Professional learning experiences with pathway-specific
                                    requirements
                                </li>
                                <li>
                                    Meeting academic standards in reading and math through
                                    required English and Math courses
                                </li>
                            </ul>
                        </div>

                        <div className="section">
                            <div className="section-title">
                                How does this app help?
                            </div>
                            <p>
                                The Pathways Portal helps students understand endorsement
                                requirements, track progress, and stay organized while working
                                toward diploma pathway endorsements.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
