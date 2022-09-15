# Francis Parker Public API
Hello, this is Francis Parker Public API. It's used to access data on [francis parker website](https://francisparkelouisville.org) and other related to francis parker resources
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
    const article: Article = fetchLatest()
}

main() 
```

### Scrap The Whole Page
You can get a list of articles at a certain page
```typescript
// Import function that fetches news
import { fetchPage } from 'francisparker-api/news'
// Import Interface for typing (optional)
import type { Article } from 'francisparker-api/news'

// fetch article
async function main() {
    const pageNumber: number = 0 // page numbers are integers [0, last page], where 0 is the first page (page with the latest news)
    const articles: Article[] = fetchPage(pageNumber)
}

main() 
```
