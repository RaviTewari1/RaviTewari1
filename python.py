//fetch an arrow format data and a json in a single fetch call in a react application
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from requests_toolbelt.multipart import MultipartEncoder
import pyarrow as pa
import pandas as pd
import io

app = FastAPI()

@app.get("/data")
def get_data():
    # Create JSON data
    json_data = '{"key": "value"}'

    # Create Arrow data
    df = pd.DataFrame({'column1': [1, 2, 3], 'column2': [4, 5, 6]})
    arrow_table = pa.Table.from_pandas(df)
    arrow_buffer = pa.BufferOutputStream()
    writer = pa.ipc.new_file(arrow_buffer, arrow_table.schema)
    writer.write_table(arrow_table)
    writer.close()

    # Prepare Multipart Encoder
    fields = {
        'json': ('json', json_data, 'application/json'),
        'arrow': ('arrow', arrow_buffer.getvalue().to_pybytes(), 'application/vnd.apache.arrow.file'),
    }
    
    # Create MultipartEncoder with fields
    encoder = MultipartEncoder(fields=fields)
    
    # Convert MultipartEncoder to a bytes buffer
    buffer = io.BytesIO(encoder.to_string())

    # Return the StreamingResponse
    return StreamingResponse(content=buffer, media_type='multipart/mixed; boundary={}'.format(encoder.boundary))
