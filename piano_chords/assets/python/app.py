
from flask import Flask

import get_songs, get_chords
app = Flask(__name__)

@app.route("/")
def welcome():
    return(f"Welcome, you shouldn't see this")

@app.route("/scrape/<title>/<artist>")
def scrape_chords(title, artist):
    chords = get_chords.get_them(title, artist)
    return(chords)

@app.route("/get_songs")
def song_list():
    songs = get_songs.get_em()
    return(songs)

if __name__ == "__main__":
    app.run(debug=False)