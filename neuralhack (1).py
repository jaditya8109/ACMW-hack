# -*- coding: utf-8 -*-
"""neuralhack.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1sxenOLuuzAo1RS6hQufdk0d7ue71qw-W
"""

import numpy as np
import pandas as pd
import spacy
from sklearn.feature_extraction.text import CountVectorizer,TfidfVectorizer
from sklearn.metrics import accuracy_score 
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split

data=pd.read_csv('/content/drive/MyDrive/IMDB Dataset.csv')

data.head()

data['sentiment'].unique()

data['review'] = data['review'].str.replace('<br />', ' ')
data['review'] = data['review'].str.replace('\d+', '')
data['review'] = data['review'].str.lower()
data['review'] = data['review'].str.replace('.', '')
data['review'] = data['review'].str.replace('-', '')

data.head()

import spacy
nlp = spacy.load("en_core_web_sm")
import string
punct=string.punctuation
from spacy.lang.en.stop_words import STOP_WORDS
stopwords = list(STOP_WORDS)

data['review'].values

for i in range(50000):
  temp = nlp(data['review'][i])
  tokens = []
  for token in temp:
    if token.lemma_ != '-PRON-':
      x=token.lemma_.lower().strip()
    else:
      x=token.lower_
  if x not in punct and x not in stopwords:
      tokens.append(x)
  st="".join(tokens)
  data['review'][i]=st

data.head()

tfidf = TfidfVectorizer(stop_words='english')
svm = LinearSVC()
steps = [('tfidf',tfidf),('svm',svm)]
pipe = Pipeline(steps)

X = data['review']
y = data['sentiment']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.3)

print(X_train.shape,y_test.shape)

pipe.fit(X_train,y_train)

pipe.predict((["This was a very good movie. Acting was wonderful"]))

import pickle

pickle.dump(pipe,open('/content/drive/MyDrive/moviemodelpkl.pkl','wb'))

pipe

y_pred = pipe.predict(X_test)

from sklearn.metrics import confusion_matrix, classification_report, accuracy_score

print(classification_report(y_test,y_pred))
print(confusion_matrix(y_test,y_pred))

pipe.predict((['The movie is very good.','The movie is very bad.']))[1]

!pip install flask-ngrok

from flask import Flask, jsonify, request
from flask_ngrok import run_with_ngrok
app = Flask(__name__)
run_with_ngrok(app)


@app.route("/", methods=["GET","POST"])
def home():
  review=request.args.get('query')
  review = review.replace('<br />', ' ')
  review = review.replace('\d+', '')
  review = review.lower()
  score=pipe.predict(([review]))[0]
  return score

pipe=pickle.load(open('/content/moviemodelpkl (1).pkl','rb'))

!pip install flask

app.run()

