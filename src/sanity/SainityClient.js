import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";


export const client = createClient({
  projectId: "bkyggyf6",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});
const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}


