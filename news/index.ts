// import type { Announcement } from "./announcements";
import axios from "axios";
import { load } from "cheerio";
import type { Cheerio, Element as CElement } from "cheerio";
const fetchFrom = "https://francisparkerlouisville.org/wyvernbullbtinboard/"
const pageToFetch = (pageNumber: number) => fetchFrom + `/page/${pageNumber}`

/** Fetch the latest article from the bulletin board */
export async function fetchLatest(): Promise<Article> {
    // try {
    const webPage = await axios.get(pageToFetch(0));
    if (webPage.status != 200) {
        throw new Error(`Error: While loading '${fetchFrom}' returned wrong status code. Status code: '${webPage.status}'`)
    }
    const $ = load(webPage.data)
    const raw = $("article:first").html();
    if (!raw) throw new Error("No articles found")
        return processArticle(raw);


    // } catch (err) {
    //     return err;
    // }
}

/** Fetch the whole page of articles from the bulletin board */
export async function fetchPage(pageNumber: number): Promise<Article[]> {
    const arr: Article[] = [];
    const webPage = await axios.get(pageToFetch(pageNumber));
    if (webPage.status != 200) {
        throw new Error(`Error: While loading '${pageToFetch(pageNumber)}' returned wrong status code. Status code: '${webPage.status}'`)
    }
    const $ = load(webPage.data)
    const raw = $("article");
    if (!raw) throw new Error("No articles found")
    await Promise.all(raw.toArray().map(async (element, index) => {
        // console.log("\n\n" + load(element).html() + "\n\n")
        arr.push(await processArticle(load(element).html()))
    }))
    return arr;
}

/** fetch a specific article (0 is latest) */
export async function fetchArticle(articleNumber: number) {
    const articlesOnPage = 6;
    const articleIndex = articleNumber % articlesOnPage
    const pageNumber = (articleNumber - articleIndex) / articlesOnPage;
    // console.log(pageNumber)
    const webPage = await axios.get(pageToFetch(pageNumber));
    if (webPage.status != 200) {
        throw new Error(`Error: While loading '${pageToFetch(pageNumber)}' returned wrong status code. Status code: '${webPage.status}'`)
    }
    const $ = load(webPage.data)
    const raw = $("article");
    if (!raw) throw new Error("No articles found")
    // await Promise.all(raw.toArray().map(async (element, index) => {
    //     // console.log("\n\n" + load(element).html() + "\n\n")
    //     arr.push(await processArticle(load(element).html()))
    // }))
    // return arr;
    return await processArticle(load(raw.toArray()[articleIndex]).html())
}

async function processArticle(raw_article: string): Promise<Article> {
    // console.log(raw_article)
    const $ = load(raw_article);

    const img = $('div:first>div:first>ul:first>li:first>div:first>a:first>img:first')
    const iframe = $('div:first>div:first>ul:first>li:first>div:first>iframe:first')
    // console.log(typeof (iframe.toArray())[0])

    const img_src = img.attr("src")
    const iframe_src = iframe.attr("src")
    // console.log(img_src)
    // console.log(iframe_src)

    // if (!img_src) throw new Error("Image on the webpage doesn't have an src")
    // BUG! For some elements (ex. p12) there is a video instead of image, so everything fails
    const title_raw = (img_src || iframe_src) ? $('div:first>div:nth-child(2)>div:first>h2:first>a:first') : $('div:first>div:first>div:first>h2:first>a:first')
    const link_to_article = title_raw.attr('href')
    // console.log()
    // console.log(img_src)
    // console.log(iframe_src)
    // console.log(link_to_article)
    if (!link_to_article) throw new Error("Article doesn't have a link")

    const title = title_raw.text();
    // BUG! For some elements (ex. p12) there is a video instead of image, so everything fails
    const description = (img_src || iframe_src) ? $('div:first>div:nth-child(2)>div:first>div:last>p').text() : $('div:first>div:first>div:first>div:last>p').text()

    // return {sender: "**Francis Parker**", title: title, content: `${content}\n[Read more...](${link_to_article})`, files: [{attachment: img_src}]}
    return {
        banner: img_src ? {
            element: img,
            src: img_src
        } as Image : (iframe_src ? {src: iframe_src} as Video : undefined),
        link: link_to_article,
        description: description,
        title: title,
        content: await getArticleContent(link_to_article)
    }
    
}

async function getArticleContent(url: string): Promise<Cheerio<CElement>> {
    const $ = load(await axios.get(url))
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

    content: Cheerio<CElement>
}

// export interface ArticleContent {
//     bannner?: Image
//     title: string
//     content: Cheerio<CElement>;
// }


// fetchLatest().then((result) => {
//     // console.log(`Done: ${JSON.stringify(result)}`)
//     console.log(`title: ${result.title}`)
//     console.log(`contents: ${result.content}`)
//     console.log('link to article: ' + result.link)

// }, (err) => {
//     if (err instanceof Error)
//         console.log("err! " + err)
// });
// async function main() {
//     // for (let i = 0; i < 50; i++) {
//     //     console.log("Page: " + i)
//     //     // fetchPage(i).then((result) => {
//     //     for (const { title } of await fetchPage(i)) {
//     //             console.log(title);
//     //     }
//     //     // })
//     // }
//     // console.log((await fetchArticle((14 * 6) + 4)).description)
// }
// main() 
