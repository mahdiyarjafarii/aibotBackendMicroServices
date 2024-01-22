import requests
from bs4 import BeautifulSoup

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

# Example usage:
links_to_crawl = [
    "https://plotset.com/about-us",
    "https://plotset.com/faq"
]

output_file_path = "output.txt"
crawl_and_extract(links_to_crawl, output_file_path)
