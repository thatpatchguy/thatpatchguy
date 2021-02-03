# Importing Dependencies
import os
from bs4 import BeautifulSoup as bs
import requests
from flask import Flask, jsonify
from collections import Counter


def get_them(title, artist):
    url = 'https://www.e-chords.com/chords' + '/' + artist + '/' + title

    response = requests.get(url)
    soup = bs(response.text, 'html.parser')

    core = soup.find('pre', class_='core')

    chords_html = core.find_all('u')
    chords = []
    for chord in chords_html:
        chords.append(chord.text)
    
    intro_chords = chords[:4]
    count = Counter(chords)
    dict1 = [{"intro_chords": intro_chords}]
    dict2 = [{"all_chords": [count]}]
    data = []
    data.append(dict1)
    data.append(dict2)

    return jsonify(data)
