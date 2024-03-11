from db import database_instance

if __name__ == "__main__":
    # Define your SQL query
    sql_query = "SELECT * FROM bots"
    
    # Connect to the database
    database_instance.connect()
    
    # Execute SQL query
    database_instance.execute_query(sql_query)
    
    # Fetch and print data
    rows = database_instance.fetch_data(sql_query)
    for row in rows:
        print(row)
    
    # Disconnect from the database
    database_instance.disconnect()