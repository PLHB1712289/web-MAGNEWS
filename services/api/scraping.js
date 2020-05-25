const cheerio = require("cheerio");
const axios = require("axios");

const util = require("util");
const web = "vov.vn";
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getDate = async (url) => {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const timeWrite = $("time").text().split(", ");

  const date = timeWrite[2].split("/");
  const time = timeWrite[1].split(":");

  const day = date[0];
  const month = date[1];
  const year = date[2];

  const hours = time[0];
  const minutes = time[1];

  return new Date(year, month, day, hours, minutes, 0, 0).getTime();
  //return 0;
};
const scrapingVOV = async (category, pageNumber) => {
  if (typeof pageNumber == "undefined") {
    pageNumber = 1;
  }
  const url = `http://${web}/${category}/trang${pageNumber}`;

  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  const story = [];

  $(".story").each(async (index, element) => {
    const title = $(element)
      .find("a")
      .text()
      .replace(/\s\s+/, "")
      .replace("\n", "");
    const link = `http://${web}${$(element).find("a").attr("href")}`;
    let img = $(element).find("img").attr("src");
    if (typeof img != "undefined") {
      if (link.split(category).length >= 2) {
        story.push({
          title: title,
          img: img,
          link: link,
          time: 0,
        });
      }
    }
    await sleep(100);
  });

  return story;
};

const scrapingHomeVOV = async (category) => {
  const url = `http://${web}/${category}/`;

  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  const story = [];

  const dataStory = $(".story");
  for (let i = 0; i < dataStory.length; i++) {
    if (story.length > 3) {
      break;
    }
    let img = $(dataStory[i]).find("img").attr("src");
    if (typeof img != "undefined") {
      const title = $(dataStory[i])
        .find("a")
        .text()
        .replace(/\s\s+/, "")
        .replace("\n", "");
      const link = `http://${web}${$(dataStory[i]).find("a").attr("href")}`;

      if (link.split(category).length >= 2) {
        story.push({
          title: title,
          img: img,
          link: link,
        });
      }
    }
  }

  return story;
};

const scrapingVOVNews = async (url) => {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  const title = $(".cms-title").text();
  const author = $(".cms-author").text();
  const timeWrite = $("time").text();

  const body = [];
  const newsRelated = [];

  $(".cms-body").each((index, element) => {
    $(element)
      .find("img")
      .each((index, e) => {
        let title = $(e).attr("data-desc");

        if (typeof title == "undefined") title = $(e).attr("cms-photo-caption");

        body.push({
          img: {
            title,
            src: $(e).attr("src"),
          },
          paragraph: "",
        });
      });

    let cont = $(element).find("p");
    cont.each((i, e) => {
      //console.log($(e).text() + '\n');
      body.push({
        img: "",
        paragraph: $(e).text().replace("\n", ""),
      });
    });
  });

  $(".stories-style-123 .story").each((index, element) => {
    const img = $(element).find("img").attr("src");
    const link = `/detail?url=http://${web}${$(element)
      .find("a")
      .attr("href")}`;
    const title = $(element).find("a").attr("title");

    newsRelated.push({ img, link, title });
  });

  return { timeWrite, body, title, author, newsRelated };
};

module.exports = { scrapingVOV, scrapingVOVNews, scrapingHomeVOV, getDate };

//scrapingVOVNews("http://vov.vn/the-thao/bong-da/tuan-manh-chia-tay-khanh-hoa-la-vi-hlv-park-hang-seo-1048721.vov");
// getDate(
//   "https://vov.vn/the-thao/bong-da/thung-luoi-2-ban-trong-2-phut-bayern-munich-van-de-bep-frankfurt-1051827.vov"
// ).then((data) => {
//   console.log(data);

//   const d = new Date(data);
//   console.log(d);
// });
