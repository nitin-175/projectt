import type { ShowSummary, VenueSummary } from "@show-booking/types";
import { api } from "./api";

type BackendShowResponse = {
  id: number;
  title: string;
  description: string;
  duration: number;
  language: string;
  genre: string;
  posterUrl: string;
  venueIds: number[];
  venues: VenueSummary[];
  timings: ShowSummary["timings"];
};

export type ShowFormPayload = {
  title: string;
  description: string;
  duration: number;
  language: string;
  genre: string;
  posterUrl: string;
  venueIds: number[];
  timings: {
    venueId: number;
    startTime: string;
    price: number;
  }[];
};

const DATA_IMAGE_URL_PATTERN = /^data:image\/([a-zA-Z0-9.+-]+);base64,/;

function mapShow(response: BackendShowResponse): ShowSummary {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    durationMinutes: response.duration,
    language: response.language,
    genre: response.genre,
    posterUrl: response.posterUrl,
    venues: response.venues,
    timings: response.timings,
  };
}

export async function getShows(): Promise<ShowSummary[]> {
  const response = await api.get<BackendShowResponse[]>("/shows");
  return response.data.map(mapShow);
}

export async function getShowById(showId: number): Promise<ShowSummary> {
  const response = await api.get<BackendShowResponse>(`/shows/${showId}`);
  return mapShow(response.data);
}

export async function getManagedShows(): Promise<ShowSummary[]> {
  const response = await api.get<BackendShowResponse[]>("/shows/manage");
  return response.data.map(mapShow);
}

export async function createShow(show: ShowFormPayload, imageFile?: File): Promise<ShowSummary> {
  const formData = await buildShowFormData(show, imageFile);
  const response = await api.post<BackendShowResponse>("/shows", formData);
  return mapShow(response.data);
}

export async function updateShow(showId: number, show: ShowFormPayload, imageFile?: File): Promise<ShowSummary> {
  const formData = await buildShowFormData(show, imageFile);
  const response = await api.put<BackendShowResponse>(`/shows/${showId}`, formData);
  return mapShow(response.data);
}

export async function deleteShow(showId: number): Promise<void> {
  await api.delete(`/shows/${showId}`);
}

async function buildShowFormData(show: ShowFormPayload, imageFile?: File) {
  const { posterUrl, image } = await normalizePosterInput(show.posterUrl, imageFile);
  const formData = new FormData();

  formData.append("title", show.title);
  formData.append("description", show.description);
  formData.append("duration", show.duration.toString());
  formData.append("language", show.language);
  formData.append("genre", show.genre);
  show.venueIds.forEach((venueId) => formData.append("venueIds", venueId.toString()));
  formData.append("timings", JSON.stringify(show.timings));

  if (image) {
    formData.append("image", image);
  } else if (posterUrl) {
    formData.append("posterUrl", posterUrl);
  }

  return formData;
}

async function normalizePosterInput(posterUrl: string, imageFile?: File) {
  const normalizedPosterUrl = posterUrl.trim();

  if (imageFile) {
    return {
      posterUrl: normalizedPosterUrl,
      image: imageFile,
    };
  }

  if (!normalizedPosterUrl.startsWith("data:image/")) {
    return {
      posterUrl: normalizedPosterUrl,
      image: undefined,
    };
  }

  return {
    posterUrl: "",
    image: dataUrlToFile(normalizedPosterUrl),
  };
}

function dataUrlToFile(dataUrl: string) {
  const matches = dataUrl.match(DATA_IMAGE_URL_PATTERN);
  if (!matches) {
    throw new Error("Unsupported image data URL.");
  }

  const mimeType = matches[0].slice(5, -8);
  const extension = matches[1].split("+")[0];
  const payload = dataUrl.slice(matches[0].length);
  const binary = window.atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], `poster-${Date.now()}.${extension}`, { type: mimeType });
}
