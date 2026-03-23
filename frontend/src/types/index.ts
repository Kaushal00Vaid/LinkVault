export type ApiSuccessEnvelope<TData> = {
  success: true;
  statusCode: number;
  message: string;
  data: TData | null;
};

export type ApiErrorEnvelope = {
  success: false;
  message: string;
  errors: string[];
};

export type ApiEnvelope<TData> = ApiSuccessEnvelope<TData> | ApiErrorEnvelope;

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Vault = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  userId: string;
  linkCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LinkTag =
  | "Docs"
  | "UI/UX"
  | "Tutorial"
  | "Deployment"
  | "Tool"
  | "Reference"
  | "Other";

export type Link = {
  _id: string;
  title: string;
  url: string;
  alias?: string;
  description?: string;
  tags: LinkTag[];
  isFavorite: boolean;
  vaultId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SearchResult = Link & {
  vault: Pick<Vault, "_id" | "name" | "slug">;
};

export type SearchResponse = {
  results: SearchResult[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
