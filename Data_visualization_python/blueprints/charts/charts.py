from flask import Blueprint, request, jsonify
from pandas.io.sql import table_exists
from sqlalchemy import func
from models import db
from sqlalchemy.sql import text
from utils.files_utils import FilesHandler
from utils.db_helpers import get_original_filename, get_table_columns, get_columns_data

# 创建一个蓝图用于charts相关的路由
charts_bp = Blueprint('charts', __name__)


@charts_bp.route('/query_table_data', methods=['POST'])
def query_table_data():
    """
    接受前端上传的 CSV 文件名和要查询的列名，返回对应的数据库表内容
    列名可以是单个字符串或字符串列表
    """
    data = request.json
    filename = data.get('filename')
    requested_columns = data.get('columns')

    # 使用文件名（去掉扩展名）作为数据库表名，并清理表名
    table_name = FilesHandler.clean_table_name(filename.lower())

    if not table_exists(table_name, db.engine):
        return jsonify({"error": "Table not found"}), 404

    try:
        # 处理输入：如果是单个字符串，转换为列表
        if isinstance(requested_columns, str):
            requested_columns = [requested_columns]

        # 获取表的列映射
        columns = get_table_columns(table_name, db.engine)

        # 创建原始列名到短列名的映射
        column_mapping = {col['original']: col['short'] for col in columns}

        # 找到请求的列名对应的短列名
        short_column_names = []
        for col in requested_columns:
            short_name = column_mapping.get(col)
            if short_name:
                short_column_names.append(short_name)
            else:
                # 如果找不到对应的短列名，可能是因为列名不存在，这里我们选择忽略它
                print(f"Warning: Column '{col}' not found in the table.")

        # 如果没有有效的列名，返回错误
        if not short_column_names:
            return jsonify({"error": "No valid columns specified"}), 400

        # 使用短列名查询数据
        result_data = get_columns_data(table_name, short_column_names, db.engine)

        # 将数据按列重新组织
        column_grouped_data = {}
        reverse_mapping = {v: k for k, v in column_mapping.items()}

        for short_name in short_column_names:
            original_name = reverse_mapping.get(short_name, short_name)
            column_grouped_data[original_name] = [row[short_name] for row in result_data]

        return jsonify({
            "table_name": filename,
            "data": column_grouped_data
        }), 200

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500