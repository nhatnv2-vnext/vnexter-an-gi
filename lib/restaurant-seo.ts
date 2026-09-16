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
  const description = input.description
    .replace(/\s+/g, " ")
    .trim();

  let metaTitle = `${name} gần Trung Kính · Vnexter ăn gì`;
  if (metaTitle.length > 70) {
    metaTitle = `${name} · Vnexter ăn gì`;
  }
  if (metaTitle.length > 70) {
    metaTitle = name.slice(0, 70);
  }

  let metaDescription = description;
  if (address && !metaDescription.toLowerCase().includes(address.toLowerCase())) {
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
