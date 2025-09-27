import pandas as pd
import io
import os
import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

# Initialize the FastAPI app
app = FastAPI()

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    """A simple endpoint to check if the server is running."""
    return {"message": "ETL Backend is running successfully!"}


@app.post("/api/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    """
    Analyzes a CSV for rows with missing values. It NO LONGER saves the original file.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Separate good rows and bad rows
        is_bad = df.isnull().any(axis=1)
        bad_rows_df = df[is_bad].copy()
        good_rows_df = df[~is_bad].copy()

        # Format bad rows with original index
        bad_rows_df['original_index'] = bad_rows_df.index
        bad_rows_list = bad_rows_df.to_dict(orient='records')
        
        formatted_bad_rows = []
        for row in bad_rows_list:
            original_index = row.pop('original_index')
            formatted_bad_rows.append({
                "index": original_index,
                "data": {k: (v if pd.notna(v) else None) for k, v in row.items()}
            })

        return {
            "columns": df.columns.tolist(),
            "bad_rows": formatted_bad_rows,
            "good_rows": good_rows_df.to_dict(orient='records'),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

@app.post("/api/save_cleaned_data")
async def save_cleaned_data(payload: Dict[str, Any] = Body(...)):
    """
    Receives the final clean data and saves it to a new CSV file in the 'cleaned_files' folder.
    """
    columns = payload.get("columns")
    cleaned_rows = payload.get("cleaned_rows")
    
    if not columns or cleaned_rows is None:
        raise HTTPException(status_code=400, detail="Invalid data provided.")

    try:
        df = pd.DataFrame(cleaned_rows, columns=columns)
        
        # Create the output directory if it doesn't exist
        output_dir = "cleaned_files" # Renamed for clarity
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate a unique filename
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"cleaned_{timestamp}.csv"
        output_filepath = os.path.join(output_dir, output_filename)
        
        # Save the DataFrame to a new CSV file
        df.to_csv(output_filepath, index=False)
        
        return {"message": "Cleaned file saved successfully!", "filepath": output_filepath}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {e}")