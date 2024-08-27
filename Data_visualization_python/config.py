import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static/uploads')
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123456@localhost:3306/data_processing'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
