import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';


@Injectable()
export class CrawlerService {
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
       return allFoundURLs; 

    }catch(err){
      console.log(err)
    }

   
  }
}
