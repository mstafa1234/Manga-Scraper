import pptr from "puppeteer";
import fetch from "node-fetch";
import "dotenv/config";

async function getLinks() {
  const browser = await pptr.launch();
  const page = await browser.newPage();
  await page.goto("https://vagmanga.com/");

  const linkhandle = await page.$(".su-posts");
  const nodes = await linkhandle.$$eval("a", (nodes) => {
    let links = [];
    nodes.map((n) => links.push({ title: n.innerText, link: n.href }));
    return links;
  });
  getData(nodes);
  await browser.close();
}

let links = [];

function getData(nodes) {
  links = nodes;
  postComics(links);
}

getLinks();

async function postComics(links) {
  const browser = await pptr.launch();
  const page = await browser.newPage();
  for (const link of links) {
    await page.goto(link.link);
    const imagehandle = await page.$(".entry-content");
    const nodes = await imagehandle.$$eval("img", (nodes) => {
      let images = [];
      nodes.map((n) => images.push(n.src));
      return images;
    });
    let imgs = "";
    nodes.forEach((img) => {
      imgs += `<img src='${img}' /></br>`;
    });
    sendData(imgs);
  }

  await browser.close();
}

// fetch("https://ww2.read-beastarsmanga.com/wp-json/wp/v2/comics")
//   .then(function (response) {
//     return response.json();
//   })
//   .then(function (posts) {
//     console.log(posts);
//   });

function sendData(data) {
  fetch("https://ww2.read-beastarsmanga.com/wp-json/jwt-auth/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },

    body: JSON.stringify({
      username: process.env.WP_USERNAME,
      password: process.env.WP_PASSWORD,
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (user) {
      addPost(user.token, data);
    });
}

function addPost(token, data) {
  fetch("https://ww2.read-beastarsmanga.com/wp-json/wp/v2/comics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: "test",
      content: data,
      status: "publish",
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (post) {
      console.log("ok");
    });
}
