import uvicorn

if __name__ == "__main__":
    # "app.main:app" tells uvicorn where to find the FastAPI instance
    # reload=True makes the server restart when you save code changes
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)