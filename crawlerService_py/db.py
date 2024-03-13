import psycopg2
import json

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
    
    def insert_embedding_record(self,bot_id, content, metadata, embedding):
        """Inserts a new record into the embeddings table."""
        if not self.connection:
            raise Exception("Database connection is not established.")
        
        with self.connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO embeddings (bot_id , content , metadata , embedding) VALUES (%s,%s, %s, %s) RETURNING id;",
                (bot_id, content, json.dumps(metadata), embedding)
            )
            inserted_id = cursor.fetchone()[0]
            self.connection.commit()
        
        return inserted_id

# Singleton pattern to ensure only one instance of Database is created
database_instance = Database()
