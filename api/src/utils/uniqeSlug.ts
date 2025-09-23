import { Problem } from "@/models/problem";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqeSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let count = 1;

  while (await Problem.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

export default uniqeSlug;
