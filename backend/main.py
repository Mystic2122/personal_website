import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://mystic2122.github.io",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class QueryRequest(BaseModel):
    query: str


@app.get("/")
def root():
    return {"message": "LeBron API is running"}


@app.get("/db-test")
def db_test():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT DATABASE()")
    database = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) FROM pbp")
    count = cursor.fetchone()

    cursor.close()
    connection.close()

    return {
        "database": database,
        "pbp_count": count
    }


@app.get("/api/games")
def get_games():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM game
        LIMIT 20
    """)

    games = cursor.fetchall()

    cursor.close()
    connection.close()

    return games


@app.post("/api/query")
def run_query(request: QueryRequest):
    query = request.query.strip()
    normalized_query = re.sub(r"^\s*(?:--[^\n]*\n|/\*.*?\*/\s*)*", "", query, flags=re.DOTALL)

    if not normalized_query.lower().startswith(("select ", "select\n", "with ", "with\n")):
        raise HTTPException(status_code=400, detail="Only SELECT queries are allowed.")
    if ";" in query.rstrip(";"):
        raise HTTPException(status_code=400, detail="Only one SQL statement is allowed.")

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(query.rstrip(";"))
        rows = cursor.fetchmany(101)
        if len(rows) > 100:
            cursor.fetchall()
            raise HTTPException(
                status_code=400,
                detail="Query returned more than 100 rows. Add a LIMIT clause (e.g. LIMIT 100) and try again.",
            )
        return rows
    finally:
        cursor.close()
        connection.close()