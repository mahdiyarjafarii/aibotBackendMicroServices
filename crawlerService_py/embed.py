from langchain_openai import OpenAIEmbeddings
import os

key=os.getenv("OPENAI_API_KEY")
print(key)

embeddings_model = 

def create_document_embedding(docs):
    docs_text=[]
    
    
    for doc in docs:
        docs_text.append(doc.page_content)
        
    
    embeddings = embeddings_model.embed_documents(
    docs_text
    )
    return embeddings
