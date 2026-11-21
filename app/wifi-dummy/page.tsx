import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

type Update = {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  image: string;
  imageAlt: string;
  sortDate: number;
  invalidDate: string;
};

function readFrontmatter(fileName: string) {
  const filePath = path.join(process.cwd(), "content", "wifi-dummy", fileName);
  const source = readFileSync(filePath, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`${fileName} must start with YAML frontmatter.`);
  }

  const fields = new Map<string, string>();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/);
    if (field) fields.set(field[1], field[2].replace(/^["']|["']$/g, ""));
  }

  const title = fields.get("title");
  const date = fields.get("date");
  const author = fields.get("author");
  const description = fields.get("description");
  if (!title || !date || !author || !description) {
    throw new Error(`${fileName} must include title, date, author, and description fields.`);
  }
  const parsedDate = new Date(date).getTime();
  const publicDirectory = path.resolve(process.cwd(), "public");
  const sourceImage = fields.get("image") ?? "";
  const imagePath = path.resolve(publicDirectory, sourceImage.replace(/^[/\\]+/, ""));
  const relativeImagePath = path.relative(publicDirectory, imagePath);
  const imageIsInPublic =
    sourceImage.startsWith("/") &&
    relativeImagePath !== "" &&
    !relativeImagePath.startsWith("..") &&
    !path.isAbsolute(relativeImagePath);
  const image = imageIsInPublic && existsSync(imagePath) ? sourceImage : "";

  return {
    slug: fileName,
    title,
    date,
    author,
    description,
    image,
    imageAlt: fields.get("imageAlt") ?? title,
    sortDate: Number.isNaN(parsedDate) ? Number.NEGATIVE_INFINITY : parsedDate,
    invalidDate: Number.isNaN(parsedDate) ? date : "",
  };
}

function getUpdates(): Update[] {
  const updatesDirectory = path.join(process.cwd(), "content", "wifi-dummy");
  return readdirSync(updatesDirectory)
    .filter((fileName) => fileName.toLowerCase().endsWith(".mdx"))
    .filter((fileName) => !fileName.startsWith("_"))
    .map(readFrontmatter)
    .sort((first, second) => second.sortDate - first.sortDate);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function WifiDummyPage() {
  const updates = getUpdates();

  return (
    <main className="blog-page">
      <div className="blog-banner">
        <Image
          src="/wifidummybanner.png"
          alt="WiFi Dummy"
          width={6912}
          height={3456}
          priority
          sizes="(max-width: 760px) 100vw, 1100px"
        />
      </div>

      <section className="updates-list" aria-label="WiFi Dummy project updates">
        {updates.map((update) => (
          <article className="update-card" key={update.slug}>
            {update.image && (
              <div className="update-image">
                <Image
                  src={update.image}
                  alt={update.imageAlt}
                  fill
                  sizes="(max-width: 760px) 100vw, 860px"
                />
              </div>
            )}
            <div className="update-content">
              <div className="update-meta">
                <time
                  className={update.invalidDate ? "invalid-date" : undefined}
                  dateTime={update.invalidDate ? undefined : update.date}
                >
                  {update.invalidDate ? `Invalid date: ${update.invalidDate}` : formatDate(update.date)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{update.author}</span>
              </div>
              <h2>{update.title}</h2>
              <p>{update.description}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
