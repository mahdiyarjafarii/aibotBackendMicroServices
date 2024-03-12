import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class CrawlerService {
  constructor(@Inject('KAFKA_SERVICE') private readonly client: ClientKafka) {}

  //this service for fine availableLink
  async getavailableLink(url: string) {
    try {
      const response = await axios.get(url);
      const bodyHTML = response.data;
      const $ = cheerio.load(bodyHTML);
      const links = $('a');
      const allFoundURLs = [];
      $(links).each(function (i, link) {
        let href = $(link).attr('href');
        if (href[0] === '/') {
          // useful for scenarios that have / at the end of string
          const urlWithoutSlash = href.substring(1);
          href = url + href;
        }
        allFoundURLs.push(href);
      });

      const uniqueURLs = [...new Set(allFoundURLs)];

      return uniqueURLs;
    } catch (err) {
      console.log(err);
    }
  }
  //this service for emiit for crawler services
  async sendUrlToCrawler(urlArray: string[]) {
    this.client.emit('aqkjtrhb-default', urlArray);
  }
}
