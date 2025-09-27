import pandas as pd
import io
import os
import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

app = FastAPI()

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

OUTPUT_DIR = "cleaned_files"

@app.get("/")
def read_root():
    return {"message": "ETL Backend is running successfully!"}

@app.post("/api/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        is_bad = df.isnull().any(axis=1)
        bad_rows_df = df[is_bad].copy()
        good_rows_df = df[~is_bad].copy()
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
    columns = payload.get("columns")
    cleaned_rows = payload.get("cleaned_rows")
    if not columns or cleaned_rows is None:
        raise HTTPException(status_code=400, detail="Invalid data provided.")
    try:
        df = pd.DataFrame(cleaned_rows, columns=columns)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"cleaned_{timestamp}.csv"
        output_filepath = os.path.join(OUTPUT_DIR, output_filename)
        df.to_csv(output_filepath, index=False)
        return {"message": "Cleaned file saved successfully!", "filepath": output_filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {e}")

@app.get("/api/get_cleaned_data_info")
async def get_cleaned_data_info(filepath: str = Query(...)):
    safe_filepath = filepath.replace('\\', '/')
    if not os.path.exists(safe_filepath):
        raise HTTPException(status_code=404, detail=f"File not found at: {safe_filepath}")
    try:
        df = pd.read_csv(safe_filepath)
        all_columns = df.columns.tolist()
        numeric_columns = df.select_dtypes(include='number').columns.tolist()
        return {"columns": all_columns, "numeric_columns": numeric_columns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file info: {e}")

@app.get("/api/get_graph_data")
async def get_graph_data(filepath: str = Query(...), x_axis: str = Query(...), y_axis: str = Query(...)):
    safe_filepath = filepath.replace('\\', '/')
    if not os.path.exists(safe_filepath):
        raise HTTPException(status_code=404, detail=f"File not found at: {safe_filepath}")
    try:
        df = pd.read_csv(safe_filepath)
        if x_axis not in df.columns or y_axis not in df.columns:
            raise HTTPException(status_code=400, detail="Invalid columns specified.")
        
        # BUG FIX: Add validation to ensure the Y-axis is a numeric type
        if not pd.api.types.is_numeric_dtype(df[y_axis]):
            raise HTTPException(status_code=400, detail=f"Wrong Input: Y-axis ('{y_axis}') must be a numeric column.")

        if pd.api.types.is_numeric_dtype(df[x_axis]):
            df = df.sort_values(by=x_axis)

        y_data = df[y_axis].fillna(0).tolist()

        chart_data = {
            "labels": df[x_axis].tolist(),
            "data": y_data
        }
        return chart_data
    except Exception as e:
        # Re-raise HTTP exceptions, otherwise wrap other errors
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error fetching graph data: {e}")
