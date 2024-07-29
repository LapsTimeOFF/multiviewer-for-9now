export const betterFetcher = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return (await res.text()) as T;
  }
};
