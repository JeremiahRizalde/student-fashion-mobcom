import Constants from "expo-constants";
import { Platform } from "react-native";

export interface ClothingItem {
  id: string;
  category: "top" | "bottom" | "shoes";
  type: string;
  name: string;
  color: string;
  warmth: string;
  image: any;
}

export interface OutfitStyle {
  id: string;
  title: string;
  desc: string;
  meta: string;
  image: any;
  clothesNeeded: string;
}

const FALLBACK_OUTFITS: OutfitStyle[] = [
  {
    id: "o1",
    title: "Clean Monochrome",
    desc: "Minimalist vibe using shades of black and white.",
    meta: "Trending | 5 min read",
    image: "../../assets/images/Opanchrome.png",
    clothesNeeded: "t1,b3,s1",
  },
  {
    id: "o2",
    title: "Street Style",
    desc: "Bold graphics and comfortable oversized fits.",
    meta: "New | 3 min read",
    image: "../../assets/images/Street Style.png",
    clothesNeeded: "t2,b1,s2",
  },
  {
    id: "o3",
    title: "Library Chic",
    desc: "Preppy and academic style for long study sessions.",
    meta: "Classic | 4 min read",
    image: "../../assets/images/Minimalist.png",
    clothesNeeded: "t4,b4,s5",
  },
  {
    id: "o4",
    title: "Gorpcore",
    desc: "Functional outdoor gear meeting urban fashion.",
    meta: "Outdoor | 6 min read",
    image: "../../assets/images/Gorpcore.png",
    clothesNeeded: "t9,b7,s7",
  },
  {
    id: "o5",
    title: "Y2K Revival",
    desc: "Retro early 2000s aesthetics with baggy silhouettes.",
    meta: "Retro | 5 min read",
    image: "../../assets/images/Y2K Revival.png",
    clothesNeeded: "t5,b2,s6",
  },
];

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const isLikelyLocalHost = (host: string) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return (
    host === "localhost" || host.endsWith(".local") || ipv4Regex.test(host)
  );
};

const inferApiBaseUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (configured && configured.trim().length > 0) {
    return normalizeBaseUrl(configured.trim());
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && isLikelyLocalHost(host)) return `http://${host}:4000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  return "http://localhost:4000";
};

const API_BASE_URL = inferApiBaseUrl();

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const msg = json?.error || response.statusText;
    throw new Error(`API request failed (${response.status}): ${msg}`);
  }

  return json as T;
}

const sortByNewestFirst = (items: ClothingItem[]) => {
  return [...items].sort((a, b) => Number(b.id) - Number(a.id));
};

export const DatabaseService = {
  init: async () => {
    await apiRequest<{ ok: boolean }>("/health");
  },

  fetchItems: async (): Promise<ClothingItem[]> => {
    const result = await apiRequest<{ items: ClothingItem[] }>("/api/clothes");
    return sortByNewestFirst(result.items);
  },

  addItem: async (item: ClothingItem) => {
    await apiRequest<{ ok: boolean }>("/api/clothes", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  updateItem: async (item: ClothingItem) => {
    await apiRequest<{ ok: boolean }>(
      `/api/clothes/${encodeURIComponent(item.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(item),
      },
    );
  },

  removeItem: async (id: string) => {
    await apiRequest<{ ok: boolean }>(
      `/api/clothes/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  },

  fetchOutfits: async (): Promise<OutfitStyle[]> => {
    return FALLBACK_OUTFITS;
  },
};
