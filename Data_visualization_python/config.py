import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'

    UPLOAD_FOLDER = '/app/static/uploads'
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI') or \
        'mysql+pymysql://root:123456@db:3307/data_processing'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

