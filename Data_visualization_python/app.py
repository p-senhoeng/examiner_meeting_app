from flask import Flask
import os
from config import Config
from models import db  # 引入数据库模型
from flask_cors import CORS

# 初始化 Flask 应用
app = Flask(__name__)
app.config.from_object(Config)

# 启用 CORS
CORS(app)  # 允许所有来源的跨域请求

# 初始化数据库
db.init_app(app)

# 确保上传文件的存储路径存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 注册 Blueprints
from blueprints.main_page.main_page import main_page_bp
app.register_blueprint(main_page_bp, url_prefix='/main')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 在启动应用时创建所有数据库表
        app.run(debug=True, port=5001)
