# Importing Dependencies
import os
from bs4 import BeautifulSoup as bs
import requests
from flask import Flask, jsonify

def get_em():
    url = 'https://www.e-chords.com/chords'

    response = requests.get(url)

    soup = bs(response.text, 'html.parser')
    songs = soup.find_all('div', class_='track')

    data = []
    for song in songs:
        
        title = song.find('p', class_='nome-musica').text
        artist = song.find('p', class_='nome-artista').text
        var = {'title': title, 'artist': artist}
        data.append(var)

    return jsonify(data)

if __name__ == "__main__":
    get_em()