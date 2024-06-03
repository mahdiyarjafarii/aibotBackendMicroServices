from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

embeddings_model = OpenAIEmbeddings()

def create_document_embedding(docs):
    docs_text=[]
    
    
    for doc in docs:
        docs_text.append(doc.page_content)
        
    
    embeddings = embeddings_model.embed_documents(
    docs_text
    )
    return embeddings
