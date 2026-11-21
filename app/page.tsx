import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home-shell">
      <header className="brand-header">
        <Image
          className="brand-logo"
          src="/omnihilum.png"
          alt="OMNIHILUM"
          width={512}
          height={512}
          priority
        />
        <h1>OMNIHILUM BLOG</h1>
      </header>

      <div className="home-grid">
        <section className="project-card" aria-label="Projects">
          <Link className="project-link" href="/wifi-dummy">
            <Image
              className="project-logo"
              src="/wifidummylogo.png"
              alt=""
              width={512}
              height={512}
              priority
            />
            <span>WIFI DUMMY</span>
            <span className="project-arrow" aria-hidden="true">↗</span>
          </Link>
        </section>

        <aside className="eyes-column" aria-label="Omnihilum Eyes">
          <div className="eyes-card">
            <Image
              src="/omnihilumeyes.png"
              alt="Omnihilum Eyes"
              fill
              sizes="(max-width: 600px) 25vw, 180px"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
