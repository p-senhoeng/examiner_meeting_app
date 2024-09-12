import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static/uploads')
<<<<<<< HEAD
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:Zlw970130@localhost:3306/data_processing'
=======
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123456@localhost:3306/data_processing'
>>>>>>> 9ce6666fe9a7a17ac1af3fe3ad82a21943a63089
    SQLALCHEMY_TRACK_MODIFICATIONS = False
