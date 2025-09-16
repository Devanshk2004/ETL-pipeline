import pandas as pd
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI app
app = FastAPI()

# --- CORS Configuration ---
# This is crucial for allowing your React frontend (on a different port)
# to communicate with this backend.
origins = [
    "http://localhost:3000",  # Default React development server port
    # Add other origins if needed, e.g., your production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    """A simple endpoint to check if the server is running."""
    return {"message": "ETL Backend is running successfully!"}


@app.post("/api/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    """
    This endpoint accepts a CSV file, analyzes it for rows with missing values,
    and returns the column headers and the problematic rows.
    """
    # Ensure the uploaded file is a CSV
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")

    try:
        # Read the file content directly into memory
        contents = await file.read()
        
        # Use pandas to read the CSV data from the in-memory bytes
        df = pd.read_csv(io.BytesIO(contents))

        # Identify rows with any missing values (NaN/Null)
        bad_rows_df = df[df.isnull().any(axis=1)].copy()
        
        # Get the original index for each bad row
        bad_rows_df['original_index'] = bad_rows_df.index

        # Convert the bad rows DataFrame to a list of dictionaries
        bad_rows_list = bad_rows_df.to_dict(orient='records')
        
        # Structure the response data
        response_data = []
        for row in bad_rows_list:
            original_index = row.pop('original_index') # Get and remove the index from the dict
            response_data.append({
                "index": original_index,
                "data": {k: (v if pd.notna(v) else None) for k, v in row.items()} # Clean up NaN values for JSON
            })

        return {
            "columns": df.columns.tolist(),
            "bad_rows": response_data,
        }

    except Exception as e:
        # Handle potential errors during file parsing
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")