import type { Metadata } from "next";
import { getSiteUrl, SITE_BRAND } from "@/lib/site";

const BRAND_FIRST_TITLE =
  /^(vnexter\s*(ăn\s*gì|an\s*gi)|ăn\s*gì\s*vnexter)/i;

export const RESTAURANT_DETAIL_OPEN_GRAPH_TYPE = "article" as const;

type OpenGraphWithType = Extract<
  NonNullable<Metadata["openGraph"]>,
  { type?: unknown }
>;

/** Narrow Metadata openGraph union to read og:type safely (e.g. in tests). */
export function getRestaurantDetailOpenGraphType(
  openGraph: Metadata["openGraph"] | undefined,
): typeof RESTAURANT_DETAIL_OPEN_GRAPH_TYPE | undefined {
  if (!openGraph || typeof openGraph !== "object" || !("type" in openGraph)) {
    return undefined;
  }

  const type = (openGraph as OpenGraphWithType).type;
  return type === RESTAURANT_DETAIL_OPEN_GRAPH_TYPE
    ? RESTAURANT_DETAIL_OPEN_GRAPH_TYPE
    : undefined;
}

/** Reject stored titles that lead with the site brand (SEO cannibalization). */
export function isBrandFirstTitle(title: string): boolean {
  return BRAND_FIRST_TITLE.test(title.trim());
}

/** Build default SEO meta from existing restaurant fields */
export function buildRestaurantSeo(input: {
  name: string;
  description: string;
  address: string;
  imageUrl: string;
}): {
  metaTitle: string;
  metaDescription: string;
  metaImageUrl: string;
} {
  const name = input.name.trim();
  const address = input.address.trim();
  const description = input.description.replace(/\s+/g, " ").trim();

  let metaTitle = `${name} gần Trung Kính | ${SITE_BRAND}`;
  if (metaTitle.length > 70) {
    metaTitle = `${name} | ${SITE_BRAND}`;
  }
  if (metaTitle.length > 70) {
    metaTitle = name.slice(0, 70);
  }

  let metaDescription = description;
  if (
    address &&
    !metaDescription.toLowerCase().includes(address.toLowerCase())
  ) {
    const withAddress = `${metaDescription} Địa chỉ: ${address}.`;
    if (withAddress.length <= 180) {
      metaDescription = withAddress;
    }
  }
  if (metaDescription.length > 180) {
    metaDescription = `${metaDescription.slice(0, 177).trim()}...`;
  }
  if (!metaDescription) {
    metaDescription = `Gợi ý ăn trưa tại ${name} quanh 219 Trung Kính, Hà Nội.`;
  }

  return {
    metaTitle,
    metaDescription,
    metaImageUrl: input.imageUrl.trim(),
  };
}

export function resolveRestaurantTitle(
  name: string,
  customTitle?: string | null,
): string {
  const trimmed = customTitle?.trim();
  if (trimmed && !isBrandFirstTitle(trimmed)) {
    return trimmed;
  }
  return buildRestaurantSeo({
    name,
    description: "",
    address: "",
    imageUrl: "",
  }).metaTitle;
}

export function resolveRestaurantDescription(input: {
  name: string;
  description: string;
  address: string;
  metaDescription?: string | null;
}): string {
  const custom = input.metaDescription?.trim();
  if (custom) return custom.slice(0, 180);

  return buildRestaurantSeo({
    name: input.name,
    description: input.description,
    address: input.address,
    imageUrl: "",
  }).metaDescription;
}

export function buildRestaurantKeywords(
  name: string,
  tags: string[],
): string[] {
  const keywords = [
    name,
    `${name} Trung Kính`,
    "ăn trưa Trung Kính",
    "quán ăn Cầu Giấy",
    "219 Trung Kính",
  ];
  for (const tag of tags) {
    if (tag.trim()) keywords.push(tag.trim());
  }
  return Array.from(new Set(keywords));
}

export function buildRestaurantPageMetadata(input: {
  slug: string;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  tags: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImageUrl?: string | null;
}): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalPath = `/restaurants/${input.slug}`;
  const title = resolveRestaurantTitle(input.name, input.metaTitle);
  const description = resolveRestaurantDescription(input);
  const image = input.metaImageUrl?.trim() || input.imageUrl;

  return {
    title: { absolute: title },
    description,
    keywords: buildRestaurantKeywords(input.name, input.tags),
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: RESTAURANT_DETAIL_OPEN_GRAPH_TYPE,
      locale: "vi_VN",
      url: canonicalPath,
      siteName: SITE_BRAND,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function buildRestaurantJsonLd(input: {
  slug: string;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  tags: string[];
  tagLabels: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  avgRating: number;
  reviewCount: number;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/restaurants/${input.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_BRAND,
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: input.name,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Restaurant",
        "@id": `${pageUrl}#restaurant`,
        name: input.name,
        image: input.imageUrl,
        description: input.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: input.address,
          addressLocality: "Hà Nội",
          addressCountry: "VN",
        },
        url: pageUrl,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        servesCuisine: input.tagLabels.join(", "),
        ...(input.reviewCount > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: input.avgRating.toString(),
            bestRating: "5",
            worstRating: "1",
            ratingCount: input.reviewCount.toString(),
          },
        }),
        ...(input.priceMin && {
          priceRange: input.priceMax
            ? `${input.priceMin} - ${input.priceMax} VND`
            : `${input.priceMin}+ VND`,
        }),
      },
    ],
  };
}
