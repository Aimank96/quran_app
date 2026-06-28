# Data Models & Types

<cite>
**Referenced Files in This Document**
- [quran.ts](file://src/types/quran.ts)
- [audio.ts](file://src/types/audio.ts)
- [firebase.ts](file://src/types/firebase.ts)
- [quranApi.ts](file://src/api/quranApi.ts)
- [AudioContext.tsx](file://src/context/AudioContext.tsx)
- [audioCache.ts](file://src/utils/audioCache.ts)
- [audioUrl.ts](file://src/utils/audioUrl.ts)
- [useSurahList.ts](file://src/hooks/useSurahList.ts)
- [useSurahDetail.ts](file://src/hooks/useSurahDetail.ts)
- [useBookmarks.ts](file://src/hooks/useBookmarks.ts)
- [SurahCard.tsx](file://src/components/SurahCard.tsx)
- [AyahVerse.tsx](file://src/components/AyahVerse.tsx)
- [SurahPage.tsx](file://src/pages/SurahPage.tsx)
- [surahs.json](file://public/data/surahs.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the data models and types used in the Quran Reader application. It focuses on TypeScript interfaces and type definitions for Surah metadata, Ayah content, audio playback state, reciters, and user data. It also documents data validation rules, entity relationships, data flow patterns, offline storage formats, caching strategies, and lifecycle management. The goal is to provide a clear understanding of how data is structured, transformed, normalized, and consumed across the application.

## Project Structure
The data model layer is primarily defined in dedicated TypeScript type files and used by React components, hooks, and contexts. APIs and utilities handle data fetching and caching.

```mermaid
graph TB
subgraph "Types"
T1["src/types/quran.ts"]
T2["src/types/audio.ts"]
T3["src/types/firebase.ts"]
end
subgraph "API Layer"
A1["src/api/quranApi.ts"]
end
subgraph "Utilities"
U1["src/utils/audioUrl.ts"]
U2["src/utils/audioCache.ts"]
end
subgraph "Hooks"
H1["src/hooks/useSurahList.ts"]
H2["src/hooks/useSurahDetail.ts"]
H3["src/hooks/useBookmarks.ts"]
end
subgraph "Context"
C1["src/context/AudioContext.tsx"]
end
subgraph "Components"
V1["src/components/SurahCard.tsx"]
V2["src/components/AyahVerse.tsx"]
V3["src/pages/SurahPage.tsx"]
end
subgraph "Static Data"
D1["public/data/surahs.json"]
end
T1 --> A1
T1 --> H1
T1 --> H2
T1 --> V1
T1 --> V2
T1 --> V3
T2 --> C1
T2 --> U1
T2 --> U2
T3 --> H3
A1 --> D1
C1 --> U1
C1 --> U2
H1 --> A1
H2 --> A1
```

**Diagram sources**
- [quran.ts:1-64](file://src/types/quran.ts#L1-L64)
- [audio.ts:1-41](file://src/types/audio.ts#L1-L41)
- [firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)
- [useSurahList.ts:1-47](file://src/hooks/useSurahList.ts#L1-L47)
- [useSurahDetail.ts:1-37](file://src/hooks/useSurahDetail.ts#L1-L37)
- [useBookmarks.ts:1-88](file://src/hooks/useBookmarks.ts#L1-L88)
- [SurahCard.tsx:1-42](file://src/components/SurahCard.tsx#L1-L42)
- [AyahVerse.tsx:1-63](file://src/components/AyahVerse.tsx#L1-L63)
- [SurahPage.tsx:1-120](file://src/pages/SurahPage.tsx#L1-L120)
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)

**Section sources**
- [quran.ts:1-64](file://src/types/quran.ts#L1-L64)
- [audio.ts:1-41](file://src/types/audio.ts#L1-L41)
- [firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)
- [useSurahList.ts:1-47](file://src/hooks/useSurahList.ts#L1-L47)
- [useSurahDetail.ts:1-37](file://src/hooks/useSurahDetail.ts#L1-L37)
- [useBookmarks.ts:1-88](file://src/hooks/useBookmarks.ts#L1-L88)
- [SurahCard.tsx:1-42](file://src/components/SurahCard.tsx#L1-L42)
- [AyahVerse.tsx:1-63](file://src/components/AyahVerse.tsx#L1-L63)
- [SurahPage.tsx:1-120](file://src/pages/SurahPage.tsx#L1-L120)
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)

## Core Components
This section defines the primary data models and their roles.

- SurahInfo
  - Purpose: Lightweight metadata for each Surah used in lists and summaries.
  - Fields: number, name, englishName, englishNameTranslation, numberOfAyahs, revelationType.
  - Validation: number is positive integer; numberOfAyahs is positive integer; revelationType is literal union of Meccan or Medinan.

- Ayah
  - Purpose: Represents a single verse with metadata and content.
  - Fields: number, text, numberInSurah, juz, page, sajda.
  - Validation: number and numberInSurah are positive integers; juz and page are positive integers; sajda is boolean or nested object with boolean flags.

- Edition
  - Purpose: Describes a text edition (language, script, direction).
  - Fields: identifier, language, name, englishName, format, type, direction.

- SurahEdition
  - Purpose: A Surah in a specific edition, including ayahs and edition metadata.
  - Fields: number, name, englishName, englishNameTranslation, revelationType, numberOfAyahs, ayahs[], edition.

- SurahDetailData
  - Purpose: Aggregates multiple editions for a Surah (Arabic, transliteration, Malay, English).
  - Fields: arabic: SurahEdition, transliteration: SurahEdition, malay: SurahEdition, english: SurahEdition.

- SearchMatch
  - Purpose: Search result item linking an Ayah to its Surah.
  - Fields: number, text, numberInSurah, surah: SurahInfo.

- SearchResultsData
  - Purpose: Container for search results count and matches.
  - Fields: count: number, matches: SearchMatch[].

- AudioState
  - Purpose: Centralized audio playback state managed by the AudioContext.
  - Fields: status, currentAyah, reciter, surahPlayMode, totalAyahsInSurah, errorMessage, recitationMode, activeLanguage.

- Reciter
  - Purpose: Defines audio reciter metadata.
  - Fields: id, name, bitrate, language.

- BookmarkData and NoteData
  - Purpose: Persistent user data stored in Firestore.
  - Fields: BookmarkData includes surahNumber, ayahNumber, arabicText, timestamp; NoteData includes surahNumber, ayahNumber, note, timestamp.

Validation rules summary:
- Numeric fields are positive integers.
- Enum-like fields use literal unions (e.g., revelationType, language, status).
- Nested objects (e.g., sajda) may be booleans or objects with boolean flags.

**Section sources**
- [quran.ts:1-64](file://src/types/quran.ts#L1-L64)
- [audio.ts:1-41](file://src/types/audio.ts#L1-L41)
- [firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)

## Architecture Overview
The application separates concerns across types, API utilities, hooks, and context. Data flows from static JSON files to UI components via hooks and contexts, while audio data is fetched from Firebase Storage and cached locally.

```mermaid
sequenceDiagram
participant UI as "UI Components"
participant Hooks as "React Hooks"
participant API as "quranApi.ts"
participant Static as "surahs.json"
participant Ctx as "AudioContext.tsx"
participant Util as "audioUrl.ts"
participant Cache as "audioCache.ts"
UI->>Hooks : Request Surah list/detail
Hooks->>API : fetchAllSurahs()/fetchSurahDetail()
API->>Static : GET /data/surah*.json
Static-->>API : JSON payload
API-->>Hooks : SurahInfo[] / SurahDetailData
Hooks-->>UI : Rendered data
UI->>Ctx : playAyah()/playEntireSurah()
Ctx->>Util : buildAudioPath()
Ctx->>Cache : getCachedAudio()
alt Not cached
Ctx->>Cache : cacheAudio(blob)
end
Ctx-->>UI : Playback controls and status
```

**Diagram sources**
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)
- [AudioContext.tsx:1-396](file://src/context/AudioContext.tsx#L1-L396)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)

## Detailed Component Analysis

### Surah and Ayah Data Model
Surah metadata and Ayah content are defined in the quran types. SurahDetailData aggregates multiple editions for rendering.

```mermaid
classDiagram
class SurahInfo {
+number : number
+name : string
+englishName : string
+englishNameTranslation : string
+numberOfAyahs : number
+revelationType : "Meccan"|"Medinan"
}
class Ayah {
+number : number
+text : string
+numberInSurah : number
+juz : number
+page : number
+sajda : boolean|object
}
class Edition {
+identifier : string
+language : string
+name : string
+englishName : string
+format : string
+type : string
+direction : string
}
class SurahEdition {
+number : number
+name : string
+englishName : string
+englishNameTranslation : string
+revelationType : string
+numberOfAyahs : number
+ayahs : Ayah[]
+edition : Edition
}
class SurahDetailData {
+arabic : SurahEdition
+transliteration : SurahEdition
+malay : SurahEdition
+english : SurahEdition
}
SurahDetailData --> SurahEdition : "composes"
SurahEdition --> Ayah : "contains many"
SurahEdition --> Edition : "has"
```

**Diagram sources**
- [quran.ts:1-64](file://src/types/quran.ts#L1-L64)

**Section sources**
- [quran.ts:1-64](file://src/types/quran.ts#L1-L64)

### Audio Playback State and Reciters
AudioState encapsulates playback status, current Ayah, reciter selection, and recitation mode. Reciters are predefined with language and bitrate.

```mermaid
classDiagram
class AudioState {
+status : "idle"|"loading"|"playing"|"paused"|"error"
+currentAyah : PlayingAyah|null
+reciter : Reciter
+surahPlayMode : boolean
+totalAyahsInSurah : number
+errorMessage : string|null
+recitationMode : "arabic"|"malay"|"arabic-then-malay"
+activeLanguage : "arabic"|"malay"
}
class Reciter {
+id : string
+name : string
+bitrate : string
+language : "arabic"|"malay"
}
class PlayingAyah {
+surahNumber : number
+ayahNumberInSurah : number
}
AudioState --> Reciter : "uses"
AudioState --> PlayingAyah : "tracks"
```

**Diagram sources**
- [audio.ts:1-41](file://src/types/audio.ts#L1-L41)

**Section sources**
- [audio.ts:1-41](file://src/types/audio.ts#L1-L41)

### User Data Models (Bookmarks and Notes)
Bookmarks and Notes are stored in Firestore under the authenticated user’s document path. Document IDs are constructed from Surah and Ayah numbers.

```mermaid
erDiagram
USERS {
string uid PK
}
BOOKMARKS {
string id PK
number surahNumber
number ayahNumber
string arabicText
timestamp timestamp
}
NOTES {
string id PK
number surahNumber
number ayahNumber
string note
timestamp timestamp
}
USERS ||--o{ BOOKMARKS : "has"
USERS ||--o{ NOTES : "has"
```

**Diagram sources**
- [firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)
- [useBookmarks.ts:1-88](file://src/hooks/useBookmarks.ts#L1-L88)

**Section sources**
- [firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)
- [useBookmarks.ts:1-88](file://src/hooks/useBookmarks.ts#L1-L88)

### Data Flow and Transformations
- Surah list and detail data are loaded from static JSON files and transformed into SurahInfo and SurahDetailData respectively.
- Components render Surah cards and Ayah verses using these typed models.
- Search results are built from pre-indexed JSON arrays and returned as SearchResultsData.

```mermaid
flowchart TD
Start(["App starts"]) --> LoadSurahs["Load Surah list from JSON"]
LoadSurahs --> RenderList["Render Surah cards"]
RenderList --> ViewDetail["User selects Surah"]
ViewDetail --> LoadDetail["Load Surah detail JSON"]
LoadDetail --> RenderDetail["Render Ayahs with translations"]
RenderDetail --> End(["Interactive UI"])
```

**Diagram sources**
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [SurahCard.tsx:1-42](file://src/components/SurahCard.tsx#L1-L42)
- [AyahVerse.tsx:1-63](file://src/components/AyahVerse.tsx#L1-L63)
- [SurahPage.tsx:1-120](file://src/pages/SurahPage.tsx#L1-L120)
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)

**Section sources**
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [SurahCard.tsx:1-42](file://src/components/SurahCard.tsx#L1-L42)
- [AyahVerse.tsx:1-63](file://src/components/AyahVerse.tsx#L1-L63)
- [SurahPage.tsx:1-120](file://src/pages/SurahPage.tsx#L1-L120)
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)

### Audio Playback Lifecycle and Offline Storage
Audio playback integrates Firebase Storage, local IndexedDB caching, and dynamic mode switching.

```mermaid
sequenceDiagram
participant UI as "Surah/Ayah UI"
participant Ctx as "AudioContext"
participant URL as "audioUrl.ts"
participant Cache as "audioCache.ts"
participant FS as "Firebase Storage"
UI->>Ctx : playAyah(surah, ayah)
Ctx->>URL : buildAudioPath(language, reciter, surah, ayah)
Ctx->>Cache : getCachedAudio(key)
alt Not cached
Ctx->>FS : getBlob(ref)
FS-->>Ctx : Blob
Ctx->>Cache : cacheAudio(key, blob)
end
Ctx-->>UI : Play from Blob URL
```

**Diagram sources**
- [AudioContext.tsx:1-396](file://src/context/AudioContext.tsx#L1-L396)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)

**Section sources**
- [AudioContext.tsx:1-396](file://src/context/AudioContext.tsx#L1-L396)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)

## Dependency Analysis
The following diagram shows how types, hooks, and utilities depend on each other.

```mermaid
graph LR
Types["src/types/*.ts"] --> Hooks["src/hooks/*.ts"]
Types --> Ctx["src/context/AudioContext.tsx"]
Hooks --> Pages["src/pages/*.tsx"]
Hooks --> Components["src/components/*.tsx"]
API["src/api/quranApi.ts"] --> Hooks
API --> Static["public/data/*.json"]
Ctx --> Utils["src/utils/*.ts"]
Utils --> Ctx
```

**Diagram sources**
- [quran.ts:1-64](file://src/types/quran.ts#L1-L64)
- [audio.ts:1-41](file://src/types/audio.ts#L1-L41)
- [firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)
- [useSurahList.ts:1-47](file://src/hooks/useSurahList.ts#L1-L47)
- [useSurahDetail.ts:1-37](file://src/hooks/useSurahDetail.ts#L1-L37)
- [useBookmarks.ts:1-88](file://src/hooks/useBookmarks.ts#L1-L88)
- [AudioContext.tsx:1-396](file://src/context/AudioContext.tsx#L1-L396)
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)
- [SurahPage.tsx:1-120](file://src/pages/SurahPage.tsx#L1-L120)
- [SurahCard.tsx:1-42](file://src/components/SurahCard.tsx#L1-L42)
- [AyahVerse.tsx:1-63](file://src/components/AyahVerse.tsx#L1-L63)
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)

**Section sources**
- [quran.ts:1-64](file://src/types/quran.ts#L1-L64)
- [audio.ts:1-41](file://src/types/audio.ts#L1-L41)
- [firebase.ts:1-20](file://src/types/firebase.ts#L1-L20)
- [useSurahList.ts:1-47](file://src/hooks/useSurahList.ts#L1-L47)
- [useSurahDetail.ts:1-37](file://src/hooks/useSurahDetail.ts#L1-L37)
- [useBookmarks.ts:1-88](file://src/hooks/useBookmarks.ts#L1-L88)
- [AudioContext.tsx:1-396](file://src/context/AudioContext.tsx#L1-L396)
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)
- [SurahPage.tsx:1-120](file://src/pages/SurahPage.tsx#L1-L120)
- [SurahCard.tsx:1-42](file://src/components/SurahCard.tsx#L1-L42)
- [AyahVerse.tsx:1-63](file://src/components/AyahVerse.tsx#L1-L63)
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)

## Performance Considerations
- Static JSON loading: Surah lists and details are served as static JSON files, reducing server overhead and enabling fast client-side rendering.
- Client-side search: Pre-built indices reduce server load and improve responsiveness.
- IndexedDB caching: Audio blobs are cached locally to minimize repeated downloads and bandwidth usage.
- Memoization: Filtering Surah lists uses memoization to avoid unnecessary re-computation.
- Mode-driven downloads: Surah play mode can trigger bulk downloads for seamless playback, balancing UX and data usage.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Surah list fails to load: Verify static JSON availability and network connectivity.
- Surah detail missing: Confirm the presence of per-surah JSON files and correct numeric IDs.
- Audio playback errors: Check Firebase Storage permissions, user authentication, and cache health.
- Cache size and cleanup: Use cache inspection utilities to diagnose storage usage and clear when necessary.
- Search results empty: Ensure pre-indexed JSON files are present and properly formatted.

**Section sources**
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [AudioContext.tsx:1-396](file://src/context/AudioContext.tsx#L1-L396)
- [audioCache.ts:1-153](file://src/utils/audioCache.ts#L1-L153)
- [useSurahList.ts:1-47](file://src/hooks/useSurahList.ts#L1-L47)
- [useSurahDetail.ts:1-37](file://src/hooks/useSurahDetail.ts#L1-L37)

## Conclusion
The Quran Reader application employs a clean separation of data models, API utilities, and UI logic. Typed interfaces ensure predictable data shapes, while static JSON and IndexedDB caching deliver efficient offline-first experiences. The audio pipeline integrates seamlessly with Firebase Storage and local caching to support flexible playback modes.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### JSON Data Formats and Sample Structures
- Surah list JSON
  - Structure: Array of SurahInfo objects.
  - Example fields: number, name, englishName, englishNameTranslation, numberOfAyahs, revelationType.
  - Reference: [surahs.json:1-1](file://public/data/surahs.json#L1-L1)

- Surah detail JSON
  - Structure: Per-surah JSON containing SurahDetailData with editions (arabic, transliteration, malay, english).
  - Reference: [quranApi.ts:10-14](file://src/api/quranApi.ts#L10-L14)

- Search index JSON
  - Structure: Arrays of SearchMatch objects for Malay and English indices.
  - Reference: [quranApi.ts:21-41](file://src/api/quranApi.ts#L21-L41)

- Audio cache keys
  - Format: Composite key derived from language, reciterId, surahNumber, ayahNumberInSurah.
  - Reference: [AudioContext.tsx:74-74](file://src/context/AudioContext.tsx#L74-L74), [audioUrl.ts:13-22](file://src/utils/audioUrl.ts#L13-L22)

**Section sources**
- [surahs.json:1-1](file://public/data/surahs.json#L1-L1)
- [quranApi.ts:1-51](file://src/api/quranApi.ts#L1-L51)
- [AudioContext.tsx:1-396](file://src/context/AudioContext.tsx#L1-L396)
- [audioUrl.ts:1-37](file://src/utils/audioUrl.ts#L1-L37)