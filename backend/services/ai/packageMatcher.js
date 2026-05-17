import TourPackage from "../../models/TourPackage.js";

const LOCATION_TERMS = [
  "hunza",
  "skardu",
  "swat",
  "naran",
  "gilgit",
  "chitral",
  "fairy",
  "kaghan",
  "deosai",
  "attabad",
  "khunjerab",
];

function packageSearchText(pkg) {
  return [
    pkg.title,
    pkg.type,
    pkg.description,
    pkg.duration,
    pkg.price,
    ...(pkg.destinations || []),
    ...(pkg.itinerary || []).map((d) => `${d.title || ""} ${d.description || ""}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export async function findMatchingPackages(message = "", limit = 6) {
  const all = await TourPackage.find().sort({ featured: -1, _id: -1 }).lean();
  if (!all.length) return [];

  const text = message.toLowerCase();
  const terms = text.split(/\s+/).filter((t) => t.length > 2);

  const scored = all.map((pkg) => {
    const hay = packageSearchText(pkg);
    let score = 0;

    for (const loc of LOCATION_TERMS) {
      if (text.includes(loc) && hay.includes(loc)) score += 3;
    }

    for (const term of terms) {
      if (hay.includes(term)) score += 1;
    }

    return { pkg, score };
  });

  const matched = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);

  const picked = (matched.length ? matched : scored.slice(0, limit)).slice(0, limit);
  return picked.map((x) => x.pkg);
}

export function formatPackagesForPrompt(packages) {
  if (!packages.length) {
    return "No tour packages are currently listed on the website database.";
  }

  return packages
    .map((pkg, index) => {
      const highlights = (pkg.itinerary || [])
        .slice(0, 3)
        .map((d) => d.title || d.description)
        .filter(Boolean);

      const highlightLines = highlights.length
        ? highlights.map((h) => `   - ${h}`).join("\n")
        : "   - See full itinerary on website";

      return `${index + 1}. ${pkg.title}
   Price: ${pkg.price || "Contact office for quote"}
   Duration: ${pkg.duration || "Flexible"}
   Destinations: ${(pkg.destinations || []).join(", ") || "Northern Pakistan"}
   Website path: /tour-packages/${pkg.id}
   Highlights:
${highlightLines}`;
    })
    .join("\n\n");
}

export function toPackageSummary(pkg) {
  return {
    id: pkg.id,
    title: pkg.title,
    price: pkg.price,
    duration: pkg.duration,
    destinations: pkg.destinations || [],
    path: `/tour-packages/${pkg.id}`,
  };
}
