import psycopg2
import json
import uuid


# Define database connection parameters
db_params = {
    "dbname": "ai",
    "user": "postgres",
    "password": "w2CF93g9Ty",
    "host": "stream.plotset.com",
    "port": "5432"
}

class Database:
    def __init__(self):
        self.connection = None

    def connect(self):
        """Establishes a connection to the database."""
        print("Database connection initialized !")
        self.connection = psycopg2.connect(**db_params)

    def disconnect(self):
        """Closes the connection to the database."""
        if self.connection:
            self.connection.close()
            self.connection = None

    def execute_query(self, query):
        """Executes an SQL query on the database."""
        with self.connection.cursor() as cursor:
            cursor.execute(query)

    def fetch_data(self, query):
        """Fetches data from the database using the provided query."""
        with self.connection.cursor() as cursor:
            cursor.execute(query)
            return cursor.fetchall()
        
    def create_or_return_collection_uuid(self,bot_id):
        if not self.connection:
            raise Exception("Database connection is not established.")
        
        with self.connection.cursor() as cursor:
            cursor.execute(
            """
            SELECT uuid FROM langchain_pg_collection WHERE name = %s;
            """,
            (bot_id,)
            )
            existing_uuid = cursor.fetchone()
            
            if existing_uuid:
                collection_uuid = existing_uuid[0]
            else:
                collection_uuid = str(uuid.uuid4())
                cursor.execute(
                """
                INSERT INTO langchain_pg_collection (name, cmetadata, uuid)
                VALUES (%s, %s, %s)
                RETURNING uuid;
                """,
                (bot_id, None, collection_uuid)
                )
                collection_uuid = cursor.fetchone()[0]
            
            self.connection.commit()
        
            return collection_uuid 
    
    def insert_embedding_record(self,bot_id, content, metadata, embedding,collection_id):
        """Inserts a new record into the embeddings table."""
        if not self.connection:
            raise Exception("Database connection is not established.")
        
        with self.connection.cursor() as cursor:
            chunck_uuid = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO langchain_pg_embedding (collection_id , document , cmetadata , embedding , uuid) VALUES (%s,%s, %s, %s , %s) RETURNING uuid;",
                (collection_id, content, json.dumps(metadata), embedding , chunck_uuid)
            )
            inserted_id = cursor.fetchone()[0]
            self.connection.commit()
        
        return inserted_id

# Singleton pattern to ensure only one instance of Database is created
database_instance = Database()
