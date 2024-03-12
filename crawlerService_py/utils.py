from langchain.text_splitter import RecursiveCharacterTextSplitter


def recursive_char_splitter(docs):
    text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False,
    )
    return text_splitter.split_documents(docs)