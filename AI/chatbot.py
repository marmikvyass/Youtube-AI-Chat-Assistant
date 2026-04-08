from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_cohere import CohereEmbeddings
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough
from langchain_classic.vectorstores import FAISS
from dotenv import load_dotenv
from deep_translator import GoogleTranslator
from youtube_transcript_api.proxies import ProxyConfig
import os 
import requests

load_dotenv()

def ask_AI(video_id, question):
    
    proxy = "http://uazvriyg:k6m7nyzpvz6g@31.59.20.176:6754"
    session = requests.Session()
    session.proxies = {
        "http": proxy,
        "https": proxy
    }

    api = YouTubeTranscriptApi()

    try:
        multiple_languages = [
            "en",  # English
            "hi",  # Hindi
            "es",  # Spanish
            "fr",  # French
            "de",  # German
            "pt",  # Portuguese
            "ru",  # Russian
            "ar",  # Arabic
            "ja",  # Japanese
            "ko",  # Korean
            "zh-Hans",  # Chinese simplified
            "zh-Hant",  # Chinese traditional
            "it",  # Italian
            "nl",  # Dutch
            "tr",  # Turkish
            "pl",  # Polish
            "id",  # Indonesian
            "vi",  # Vietnamese
            "th",  # Thai
            "ta",  # Tamil
            "te",  # Telugu
            "bn",  # Bengali
            "ur",  # Urdu
            "mr",  # Marathi
            "gu",  # Gujarati
            "pa",  # Punjabi
            "ml",  # Malayalam
            "kn",  # Kannada
        ]
        transcript_list = api.fetch(video_id, languages=multiple_languages)
        transcript = " ".join(chunk.text for chunk in transcript_list)
    except TranscriptsDisabled:
        return "No transcript available for this video"
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 1000,
        chunk_overlap = 200
    )
    chunks = splitter.create_documents([transcript])
    
    translated_chunks = []
    
    for chunk in chunks:
        translated_text = GoogleTranslator(
            source='auto',
            target='en'
        ).translate(chunk.page_content)
        
        chunk.page_content = translated_text
        translated_chunks.append(chunk)
        
    
    embeddings = CohereEmbeddings(model='embed-english-v3.0')
    
    vector_store = FAISS.from_documents(translated_chunks, embeddings)
    
    retrievers = vector_store.as_retriever(
        type='similarity',
        kwargs={'k' : 4}
    )
    
    llm = ChatGroq(model='openai/gpt-oss-120b')
    
    prompt = PromptTemplate(
        template=
        '''
            Answer ONLY from provided transcript.
            If not found find it on your own or just response according to your knowledge 

            Context:
            {context}

            Question:
            {question}
        ''',
        input_variables=['context', 'question']
    )
    
    def format_docs(retrieved_docs):
        context = '\n\n'.join(docs.page_content for docs in retrieved_docs)
        return context
    
    parallel_chain = RunnableParallel(
        {
            'context' : retrievers | RunnableLambda(format_docs),
            'question' : RunnablePassthrough()
        }
    )
    
    parser = StrOutputParser()
    
    main_chain = parallel_chain | prompt | llm | parser
    
    return main_chain.invoke(question)


