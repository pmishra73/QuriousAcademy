import { db } from "@/lib/db";
import { courses as allCourses } from "@/lib/courses";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;

  // Try teacher first, then institute
  const teacher = await db.user.findUnique({
    where: { slug, role: "teacher", active: true },
    include: { institute: true, courses: true },
  });

  if (teacher) {
    const courseIds = teacher.courses.map((a) => a.courseId);
    const teacherCourses = allCourses.filter((c) => courseIds.includes(c.id));
    return <TeacherProfile teacher={teacher} courses={teacherCourses} />;
  }

  const institute = await db.institute.findUnique({
    where: { slug, active: true },
    include: { teachers: { where: { active: true }, include: { courses: true } } },
  });

  if (institute) {
    const courseIds = new Set(institute.teachers.flatMap((t) => t.courses.map((a) => a.courseId)));
    const instituteCourses = allCourses.filter((c) => courseIds.has(c.id));
    return <InstituteProfile institute={institute} courses={instituteCourses} />;
  }

  notFound();
}

// ─── Teacher Profile ──────────────────────────────────────────────────────────

function TeacherProfile({
  teacher,
  courses,
}: {
  teacher: {
    name: string;
    bio: string | null;
    photo: string | null;
    slug: string | null;
    institute: { name: string; slug: string } | null;
  };
  courses: typeof allCourses;
}) {
  return (
    <div>
      <Nav />
      <main>
        <section style={{ padding: "72px 24px 60px", borderBottom: "1px solid var(--border)" }} className="grid-bg">
          <div className="glow-orb glow-orb-violet" style={{ top: -200, left: "50%", transform: "translateX(-50%)" }} />
          <div style={{ maxWidth: 780, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
              {teacher.photo ? (
                <img src={teacher.photo} alt={teacher.name} style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--surface-2)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
                  {teacher.name[0]}
                </div>
              )}
              <div>
                {teacher.institute && (
                  <Link href={`/p/${teacher.institute.slug}`} style={{ fontSize: 12, color: "var(--primary)", marginBottom: 8, display: "inline-block" }}>
                    ← {teacher.institute.name}
                  </Link>
                )}
                <h1 style={{ fontSize: "clamp(26px,4vw,44px)", marginBottom: 8, lineHeight: 1.2 }}>{teacher.name}</h1>
                <div className="tag" style={{ display: "inline-flex", marginBottom: 12 }}>Instructor · Qurious Academy</div>
                {teacher.bio && <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 540 }}>{teacher.bio}</p>}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(22px,3vw,34px)", marginBottom: 32 }}>
              Courses by {teacher.name} <span style={{ color: "var(--text-muted)", fontSize: "0.6em" }}>({courses.length})</span>
            </h2>
            {courses.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No courses published yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
                {courses.map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ─── Institute Profile ────────────────────────────────────────────────────────

function InstituteProfile({
  institute,
  courses,
}: {
  institute: {
    name: string;
    bio: string | null;
    logo: string | null;
    website: string | null;
    teachers: { id: string; name: string; photo: string | null; bio: string | null; slug: string | null }[];
  };
  courses: typeof allCourses;
}) {
  return (
    <div>
      <Nav />
      <main>
        <section style={{ padding: "72px 24px 60px", borderBottom: "1px solid var(--border)" }} className="grid-bg">
          <div className="glow-orb" style={{ top: -200, left: "50%", transform: "translateX(-50%)" }} />
          <div style={{ maxWidth: 780, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
              {institute.logo ? (
                <img src={institute.logo} alt={institute.name} style={{ width: 88, height: 88, borderRadius: 14, objectFit: "contain", background: "var(--surface-2)", border: "1px solid var(--border)", padding: 8, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 88, height: 88, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
                  🏫
                </div>
              )}
              <div>
                <div className="tag" style={{ display: "inline-flex", marginBottom: 12 }}>Institute · Qurious Academy</div>
                <h1 style={{ fontSize: "clamp(26px,4vw,44px)", marginBottom: 8, lineHeight: 1.2 }}>{institute.name}</h1>
                {institute.bio && <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 560, marginBottom: 12 }}>{institute.bio}</p>}
                {institute.website && (
                  <a href={institute.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--primary)" }}>
                    {institute.website.replace(/^https?:\/\//, "")} ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {institute.teachers.length > 0 && (
          <section style={{ padding: "48px 24px 0" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2 style={{ fontSize: "clamp(20px,2.5vw,28px)", marginBottom: 24 }}>Our Instructors</h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {institute.teachers.map((t) => (
                  <div key={t.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center", minWidth: 220 }}>
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {t.name[0]}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                      {t.bio && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4, maxWidth: 180 }}>{t.bio.slice(0, 60)}{t.bio.length > 60 ? "…" : ""}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section style={{ padding: "48px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(22px,3vw,34px)", marginBottom: 32 }}>
              Courses <span style={{ color: "var(--text-muted)", fontSize: "0.6em" }}>({courses.length})</span>
            </h2>
            {courses.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No courses published yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
                {courses.map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ─── Shared course card ───────────────────────────────────────────────────────

function CourseCard({ course }: { course: (typeof allCourses)[0] }) {
  return (
    <Link href={`/courses/${course.id}`} className="card-hover" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, background: "var(--surface-2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid var(--border)" }}>{course.badge}</div>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "rgba(91,124,250,0.1)", color: "var(--primary)", border: "1px solid rgba(91,124,250,0.2)", fontWeight: 500 }}>{course.level}</span>
      </div>
      <h3 style={{ fontSize: 16, marginBottom: 6, fontFamily: "var(--font-dm-serif)" }}>{course.title}</h3>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>{course.tagline}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>₹{course.price.toLocaleString("en-IN")}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{course.duration}</div>
      </div>
    </Link>
  );
}
