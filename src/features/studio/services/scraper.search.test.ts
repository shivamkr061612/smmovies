import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterMoviesForAdvancedSearch } from "./scraper";
import type { Movie } from "../types";

const movies: Movie[] = [
  {
    id: "hindi-film",
    title: "Hindi Action Film 2024 1080p",
    description: "A feature film",
    imageUrl: "",
    downloadUrl: "",
    quality: "1080p",
  },
  {
    id: "series",
    title: "English Web Series S01E01 720p",
    description: "Episode one",
    imageUrl: "",
    downloadUrl: "",
    quality: "720p",
  },
  {
    id: "anime",
    title: "Hindi Anime 4K",
    description: "Animated feature",
    imageUrl: "",
    downloadUrl: "",
    quality: "4K",
  },
];

describe("filterMoviesForAdvancedSearch", () => {
  it("matches quality labels", () => {
    assert.deepEqual(filterMoviesForAdvancedSearch(movies, { quality: "1080p", language: "", year: "", format: "" }).map((movie) => movie.id), ["hindi-film"]);
  });

  it("matches language in title or description", () => {
    assert.deepEqual(filterMoviesForAdvancedSearch(movies, { quality: "", language: "Hindi", year: "", format: "" }).map((movie) => movie.id), ["hindi-film", "anime"]);
  });

  it("matches release years", () => {
    assert.deepEqual(filterMoviesForAdvancedSearch(movies, { quality: "", language: "", year: "2024", format: "" }).map((movie) => movie.id), ["hindi-film"]);
  });

  it("separates web series and movies", () => {
    assert.deepEqual(filterMoviesForAdvancedSearch(movies, { quality: "", language: "", year: "", format: "Web Series" }).map((movie) => movie.id), ["series"]);
    assert.deepEqual(filterMoviesForAdvancedSearch(movies, { quality: "", language: "", year: "", format: "Movie" }).map((movie) => movie.id), ["hindi-film", "anime"]);
  });

  it("matches anime titles", () => {
    assert.deepEqual(filterMoviesForAdvancedSearch(movies, { quality: "", language: "", year: "", format: "Anime" }).map((movie) => movie.id), ["anime"]);
  });
});