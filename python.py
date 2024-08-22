from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
from requests_toolbelt.multipart import MultipartEncoder
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd
import io

app = FastAPI()

@app.get("/data")
def get_data():
    # Create JSON data
    json_data = '{"key": "value"}'
    
    # Create DataFrame and convert it to Arrow Table
    df = pd.DataFrame({'column1': [1, 2, 3], 'column2': [4, 5, 6]})
    arrow_table = pa.Table.from_pandas(df)
    
    # Prepare Arrow stream with LZ4 compression
    arrow_buffer = io.BytesIO()
    with pa.ipc.RecordBatchStreamWriter(arrow_buffer, arrow_table.schema, options=pa.ipc.IpcWriteOptions(compression="lz4")) as writer:
        writer.write_table(arrow_table)
    
    # Reset the buffer position to the beginning
    arrow_buffer.seek(0)
    
    # Prepare Multipart Encoder
    fields = {
        'json': ('json', json_data, 'application/json'),
        'arrow': ('arrow', arrow_buffer, 'application/vnd.apache.arrow.stream'),
    }
    
    encoder = MultipartEncoder(fields=fields)
    
    # Return StreamingResponse
    return StreamingResponse(content=encoder, media_type=f'multipart/mixed; boundary={encoder.boundary}')
