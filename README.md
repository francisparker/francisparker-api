# Francis Parker Public API
Hello, this is Francis Parker Public API. It's used to access data on [francis parker website](https://francisparkerlouisville.org) and other related to francis parker resources
# installation
```
$ npm install francisparker-api
```
# API's
## News API
News API is used to fetch news from [Wyvern Bulletin Board](https://francisparkerlouisville.org/wyvernbullbtinboard/)
### Fetch The Latest Article
You can get the latest published article
```typescript
// Import function that fetches news
import { fetchLatest } from 'francisparker-api/news'
// Import Interface for typing (optional)
import type { Article } from 'francisparker-api/news'

// fetch article
async function main() {
    const article: Article = await fetchLatest()
}

main() 
```

### Fetch The Whole Page
You can get a list of articles at a certain page
```typescript
// Import function that fetches news
import { fetchPage } from 'francisparker-api/news'
// Import Interface for typing (optional)
import type { Article } from 'francisparker-api/news'

// fetch articles
async function main() {
    const pageNumber: number = 0 // page numbers are integers [0, last page], where 0 is the first page (page with the latest news)
    const articles: Article[] = await fetchPage(pageNumber)
}

main() 
```

### Fetch A Specific Article
You can fetch a specific article by number. Starting from 0 (the newest article) to max (the oldest article)
```typescript
// Import function that fetches news
import { fetchArticle } from 'francisparker-api/news'
// Import Interface for typing (optional)
import type { Article } from 'francisparker-api/news'

// fetch articles
async function main() {
    const articleNumber: number = 0 // article numbers are integers [0, last article], where 0 is the latest article and last article is the oldest one
    const articles: Article[] = await fetchPage(pageNumber)
}

main()
```
