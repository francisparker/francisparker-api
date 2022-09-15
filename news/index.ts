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
        throw new Error(`Error: While loading '${fetchFrom}' returned wrong status code. Status code: '${webPage.status}'`)
    }
    const $ = load(webPage.data)
    const raw = $("article");
    let curr;
    raw.toArray().map((element, index) => {
        // console.log("\n\n" + load(element).html() + "\n\n")
        arr.push(processArticle(load(element).html()))
    })
    // if (!raw) throw new Error("No articles found")
        // return processArticle(raw);
    return arr;
}

function processArticle(raw_article: string): Article {
    const $ = load(raw_article);

    const img = $('div:first>div:first>ul:first>li:first>div:first>a:first>img:first')
    
    const img_src = img.attr("src")

    // if (!img_src) throw new Error("Image on the webpage doesn't have an src")
    // BUG! For some elements (ex. p12) there is a video instead of image, so everything fails
    const title_raw = img_src ? $('div:first>div:nth-child(2)>div:first>h2:first>a:first') : $('div:first>div:first>div:first>h2:first>a:first')
    
    const link_to_article = title_raw.attr('href')
    // if (!link_to_article) throw new Error("Article doesn't have a link")

    const title = title_raw.text();
    // BUG! For some elements (ex. p12) there is a video instead of image, so everything fails
    const content = img_src ? $('div:first>div:nth-child(2)>div:first>div:last>p').text() : $('div:first>div:first>div:first>div:last>p').text()

    // return {sender: "**Francis Parker**", title: title, content: `${content}\n[Read more...](${link_to_article})`, files: [{attachment: img_src}]}
    return {
        image: img_src ? {
            element: img,
            src: img_src ? img_src : ''
        } : undefined,
        link: link_to_article ? link_to_article : '',
        content: content,
        title: title
    }
    
}

export interface Image {
    /** Html element of the image */
    element: Cheerio<CElement>
    /** physical link to the image */
    src: string
}

export interface Article {
    /** image of the banner of the article */
    image: Image | undefined
    /** Link to the "Read More" */
    link: string
    /** Title of the article */
    title: string
    /** Content of the article */
    content: string
}

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
//     for (let i = 0; i < 50; i++) {
//         console.log("Page: " + i)
//         // fetchPage(i).then((result) => {
//             for (const { title } of await fetchPage(i)) {
//                 console.log(title);
//             }
//         // })
//     }
// }
// main() 
