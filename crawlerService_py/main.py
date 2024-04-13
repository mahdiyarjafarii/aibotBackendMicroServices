from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from confluent_kafka import Consumer
from db import database_instance
import socket
import json
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
from bs4 import BeautifulSoup as Soup
from utils import recursive_char_splitter
from embed import create_document_embedding

import os

load_dotenv()

consumer_conf = {'bootstrap.servers': 'dory.srvs.cloudkafka.com:9094',
                 'security.protocol': 'SASL_SSL',
                 'sasl.mechanism': 'SCRAM-SHA-512',
                 'sasl.username': os.getenv("KAFKA_USERNAME"),
                 'sasl.password': os.getenv("KAFKA_PASS"),
                 'group.id': os.getenv("KAFKA_GROUP_ID"),
                 'auto.offset.reset': 'smallest'}


def crawl_and_extract(bot_id,links):
    collection_id = database_instance.create_or_return_collection_uuid(bot_id)
    
    for link in links:
        print("Now in link:" , link)
        try:
            # page = requests.get(link)
            # soup = BeautifulSoup(page.text, 'html.parser')
            # text = soup.get_text(separator='\n', strip=True)
            # print(text)
            
            
            loader = RecursiveUrlLoader(
                url=link, max_depth=1, extractor=lambda x: Soup(x, "html.parser").text
                )
            docs = loader.load();
            
            chunked_docs = recursive_char_splitter(docs)
            
            embedded_chunks = create_document_embedding(chunked_docs)
            
            for index, chunk in enumerate(chunked_docs):
                database_instance.insert_embedding_record(bot_id=bot_id,
                                        content = chunk.page_content,
                                        metadata = chunk.metadata,
                                        embedding = embedded_chunks[index],
                                        collection_id = collection_id
                                        )
            

            print(f"Successfully crawled and extracted from: {link}")
        except Exception as e:
            print(f"Error crawling {link}: {e}")


def consume_urls(consumer, topic):
    consumer.subscribe([topic])

    while True:
        msg = consumer.poll(1.0)

        if msg is None:
            continue
        if msg.error():
            print("Consumer error: {}".format(msg.error()))
            continue

        received_msg = msg.value()
        msg_obj = json.loads(received_msg)
        
        url_list = msg_obj['urlArray']
        bot_id = msg_obj['botId']
        
        print(f'URLs received for Bot: {bot_id}')
        print(f'Received URLs from Kafka: {url_list}')

        crawl_and_extract(bot_id,url_list)


if __name__ == "__main__":
    database_instance.connect();

    # data = database_instance.fetch_data("SELECT * FROM BOTS;");
    # for row in data:
    #     print(row)

    consumer = Consumer(consumer_conf)

    consume_urls(consumer, 'aqkjtrhb-default')

    # with database_instance as db:
    #     db.execute_query("SELECT * FROM bots")
    #     data = db.fetch_data("SELECT * FROM bots")
    #     for row in data:
    #         print(row)
    consumer.close()
