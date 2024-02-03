import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import axios from 'axios';
import * as cheerio from 'cheerio';


@Injectable()
export class CrawlerService {

  constructor(
    @Inject('CRAWLER_SERVICE') private readonly client: ClientKafka
  ){}

  //this service for fine availableLink
  async getavailableLink(url:string){

    try{
      let response = await axios.get(url);
      let bodyHTML = response.data;
      let $ = cheerio.load(bodyHTML);
      let links = $('a'); 
      let allFoundURLs = [];
      $(links).each(function(i, link){
          let href = $(link).attr('href')
          if(href[0] === "/"){
              let urlWithoutSlash = href.substring(1);
              href = url + urlWithoutSlash
          }
          allFoundURLs.push(href)
        });


      let uniqueURLs = [...new Set(allFoundURLs)];
 
      return uniqueURLs; 

    }catch(err){
      console.log(err)
    }

   
  }
  //this service for emiit for crawler services
  async sendUrlToCrawler(urlArray:string[]){
    this.client.emit('get_crawler_service', urlArray);
  }


}
