import psycopg2
import json

# Define database connection parameters
db_params = {
    
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
    
    def insert_embedding_record(self, content, metadata, embedding):
        """Inserts a new record into the embeddings table."""
        if not self.connection:
            raise Exception("Database connection is not established.")
        
        with self.connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO embeddings (content, metadata, embedding) VALUES (%s, %s, %s) RETURNING id;",
                (content, json.dumps(metadata), embedding)
            )
            inserted_id = cursor.fetchone()[0]
            self.connection.commit()
        
        return inserted_id

# Singleton pattern to ensure only one instance of Database is created
database_instance = Database()
