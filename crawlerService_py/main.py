import requests
from bs4 import BeautifulSoup
from confluent_kafka import Consumer

consumer_conf = {
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'crawler-servicePy-group',
    'auto.offset.reset': 'earliest'
}

def crawl_and_extract(links, output_file):
    with open(output_file, 'w', encoding='utf-8') as file:
        for link in links:
            try:
                page = requests.get(link)
                soup = BeautifulSoup(page.text, 'html.parser')
                text = soup.get_text(separator='\n', strip=True)
                file.write(f"URL: {link}\n")
                file.write(text)
                file.write('\n\n' + '-'*50 + '\n\n')
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
         
        url_list = msg.value().decode('utf-8').split('\n')  # Assuming URLs are separated by newlines
        print(f'Received URLs from Kafka: {url_list}')
        print(type(url_list))
        
        output_file_path = "output.txt"
        crawl_and_extract(url_list, output_file_path)




consumer = Consumer(consumer_conf)


consume_urls(consumer, 'get_crawler_service')

consumer.close()

