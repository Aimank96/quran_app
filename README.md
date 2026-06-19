# Quran Reader - Bacaan Dalam Rumi

A clean, modern web app for reading the Quran with Arabic text, Rumi transliteration, and bilingual translations (Malay/English).

## Features

- **Arabic text** with proper Quranic font (Amiri Quran)
- **Rumi transliteration** — phonetic Latin reading (e.g., *Bismillaahir Rahmaanir Raheem*)
- **Bilingual translations** — toggle between Malay (Basmeih) and English (Saheeh International)
- **Search** — find verses by keyword in either Malay or English
- **Surah navigation** — browse all 114 surahs, previous/next buttons
- **Bismillah** — displayed correctly (omitted for Surah 9, part of ayah 1 for Surah 1)
- **Fully offline** — all data is stored locally, no API dependency

## Tech Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** for styling
- **React Router 7** for navigation
- Local JSON data (no external API required)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  api/quranApi.ts          # Local data fetching + client-side search
  components/
    Header.tsx             # Navigation bar + search + BM/EN toggle
    SurahCard.tsx          # Surah list card
    AyahVerse.tsx          # Arabic + transliteration + translation
    LoadingSpinner.tsx     # Loading indicator
    SearchResults.tsx      # Search result list with highlighting
  context/
    LangContext.tsx         # Language preference (BM/EN) with localStorage
  hooks/
    useSurahList.ts        # Surah list with caching + filtering
    useSurahDetail.ts      # Surah detail by number
    useSearch.ts           # Debounced keyword search
  pages/
    HomePage.tsx           # Searchable surah grid
    SurahPage.tsx          # Ayahs with Arabic, Rumi, and translation
    SearchPage.tsx         # Search results page
  types/quran.ts           # TypeScript interfaces

public/data/               # Local Quran data (offline)
  surahs.json              # List of all 114 surahs
  surah-1.json ... surah-114.json  # Individual surah data
  search-ms.json           # Malay search index
  search-en.json           # English search index
```

## Updating Data

To re-download Quran data from [api.alquran.cloud](https://alquran.cloud/api) and rebuild the search index:

```bash
npm run download-data
```

This fetches all 114 surahs (Arabic, transliteration, Malay, English) and builds the search indexes into `public/data/`.

## Routes

| Path | Page |
|------|------|
| `/` | Home — browse and filter all 114 surahs |
| `/surah/:number` | Surah detail — read ayahs with translations |
| `/search` | Search results for `?q=keyword` |
