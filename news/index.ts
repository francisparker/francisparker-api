// import type { Announcement } from "./announcements";
import axios from "axios";
import { load } from "cheerio";
import type { Cheerio, Element as CElement } from "cheerio";
import assert from 'assert'
import moment from "moment";

const fetchFrom = "https://francisparkerlouisville.org/wyvernbullbtinboard/"
const pageToFetch = (pageNumber: number) => fetchFrom + `/page/${pageNumber}`

/** Fetch the latest article from the bulletin board */
export async function fetchLatest(): Promise<Article> {
    const webPage = await axios.get(pageToFetch(0));
    assert(webPage.status == 200, `Error: While loading '${fetchFrom}' returned wrong status code. Status code: '${webPage.status}'`)
    const $ = load(webPage.data)
    const raw = $("article:first").html();
    assert(raw, "No articles found")
    return processArticle(raw);
}

/** Fetch the whole page of articles from the bulletin board */
export async function fetchPage(pageNumber: number): Promise<Article[]> {
    assert(Number.isInteger(pageNumber) && pageNumber >= 0, "'pageNumber' is not an unsigned integer!")
    const arr: Article[] = [];
    const webPage = await axios.get(pageToFetch(pageNumber));
    assert(webPage.status == 200, `Error: While loading '${pageToFetch(pageNumber)}' returned wrong status code. Status code: '${webPage.status}'`)
    const $ = load(webPage.data)
    const raw = $("article");
    assert(raw.html(), "No articles found")
    await Promise.all(raw.toArray().map(async (element, index) => {
        arr.push(await processArticle(load(element).html()))
    }))
    return arr;
}

/** fetch a specific article (0 is latest) */
export async function fetchArticle(articleNumber: number) {
    assert(Number.isInteger(articleNumber) && articleNumber >= 0, "'articleNumber' is not an unsigned integer!")
    const articlesOnPage = 6;
    const articleIndex = articleNumber % articlesOnPage
    const pageNumber = (articleNumber - articleIndex) / articlesOnPage;
    const webPage = await axios.get(pageToFetch(pageNumber));
    assert(webPage.status == 200, `Error: While loading '${pageToFetch(pageNumber)}' returned wrong status code. Status code: '${webPage.status}'`)
    const $ = load(webPage.data)
    const raw = $("article");
    assert(raw.html(), "No articles found")
    return await processArticle(load(raw.toArray()[articleIndex]).html())
}

async function processArticle(raw_article: string): Promise<Article> {
    const $ = load(raw_article);

    const img = $('div:first>div:first>ul:first>li:first>div:first>a:first>img:first')
    const iframe = $('div:first>div:first>ul:first>li:first>div:first>iframe:first')
    
    const img_src = img.attr("src")
    const iframe_src = iframe.attr("src")
    
    const article_body = (img_src || iframe_src) ? 'div:first>div:nth-child(2)' : 'div:first>div:first'

    const title_raw = $(`${article_body}>div:first>h2:first>a:first`)
    const link_to_article = title_raw.attr('href')
    assert(link_to_article, "Article doesn't have a link")

    const title = title_raw.text();
    const description = $(`${article_body}>div:first>div:last>p`).text()

    const createdAt: string = $(`${article_body}>div:first>p:first>span:nth-child(3)`).text()
    const updatedAt: string = $(`${article_body}>div:first>p:first>span:nth-child(2)`).text()

    const author = $(`${article_body}>div:first>p:first>span:first>span:first>a:first`)
    const author_link = author.attr('href')
    assert(author_link, "Author doesn't have a link")
    return {
        banner: img_src ? {
            element: img,
            src: img_src
        } as Image : (iframe_src ? {src: iframe_src} as Video : undefined),
        link: link_to_article,
        description: description,
        title: title,
        content: await getArticleContent(link_to_article),
        createdAt: moment(createdAt, "MMMM Do, YYYY").toDate(),
        updatedAt: new Date(updatedAt),
        author: {
            name: author.text(),
            link: author_link
        }
    }
    
}

async function getArticleContent(url: string): Promise<Cheerio<CElement>> {
    const webPage = await axios.get(url)
    const $ = load(webPage.data)
    return $(".post-content:first")
}

export interface Image {
    /** Html element of the image */
    element: Cheerio<CElement>
    /** physical link to the image */
    src: string
}

export interface Video {
    /** physical link to the video */
    src: string;
}

//** Short News Article */
export interface Article {
    /** Media of the banner of the article */
    banner?: Image | Video
    /** Link to the "Read More" */
    link: string
    /** Title of the article */
    title: string
    /** Content of the article */
    description: string

    /** Contents of the article */
    content: Cheerio<CElement>

    /** Article's creation date */
    createdAt: Date

    /** Article's update date*/
    updatedAt: Date

    /** Article's author */
    author: ArticleAuthor
}

export interface ArticleAuthor {
    /** Author's name */
    name: string
    /** Link to the author */
    link: string
}

// async function main() {
//     for (let i = 0; i < 50; i++) {
//         console.log("Page: " + i)
//         for (const { author } of await fetchPage(i))
//             console.log(author.name)
//     }

// } main()
