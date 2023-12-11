import pandas as pd
import numpy as np
from fastapi import FastAPI, APIRouter, HTTPException

app = FastAPI()
router = APIRouter()

# read in dataframes
df = pd.concat([
    pd.read_csv('data/tracking_week_1.csv'),
    pd.read_csv('data/tracking_week_2.csv'),
    pd.read_csv('data/tracking_week_3.csv'),
    pd.read_csv('data/tracking_week_4.csv'),
    pd.read_csv('data/tracking_week_5.csv'),
    pd.read_csv('data/tracking_week_6.csv'),
    pd.read_csv('data/tracking_week_7.csv'),
    pd.read_csv('data/tracking_week_8.csv'),
    pd.read_csv('data/tracking_week_9.csv'),
])

@router.get("/fetchArray")
def get_play_data(play_id: int, game_id: int):
    try:
        play_data = query_data(play_id, game_id)
        if play_data.empty:
            raise HTTPException(status_code=404, detail="Play not found")

        # Convert DataFrame to a Python dict
        play_data_dict = play_data.to_dict(orient='records')

        # Print the data to the console
        print("Data being returned:", play_data_dict)

        # Return the data
        return play_data_dict
    except Exception as e:
        # Log the exception (consider using a logging library)
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


def query_data(play_id, game_id):
    query_frame = df.loc[(df['gameId'] == game_id) & (df['playId'] == play_id)]

    # replacing the NaN for the ball with 1
    query_frame = query_frame.replace([np.inf, -np.inf, np.nan], 1)
    return query_frame

# Include the router with a prefix (optional)
app.include_router(router, prefix="/api")
