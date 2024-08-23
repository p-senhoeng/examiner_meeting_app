from flask import Blueprint, render_template

# 定义 Blueprint
main_bp = Blueprint('main', __name__)

# 定义路由
@main_bp.route('/index')
def index():
    return render_template('index.html')
