import requests
from bs4 import BeautifulSoup
from confluent_kafka import Consumer
from db import database_instance
import socket
import json

consumer_conf = {'bootstrap.servers': 'dory.srvs.cloudkafka.com:9094',
                 'security.protocol': 'SASL_SSL',
                 'sasl.mechanism': 'SCRAM-SHA-512',
                 'sasl.username': 'aqkjtrhb',
                 'sasl.password': 'JSY-cpUfbH6qH5pt2DxbFriMo-tTgygV',
                 'group.id': 'aqkjtrhb-foo',
                 'auto.offset.reset': 'smallest'}


def crawl_and_extract(links):
    for link in links:
        print("Now in link:" , link)
        try:
            page = requests.get(link)
            soup = BeautifulSoup(page.text, 'html.parser')
            text = soup.get_text(separator='\n', strip=True)
            print(text)
            # file.write(f"URL: {link}\n")
            # file.write(text)
            # file.write('\n\n' + '-' * 50 + '\n\n')
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
        url_list = json.loads(received_msg)
        print(f'Received URLs from Kafka: {url_list}')

        crawl_and_extract(url_list)


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
