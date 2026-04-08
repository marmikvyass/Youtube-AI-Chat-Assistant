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
import yt_dlp
import requests
import re
load_dotenv()

def ask_AI(video_id, question):
    def get_transcript(video_id):
        url = f"https://www.youtube.com/watch?v={video_id}"
        ydl_opts = {
            "skip_download": True,
            "writesubtitles": True,
            "writeautomaticsub": True,
            "subtitlesformat": "vtt",
            "quiet": True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
        subtitles = info.get("subtitles") or info.get("automatic_captions")
        if not subtitles:
            return 'No transcript found'
        
        lang = list(subtitles.keys())[0]
        subtitle_url = subtitles[lang][0]["url"]
        
        response = requests.get(subtitle_url)
        return response.text
        
        
    transcript = get_transcript(video_id)
    if not transcript:
        return "No transcript available for this video"
    transcript = re.sub(r'\d+:\d+:\d+\.\d+ --> .*', '', transcript)
    transcript = re.sub(r'<.*?>', '', transcript)
    transcript = transcript.replace('\n', ' ')
    
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


